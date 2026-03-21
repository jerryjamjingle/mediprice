require('dotenv').config();
const { Pool } = require('pg');
const XLSX = require('xlsx');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false, require: true }
});

const hospitals = [
  {
    file: 'GATEWAY-REGIONAL-MEDICAL-CENTER_standardcharges.csv',
    name: 'Gateway Regional Medical Center',
    address: '2100 Madison Ave',
    city: 'Granite City',
    state: 'IL',
    zip: '62040',
    lat: 38.7158,
    lng: -90.1488,
    phone: '(618) 798-3000',
    website: 'https://www.gatewayregional.net',
    hours: 'Open 24 hours'
  },
  // {
  //   file: 'st-elizabeths-hospital_standardcharges.csv',
  //   name: 'HSHS St. Elizabeth\'s Hospital',
  //   address: '1 St Elizabeth\'s Blvd',
  //   city: 'O\'Fallon',
  //   state: 'IL',
  //   zip: '62269',
  //   lat: 38.6023,
  //   lng: -89.9293,
  //   phone: '(618) 234-2120',
  //   website: 'https://www.steliz.org',
  //   hours: 'Open 24 hours'
  // },
  {
    file: 'st-josephs-hospital-highland_standardcharges.csv',
    name: 'HSHS St. Joseph\'s Hospital Highland',
    address: '12866 Troxler Ave',
    city: 'Highland',
    state: 'IL',
    zip: '62249',
    lat: 38.7395,
    lng: -89.6714,
    phone: '(618) 651-2606',
    website: 'https://www.stjosephshighland.org',
    hours: 'Open 24 hours'
  },
  {
    file: 'st-josephs-hospital-breese_standardcharges.csv',
    name: 'HSHS St. Joseph\'s Hospital Breese',
    address: '12860 Troxler Ave',
    city: 'Breese',
    state: 'IL',
    zip: '62230',
    lat: 38.6097,
    lng: -89.5268,
    phone: '(618) 526-4511',
    website: 'https://www.stjosephsbreese.org',
    hours: 'Open 24 hours'
  },
  {
    file: 'st-anthonys-memorial-hospital_standardcharges.csv',
    name: 'HSHS St. Anthony\'s Memorial Hospital',
    address: '503 N Maple St',
    city: 'Effingham',
    state: 'IL',
    zip: '62401',
    lat: 39.1232,
    lng: -88.5431,
    phone: '(217) 342-2121',
    website: 'https://www.stanthonyshospital.org',
    hours: 'Open 24 hours'
  },
  {
    file: 'st-francis-hospital_standardcharges.csv',
    name: 'HSHS St. Francis Hospital',
    address: '1215 Unity Point Ln',
    city: 'Litchfield',
    state: 'IL',
    zip: '62056',
    lat: 39.1754,
    lng: -89.6543,
    phone: '(217) 324-2191',
    website: 'https://www.stfrancis-litchfield.org',
    hours: 'Open 24 hours'
  }
];

async function importHospital(hospitalConfig) {
  console.log('\n' + '='.repeat(60));
  console.log(`Importing ${hospitalConfig.name}...`);
  console.log('='.repeat(60));

  const client = await pool.connect();
  
  try {
    // Insert provider
    const providerResult = await client.query(`
      INSERT INTO providers (name, address, city, state, zip, latitude, longitude, phone, website, hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      hospitalConfig.name,
      hospitalConfig.address,
      hospitalConfig.city,
      hospitalConfig.state,
      hospitalConfig.zip,
      hospitalConfig.lat,
      hospitalConfig.lng,
      hospitalConfig.phone,
      hospitalConfig.website,
      hospitalConfig.hours
    ]);
    
    const providerId = providerResult.rows[0].id;
    console.log(`✓ Created provider with ID: ${providerId}`);

    // Read CSV file
    const filePath = `C:/Users/jaden/Downloads/EXTRAS/${hospitalConfig.file}`;
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const dataRows = allRows.slice(3);
    console.log(`✓ Loaded ${dataRows.length} data rows`);

    // Column indices
    const descIdx = 0;
    const cptIdx = 1;
    const grossIdx = 10;
    const cashIdx = 11;

    // Process rows
    const procedureCache = {};
    let priceCount = 0;
    const BATCH_SIZE = 500;
    let priceBatch = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      try {
        const procedureName = String(row[descIdx] || '').trim();
        let cptCode = String(row[cptIdx] || '').trim();
        const grossCharge = parseFloat(row[grossIdx]) || 0;
        const discountedCash = parseFloat(row[cashIdx]) || 0;

        if (!procedureName || discountedCash <= 0) continue;
        if (!cptCode) cptCode = null;

        // Get or create procedure
        const cacheKey = `${procedureName}|||${cptCode}`;
        let procedureId;

        if (procedureCache[cacheKey]) {
          procedureId = procedureCache[cacheKey];
        } else {
          // Check if exists first
          const existingProc = await client.query(`
            SELECT id FROM procedures 
            WHERE procedure_name = $1 
            AND (cpt_code = $2 OR (cpt_code IS NULL AND $2 IS NULL))
          `, [procedureName, cptCode]);

          if (existingProc.rows.length > 0) {
            procedureId = existingProc.rows[0].id;
          } else {
            const procResult = await client.query(`
              INSERT INTO procedures (procedure_name, cpt_code)
              VALUES ($1, $2)
              RETURNING id
            `, [procedureName, cptCode]);
            procedureId = procResult.rows[0].id;
          }
          
          procedureCache[cacheKey] = procedureId;
        }

        priceBatch.push([providerId, procedureId, grossCharge, discountedCash]);

        if (priceBatch.length >= BATCH_SIZE) {
          const values = priceBatch.map((_, idx) => 
            `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
          ).join(',');
          
          await client.query(`
            INSERT INTO prices (provider_id, procedure_id, gross_charge, discounted_cash)
            VALUES ${values}
          `, priceBatch.flat());
          
          priceCount += priceBatch.length;
          console.log(`  ${priceCount} prices imported...`);
          priceBatch = [];
        }

      } catch (err) {
        console.log(`  Error on row ${i}: ${err.message}`);
        continue;
      }
    }

    if (priceBatch.length > 0) {
      const values = priceBatch.map((_, idx) => 
        `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`
      ).join(',');
      
      await client.query(`
        INSERT INTO prices (provider_id, procedure_id, gross_charge, discounted_cash)
        VALUES ${values}
      `, priceBatch.flat());
      
      priceCount += priceBatch.length;
    }

    console.log(`✓ SUCCESS: Imported ${priceCount} prices for ${hospitalConfig.name}`);

  } catch (err) {
    console.error(`✗ FAILED: ${hospitalConfig.name}: ${err.message}`);
  } finally {
    client.release();
  }
}

async function run() {
  console.log('\n🏥 STARTING IMPORT OF 5 HOSPITALS (skipping St. Elizabeth for now) 🏥\n');
  
  for (const hospital of hospitals) {
    await importHospital(hospital);
  }
  
  await pool.end();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORT COMPLETE! ✅');
  console.log('You can import St. Elizabeth\'s later overnight (it\'s 313 MB!)');
  console.log('='.repeat(60));
}

run().catch(console.error);