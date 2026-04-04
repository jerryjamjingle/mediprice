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

  // --- REVIEWS & SUBMISSIONS ---

// 1. Submit a new review
app.post('/submit-review', async (req, res) => {
  const { 
      hospital_name, procedure_name, service_month, amount_billed, 
      amount_paid, payment_type, insurance_carrier, price_honored, 
      comment, display_name 
  } = req.body;

  try {
      const query = `
          INSERT INTO reviews (
              hospital_name, procedure_name, service_month, amount_billed, 
              amount_paid, payment_type, insurance_carrier, price_honored, 
              comment, display_name
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id;
      `;
      
      const values = [
          hospital_name, 
          procedure_name, 
          service_month, 
          amount_billed || null, 
          amount_paid, 
          payment_type, 
          insurance_carrier || null, 
          price_honored, 
          comment || null, 
          display_name || 'Anonymous'
      ];

      const result = await pool.query(query, values);
      res.status(201).json({ success: true, reviewId: result.rows[0].id });
  } catch (err) {
      console.error('Error saving review:', err);
      res.status(500).json({ error: 'Failed to submit review' });
  }
});

// 2. Get reviews for a specific hospital
app.get('/get-reviews', async (req, res) => {
  const { hospital } = req.query;

  if (!hospital) {
      return res.status(400).json({ error: 'Hospital name is required' });
  }

  try {
      const query = `
          SELECT * FROM reviews 
          WHERE hospital_name = $1 AND flagged = false 
          ORDER BY created_at DESC;
      `;
      const result = await pool.query(query, [hospital]);
      res.json(result.rows);
  } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a patient price review
app.post('/submit-review', async (req, res) => {
  const {
    hospital_name, procedure_name, service_month,
    amount_billed, amount_paid, payment_type,
    insurance_carrier, price_honored, comment, display_name
  } = req.body;

  if (!hospital_name || !procedure_name || !amount_paid || !payment_type || !price_honored) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await pool.query(
      `INSERT INTO reviews 
        (hospital_name, procedure_name, service_month, amount_billed, amount_paid, 
         payment_type, insurance_carrier, price_honored, comment, display_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        hospital_name, procedure_name, service_month,
        amount_billed || null, amount_paid, payment_type,
        insurance_carrier || null, price_honored,
        comment || null, display_name || 'Anonymous'
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get reviews for a hospital
app.get('/get-reviews', async (req, res) => {
  const { hospital } = req.query;
  if (!hospital) return res.status(400).json({ error: 'Hospital name required' });

  try {
    const result = await pool.query(
      `SELECT id, hospital_name, procedure_name, service_month,
              amount_billed, amount_paid, payment_type, insurance_carrier,
              price_honored, comment, display_name, created_at
       FROM reviews
       WHERE LOWER(hospital_name) = LOWER($1)
       AND flagged = false
       ORDER BY created_at DESC
       LIMIT 50`,
      [hospital]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});