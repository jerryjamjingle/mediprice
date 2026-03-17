require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
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
app.get('/', (req, res) => { res.json({ message: 'MediPrice API is running!' }); });
app.get('/search', async (req, res) => {
  const { procedure } = req.query;
  try {
    const result = await pool.query('SELECT pr.name, pr.address, pr.city, pr.state, p.procedure_name, p.cpt_code, pc.gross_charge, pc.discounted_cash FROM prices pc JOIN providers pr ON pc.provider_id = pr.id JOIN procedures p ON pc.procedure_id = p.id WHERE LOWER(p.procedure_name) LIKE LOWER($1) ORDER BY pc.discounted_cash ASC', ['%' + procedure + '%']);
    res.json(result.rows);
  } catch (err) {
    console.error('SEARCH ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, function() { console.log('Server running on port ' + PORT); });
