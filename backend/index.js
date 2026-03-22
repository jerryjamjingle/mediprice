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
  res.json({ message: 'MediPrice API is running!' });
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
        const cleanedProcedure = procedure.trim().replace(/[\s-]/g, '');
        queryParams.push(`%${cleanedProcedure}%`);
        queryText += ` AND REPLACE(REPLACE(LOWER(p.procedure_name), ' ', ''), '-', '') LIKE LOWER($${queryParams.length})`;
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
          }).filter(r => r.distance <= 100)
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        }
      }
  
      res.json(rows);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});