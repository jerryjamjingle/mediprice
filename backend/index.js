require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const zipcodes = require('zipcodes');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

pool.connect((err, client, release) => {
  if (err) { console.error('DB connection error:', err.message); }
  else { console.log('DB connected successfully!'); release(); }
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

app.get('/', (req, res) => {
  res.json({ message: 'MedExpense API is running!' });
});
// Keep-alive endpoint
app.get('/ping', (req, res) => {
    res.json({ status: 'alive', timestamp: new Date().toISOString() });
  });
app.get('/search', async (req, res) => {
    const { procedure, zip, cpt } = req.query;
    
    // Allow search by either procedure OR cpt code (at least one required)
    if ((!procedure || procedure.trim() === '') && (!cpt || cpt.trim() === '')) {
      return res.status(400).json({ error: 'Procedure name or CPT code required' });
    }
  
    try {
      let queryText = `
        SELECT pr.name, pr.address, pr.city, pr.state, pr.zip,
  pr.latitude, pr.longitude, pr.phone, pr.website, pr.hours,
  p.procedure_name, p.cpt_code,
  pc.gross_charge, pc.discounted_cash
        FROM prices pc
        JOIN providers pr ON pc.provider_id = pr.id
        JOIN procedures p ON pc.procedure_id = p.id
        WHERE 1=1
        AND (pc.discounted_cash >= 10 OR pc.discounted_cash < 1)
        AND (
          p.cpt_code ~ '^[0-9]{5}$'
          OR p.cpt_code ~ '^[0-9]{4}T$'
          OR p.cpt_code ~ '^[0-9]{4}U$'
        )
      `;
      
      let queryParams = [];
      
      // Add procedure name filter if provided
      // Remove spaces and hyphens for flexible matching
      if (procedure && procedure.trim()) {
        const words = procedure.trim().split(/[\s-]+/).filter(w => w.length > 0);
        words.forEach(word => {
          queryParams.push(`%${word.toLowerCase()}%`);
          queryText += ` AND LOWER(p.procedure_name) LIKE $${queryParams.length}`;
        });
      }
      
      // Add CPT code filter if provided
      if (cpt && cpt.trim()) {
        queryParams.push(`%${cpt.trim()}%`);
        queryText += ` AND p.cpt_code LIKE $${queryParams.length}`;
      }

      
      
      queryText += ` ORDER BY pc.discounted_cash ASC`;
      
      const result = await pool.query(queryText, queryParams);
      let rows = result.rows;
  
      // Distance calculation logic (if ZIP provided)
      if (zip && zip.trim()) {
        const zipData = zipcodes.lookup(zip.trim());
        if (zipData) {
          const userLat = zipData.latitude;
          const userLng = zipData.longitude;
          rows = rows.map(r => {
            const providerLat = parseFloat(r.latitude);
            const providerLng = parseFloat(r.longitude);
            const distance = haversine(userLat, userLng, providerLat, providerLng);
            return { ...r, distance: distance.toFixed(1) };
        }).filter(r => parseFloat(r.distance) <= parseFloat(req.query.radius || 100))
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        }
      }
  
      res.json(rows);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/compare-procedure', async (req, res) => {
    const { name, cpt } = req.query;
  
    if (!name && !cpt) {
      return res.status(400).json({ error: 'Procedure name or CPT code required' });
    }
  
    try {
      // EXACT matches - this procedure across all hospitals
      let exactQuery = `
        SELECT pr.name as hospital_name, pr.address, pr.city, pr.state,
               pr.latitude, pr.longitude,
               p.procedure_name, p.cpt_code,
               MIN(pc.discounted_cash) as discounted_cash
        FROM prices pc
        JOIN providers pr ON pc.provider_id = pr.id
        JOIN procedures p ON pc.procedure_id = p.id
        WHERE (pc.discounted_cash >= 10 OR pc.discounted_cash < 1)
      `;
  
      let exactParams = [];
  
      if (name) {
        exactParams.push(name);
        exactQuery += ` AND p.procedure_name = $${exactParams.length}`;
      }
      if (cpt && cpt.trim()) {
        exactParams.push(cpt.trim());
        exactQuery += ` AND p.cpt_code = $${exactParams.length}`;
      }
  
      exactQuery += ` GROUP BY pr.name, pr.address, pr.city, pr.state, pr.latitude, pr.longitude, p.procedure_name, p.cpt_code
                     ORDER BY discounted_cash ASC`;
  
      const exactResult = await pool.query(exactQuery, exactParams);
  
      // SIMILAR matches - fuzzy name match, excludes exact matches
      const words = name ? name.split(' ').filter(w => w.length > 3) : [];
      let similarRows = [];
  
      if (words.length > 0) {
        let similarQuery = `
          SELECT pr.name as hospital_name, pr.address, pr.city, pr.state,
                 p.procedure_name, p.cpt_code,
                 MIN(pc.discounted_cash) as discounted_cash
          FROM prices pc
          JOIN providers pr ON pc.provider_id = pr.id
          JOIN procedures p ON pc.procedure_id = p.id
          WHERE (pc.discounted_cash >= 10 OR pc.discounted_cash < 1)
          AND p.procedure_name != $1
        `;
  
        let similarParams = [name];
  
        words.forEach((word, i) => {
          similarParams.push(`%${word}%`);
          similarQuery += ` AND LOWER(p.procedure_name) LIKE LOWER($${similarParams.length})`;
        });
  
        similarQuery += ` GROUP BY pr.name, pr.address, pr.city, pr.state, p.procedure_name, p.cpt_code
                          ORDER BY discounted_cash ASC
                          LIMIT 30`;
  
        const similarResult = await pool.query(similarQuery, similarParams);
        similarRows = similarResult.rows;
      }
  
      res.json({
        exact: exactResult.rows,
        similar: similarRows
      });
  
    } catch (err) {
      console.error('Compare procedure error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // PROCEDURES TAB — clean CPT procedures only
app.get('/hospital-procedures', async (req, res) => {
  const { hospital } = req.query;
  if (!hospital) return res.status(400).json({ error: 'Missing hospital param' });

  try {
    const result = await pool.query(`
      SELECT pr.procedure_name, MIN(pc.discounted_cash) as price
      FROM prices pc
      JOIN providers pv ON pc.provider_id = pv.id
      JOIN procedures pr ON pc.procedure_id = pr.id
      WHERE LOWER(pv.name) = LOWER($1)
        AND (pc.discounted_cash >= 10 OR pc.discounted_cash < 1)
        AND (
          pr.cpt_code ~ '^[0-9]{5}$'
          OR pr.cpt_code ~ '^[0-9]{4}T$'
          OR pr.cpt_code ~ '^[0-9]{4}U$'
        )
        AND NOT (
          pr.procedure_name ~* '[0-9]+ mg'
          OR pr.procedure_name ILIKE '% tab %'
          OR pr.procedure_name ILIKE '% tab[0-9]%'
          OR pr.procedure_name ILIKE '% cap [0-9]%'
          OR pr.procedure_name ILIKE '%noncdm%'
          OR pr.procedure_name ILIKE '%lchg %'
          OR pr.procedure_name ILIKE '% soln%'
          OR pr.procedure_name ILIKE '% oint%'
          OR pr.procedure_name ILIKE '%suppos%'
          OR pr.procedure_name ILIKE '%ndc description%'
          OR pr.procedure_name ILIKE '% inj [0-9]%'
          OR pr.procedure_name ILIKE '% inj[0-9]%'
        )
      GROUP BY pr.procedure_name
      ORDER BY MIN(pc.discounted_cash) ASC
    `, [hospital]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TOTAL STAY TAB — DRG bundle costs
app.get('/hospital-drgs', async (req, res) => {
  const { hospital, drgs } = req.query;
  if (!hospital) return res.status(400).json({ error: 'Missing hospital param' });

  const noDrgData = [
    'ssm health depaul hospital',
    'ssm health saint louis university hospital',
    'ssm health st. clare hospital',
    'ssm health st. joseph hospital',
    'ssm health st. joseph hospital st. charles',
    'ssm health st. joseph hospital wentzville',
    'ssm health st. mary\'s hospital',
    'anderson hospital',
    'gateway regional medical center',
    'saint anthonys hospital',
    'hshs st. joseph\'s hospital breese'
  ];

  if (noDrgData.includes(hospital.toLowerCase())) {
    return res.json([]);
  }

  try {
    let query = `
      SELECT pr.procedure_name, pr.cpt_code, MIN(pc.discounted_cash) as price
      FROM prices pc
      JOIN providers pv ON pc.provider_id = pv.id
      JOIN procedures pr ON pc.procedure_id = pr.id
      WHERE LOWER(pv.name) = LOWER($1)
        AND pr.cpt_code ~ '^[0-9]{1,3}$'
        AND CAST(pr.cpt_code AS INTEGER) BETWEEN 1 AND 999
        AND pc.discounted_cash > 0
    `;

    const params = [hospital];

    if (drgs && drgs.trim()) {
      const drgList = drgs.split(',').map(d => d.trim()).filter(d => d);
      if (drgList.length > 0) {
        query += ` AND pr.cpt_code = ANY($2)`;
        params.push(drgList);
      }
    }

    query += `
      GROUP BY pr.procedure_name, pr.cpt_code
      ORDER BY CAST(pr.cpt_code AS INTEGER) ASC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MEDICATIONS TAB — drugs, supplies, everything else
app.get('/hospital-medications', async (req, res) => {
  const { hospital } = req.query;
  if (!hospital) return res.status(400).json({ error: 'Missing hospital param' });

  try {
    const result = await pool.query(`
      SELECT pr.procedure_name, MIN(pc.discounted_cash) as price
      FROM prices pc
      JOIN providers pv ON pc.provider_id = pv.id
      JOIN procedures pr ON pc.procedure_id = pr.id
      WHERE LOWER(pv.name) = LOWER($1)
        AND pc.discounted_cash > 0
        AND (
          (pr.cpt_code ~ '^[0-9]+$' AND CAST(pr.cpt_code AS INTEGER) > 999)
          OR pr.cpt_code ~ '^[A-Z]'
          OR (
            pr.cpt_code ~ '^[0-9]{5}$'
            AND (
              pr.procedure_name ~* '[0-9]+ mg'
              OR pr.procedure_name ILIKE '% tab %'
              OR pr.procedure_name ILIKE '% tab[0-9]%'
              OR pr.procedure_name ILIKE '% cap [0-9]%'
              OR pr.procedure_name ILIKE '% soln%'
              OR pr.procedure_name ILIKE '% oint%'
              OR pr.procedure_name ILIKE '%suppos%'
              OR pr.procedure_name ILIKE '% inj [0-9]%'
              OR pr.procedure_name ILIKE '% inj[0-9]%'
            )
          )
        )
      GROUP BY pr.procedure_name
      ORDER BY pr.procedure_name ASC
    `, [hospital]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

  // --- REVIEWS & SUBMISSIONS ---

// Submit a review
app.post('/submit-review', async (req, res) => {
  const {
    hospital_name, procedure_name, service_month,
    amount_billed, amount_paid, payment_type,
    insurance_carrier, price_honored, comment, display_name
  } = req.body;

  if (!hospital_name || !procedure_name || !amount_paid || !payment_type || !price_honored) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const submitter_ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

  try {
    const duplicate = await pool.query(
      `SELECT id FROM reviews 
       WHERE submitter_ip = $1 
       AND LOWER(hospital_name) = LOWER($2) 
       AND LOWER(procedure_name) = LOWER($3)
       AND created_at > NOW() - INTERVAL '24 hours'`,
      [submitter_ip, hospital_name, procedure_name]
    );

    if (duplicate.rows.length > 0) {
      return res.status(429).json({ error: 'duplicate' });
    }

    await pool.query(
      `INSERT INTO reviews 
        (hospital_name, procedure_name, service_month, amount_billed, amount_paid, 
         payment_type, insurance_carrier, price_honored, comment, display_name, submitter_ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        hospital_name, procedure_name, service_month,
        amount_billed || null, amount_paid, payment_type,
        insurance_carrier || null, price_honored,
        comment || null, display_name || 'Anonymous',
        submitter_ip
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get reviews
app.get('/get-reviews', async (req, res) => {
  const { hospital, procedure } = req.query;
  if (!hospital) return res.status(400).json({ error: 'Hospital name required' });

  try {
    let query = `
      SELECT id, hospital_name, procedure_name, service_month,
             amount_billed, amount_paid, payment_type, insurance_carrier,
             price_honored, comment, display_name, created_at
      FROM reviews
      WHERE LOWER(hospital_name) LIKE LOWER($1)
      AND flagged = false
    `;
    const params = [`%${hospital}%`];

    if (procedure) {
      params.push(`%${procedure}%`);
      query += ` AND LOWER(procedure_name) LIKE LOWER($2)`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Flag a review
app.post('/flag-review', async (req, res) => {
  const { review_id } = req.body;
  if (!review_id) return res.status(400).json({ error: 'Review ID required' });

  try {
    await pool.query(
      `UPDATE reviews 
       SET flag_count = flag_count + 1,
           flagged = CASE WHEN flag_count + 1 >= 5 THEN true ELSE flagged END
       WHERE id = $1`,
      [review_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Flag review error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin - get flagged reviews
app.get('/admin-reviews', async (req, res) => {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE flagged = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin - approve a review
app.post('/admin-approve', async (req, res) => {
  const { review_id, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await pool.query(
      `UPDATE reviews SET flagged = false, flag_count = 0 WHERE id = $1`,
      [review_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin - delete a review
app.post('/admin-delete', async (req, res) => {
  const { review_id, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await pool.query(`DELETE FROM reviews WHERE id = $1`, [review_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});