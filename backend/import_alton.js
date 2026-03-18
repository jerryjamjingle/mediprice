require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

async function importData() {
  console.log('Starting Alton Memorial import...');
  const data = JSON.parse(fs.readFileSync('C:\\Users\\jaden\\Downloads\\EXTRAS\\AltonMemorialHospital_standardcharges.json', 'utf8'));
  
  const providerResult = await pool.query(
    'INSERT INTO providers (name, address, city, state, zip, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING RETURNING id',
    ['Alton Memorial Hospital', 'One Memorial Drive', 'Alton', 'IL', '62002', 38.8897, -90.1843]
  );
  
  let providerId;
  if (providerResult.rows.length > 0) {
    providerId = providerResult.rows[0].id;
  } else {
    const existing = await pool.query('SELECT id FROM providers WHERE name = $1', ['Alton Memorial Hospital']);
    providerId = existing.rows[0].id;
  }
  console.log('Provider ID:', providerId);

  let imported = 0;
  let skipped = 0;

  for (const item of data.standard_charge_information) {
    const description = item.description;
    const cptCode = item.code_information?.[0]?.code || '';
    for (const charge of item.standard_charges || []) {
      const grossCharge = charge.gross_charge;
      const discountedCash = charge.discounted_cash;
      if (!discountedCash && !grossCharge) { skipped++; continue; }
      try {
        const procResult = await pool.query(
          'INSERT INTO procedures (procedure_name, cpt_code) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
          [description, cptCode]
        );
        let procId;
        if (procResult.rows.length > 0) {
          procId = procResult.rows[0].id;
        } else {
          const existing = await pool.query('SELECT id FROM procedures WHERE procedure_name = $1 AND cpt_code = $2', [description, cptCode]);
          if (existing.rows.length === 0) { skipped++; continue; }
          procId = existing.rows[0].id;
        }
        await pool.query(
          'INSERT INTO prices (provider_id, procedure_id, gross_charge, discounted_cash) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [providerId, procId, grossCharge || 0, discountedCash || 0]
        );
        imported++;
      } catch (err) {
        skipped++;
      }
    }
  }
  console.log('Done! Imported:', imported, 'Skipped:', skipped);
  await pool.end();
}

importData().catch(console.error);