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

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

app.get('/', (req, res) => {
  res.json({ message: 'MediPrice API is running!' });
});

app.get('/search', async (req, res) => {
  const { procedure, zip } = req.query;
  try {
    const result = await pool.query(
      'SELECT pr.name, pr.address, pr.city, pr.state, pr.zip, pr.latitude, pr.longitude, p.procedure_name, p.cpt_code, pc.gross_charge, pc.discounted_cash FROM prices pc JOIN providers pr ON pc.provider_id = pr.id JOIN procedures p ON pc.procedure_id = p.id WHERE LOWER(p.procedure_name) LIKE LOWER($1) ORDER BY pc.discounted_cash ASC',
      ['%' + procedure + '%']
    );

    let rows = result.rows;

    if (zip) {
      const location = zipcodes.lookup(zip);
      if (location) {
        rows = rows.map(r => ({
          ...r,
          distance: r.latitude && r.longitude
            ? Math.round(calcDistance(location.latitude, location.longitude, parseFloat(r.latitude), parseFloat(r.longitude)) * 10) / 10
            : null
        })).filter(r => r.distance === null || r.distance <= 100);
        rows.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
    }

    res.json(rows);
  } catch (err) {
    console.error('SEARCH ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});
