const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const raw = fs.readFileSync('C:\\Users\\jaden\\Downloads\\EXTRAS\\saint-anthonys-pricing.json', 'utf8');
const data = JSON.parse(raw);

const targetProcedures = ['MRI', 'CT', 'X-RAY', 'XRAY', 'CT SCAN'];

async function importData() {
  console.log('Starting import...');
  
  const providerResult = await pool.query(
    "INSERT INTO providers (name, address, city, state, zip) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    ['Saint Anthonys Hospital', '10 Crossings Dr', 'O Fallon', 'IL', '62269']
  );
  const providerId = providerResult.rows[0].id;
  console.log('Provider added, ID:', providerId);

  let count = 0;
  const items = data.standard_charge_information;
for (const item of items) {
    const desc = item.description || '';
    const isTarget = targetProcedures.some(p => desc.toUpperCase().includes(p));
    if (!isTarget) continue;

    const cptCode = item.code_information?.find(c => c.type === 'CPT')?.code || '';
    const charges = item.standard_charges?.[0];
    if (!charges) continue;

    const procResult = await pool.query(
      "INSERT INTO procedures (cpt_code, procedure_name) VALUES ($1, $2) RETURNING id",
      [cptCode, desc]
    );
    const procedureId = procResult.rows[0].id;

    await pool.query(
      "INSERT INTO prices (provider_id, procedure_id, gross_charge, discounted_cash) VALUES ($1, $2, $3, $4)",
      [providerId, procedureId, charges.gross_charge || 0, charges.discounted_cash || 0]
    );
    count++;
  }
  
  console.log('Done! Imported ' + count + ' procedures.');
  process.exit(0);
}

importData().catch(console.error);