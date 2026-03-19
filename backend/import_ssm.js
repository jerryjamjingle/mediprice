require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

const HOSPITALS = [
  {
    file: 'C:\\Users\\jaden\\Downloads\\EXTRAS\\ssm-health-saint-louis-university-hospital_standardcharges.json',
    name: 'SSM Health Saint Louis University Hospital',
    address: '1201 S Grand Blvd',
    city: 'Saint Louis',
    state: 'MO',
    zip: '63104',
    latitude: 38.6184,
    longitude: -90.2620
  },
  {
    file: 'C:\\Users\\jaden\\Downloads\\EXTRAS\\ssm-health-st.-clare-hospital---fenton_standardcharges.json',
    name: 'SSM Health St. Clare Hospital',
    address: '1015 Bowles Ave',
    city: 'Fenton',
    state: 'MO',
    zip: '63026',
    latitude: 38.5137,
    longitude: -90.4363
  },
  {
    file: 'C:\\Users\\jaden\\Downloads\\EXTRAS\\ssm-health-st.-mary-_s-hospital---st.-louis_standardcharges.json',    name: 'SSM Health St. Mary\'s Hospital',
    address: '6420 Clayton Rd',
    city: 'Saint Louis',
    state: 'MO',
    zip: '63117',
    latitude: 38.6351,
    longitude: -90.3182
  },
  {
    file: 'C:\\Users\\jaden\\Downloads\\EXTRAS\\ssm-health-st.-joseph-hospital-lake-saint-louis_standardcharges.json',
    name: 'SSM Health St. Joseph Hospital',
    address: '100 Medical Plaza',
    city: 'Lake Saint Louis',
    state: 'MO',
    zip: '63367',
    latitude: 38.7937,
    longitude: -90.7857
  }
];

async function importHospital(hospital) {
  console.log(`\nImporting ${hospital.name}...`);
  const data = JSON.parse(fs.readFileSync(hospital.file, 'utf8'));

  const providerResult = await pool.query(
    'INSERT INTO providers (name, address, city, state, zip, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING RETURNING id',
    [hospital.name, hospital.address, hospital.city, hospital.state, hospital.zip, hospital.latitude, hospital.longitude]
  );

  let providerId;
  if (providerResult.rows.length > 0) {
    providerId = providerResult.rows[0].id;
  } else {
    const existing = await pool.query('SELECT id FROM providers WHERE name = $1', [hospital.name]);
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
  console.log(`Done with ${hospital.name}! Imported: ${imported} Skipped: ${skipped}`);
}

async function main() {
  for (const hospital of HOSPITALS) {
    await importHospital(hospital);
  }
  console.log('\nAll hospitals imported!');
  await pool.end();
}

main().catch(console.error);