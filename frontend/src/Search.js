import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const DEFAULT_CENTER = [38.7, -90.3];

function getPinColor(price, prices) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;
  if (range === 0) return '#22c55e';
  const ratio = (price - min) / range;
  if (ratio < 0.33) return '#22c55e';
  if (ratio < 0.66) return '#eab308';
  return '#ef4444';
}

function FlyToBounds({ providerPins }) {
  const map = useMap();
  if (providerPins.length > 0) {
    const coords = providerPins.map(p => p.coords);
    if (coords.length === 1) {
      map.flyTo(coords[0], 12, { duration: 1.2 });
    } else {
      const lats = coords.map(c => c[0]);
      const lngs = coords.map(c => c[1]);
      map.flyToBounds([
        [Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05],
        [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05]
      ], { duration: 1.2 });
    }
  }
  return null;
}

export default function Search() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();  // ← ADD THIS LINE
    const [query, setQuery] = useState(searchParams.get('procedure') || '');
  const [zip, setZip] = useState(searchParams.get('zip') || '');
  const [cptCode, setCptCode] = useState(searchParams.get('cpt') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [radius, setRadius] = useState(25); // Default 25 miles

  // Auto-search if URL has parameters
  useEffect(() => {
    const procedure = searchParams.get('procedure');
    const cptParam = searchParams.get('cpt');
    
    if (procedure || cptParam) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const search = async () => {
    if (!query.trim() && !cptCode.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelectedHospital(null);
    try {
      let url = 'https://mediprice-backend.onrender.com/search?';
      let params = [];
      
      if (query.trim()) params.push('procedure=' + encodeURIComponent(query));
      if (zip.trim()) params.push('zip=' + encodeURIComponent(zip.trim()));
      if (cptCode.trim()) params.push('cpt=' + encodeURIComponent(cptCode.trim()));
      
      url += params.join('&');
      
      const res = await fetch(url);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const prices = results.map(r => parseFloat(r.discounted_cash)).filter(p => !isNaN(p) && p > 0);

  const providerPins = Object.entries(
    results.reduce((acc, r) => {
      const lat = parseFloat(r.latitude);
      const lng = parseFloat(r.longitude);
      if (isNaN(lat) || isNaN(lng)) return acc;
      const price = parseFloat(r.discounted_cash);
      if (!acc[r.name] || price < parseFloat(acc[r.name].discounted_cash)) {
        acc[r.name] = r;
      }
      return acc;
    }, {})
  ).map(([name, r]) => ({
    name,
    coords: [
      Number(r.latitude),
      Number(r.longitude)
    ],
    price: parseFloat(r.discounted_cash),
    r
  }));

  const pinPrices = providerPins.map(p => p.price);

  const groupedByHospital = results.reduce((acc, r) => {
    if (!acc[r.name]) {
      acc[r.name] = {
        hospitalName: r.name,
        address: r.address,
        city: r.city,
        state: r.state,
        distance: r.distance,
        procedures: []
      };
    }
    
    // Check if we already have this procedure for this hospital
    const existingProc = acc[r.name].procedures.find(
      p => p.procedure_name === r.procedure_name && p.cpt_code === r.cpt_code
    );
    
    // If we don't have it, or if this price is lower, use this one
    if (!existingProc) {
      acc[r.name].procedures.push(r);
    } else {
      const existingPrice = parseFloat(existingProc.discounted_cash);
      const newPrice = parseFloat(r.discounted_cash);
      if (newPrice < existingPrice) {
        // Replace with the lower price
        const index = acc[r.name].procedures.indexOf(existingProc);
        acc[r.name].procedures[index] = r;
      }
    }
    
    return acc;
  }, {});

  const hospitalCards = Object.values(groupedByHospital).map(hospital => {
    const procedurePrices = hospital.procedures
    .map(p => parseFloat(p.discounted_cash))
    .filter(p => !isNaN(p) && p >= 1); // Changed from p > 0 to p >= 1
    const lowestPrice = procedurePrices.length > 0 ? Math.min(...procedurePrices) : 0;
    
    return {
      ...hospital,
      lowestPrice,
      procedureCount: hospital.procedures.length,
      procedures: hospital.procedures.sort((a, b) => 
        parseFloat(a.discounted_cash) - parseFloat(b.discounted_cash)
      )
    };
  }).sort((a, b) => a.lowestPrice - b.lowestPrice);

  const hospitalCount = providerPins.length;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="app">
      <div className="header">
  <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>MediPrice</h1>
  <p>Compare real cash prices across St. Louis hospitals</p>
</div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search procedure (e.g. MRI, CT Scan, X-Ray)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <input
          type="text"
          placeholder="ZIP code"
          value={zip}
          onChange={e => setZip(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          className="zip-input"
        /><select 
        value={radius} 
        onChange={e => setRadius(Number(e.target.value))}
        className="radius-select"
      >
        <option value={5}>5 miles</option>
        <option value={10}>10 miles</option>
        <option value={25}>25 miles</option>
        <option value={50}>50 miles</option>
        <option value={100}>100 miles</option>
      </select>

        <input
          type="text"
          placeholder="CPT code"
          value={cptCode}
          onChange={e => setCptCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          className="cpt-input"
        />
        <button onClick={search}>Search</button>
      </div>

      {loading && (
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Searching prices...</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            (First search may take 30-60 seconds while the server wakes up)
          </p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="status">No results found. Try a different search term.</div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="summary-bar">
            <span className="summary-highlight">{hospitalCount} hospitals</span> · 
            <span className="summary-highlight"> ${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}</span> · 
            {results.length} procedures
          </div>

          <div className="content">
            <div className="results">
              {hospitalCards.map((hospital, i) => {
                const displayColor = getPinColor(hospital.lowestPrice, prices);
                
                return (
                  <div 
                    key={hospital.hospitalName} 
                    className="hospital-card"
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    <div className="hospital-rank-badge" style={{ backgroundColor: displayColor }}>
                      #{i + 1}
                    </div>
                    
                    <div className="hospital-main-info">
                      <h3 className="hospital-name">{hospital.hospitalName}</h3>
                      <p className="hospital-address">
                        {hospital.address}, {hospital.city}
                      </p>
                      {hospital.distance !== null && hospital.distance !== undefined && (
                        <p className="hospital-distance">📍 {hospital.distance} miles away</p>
                      )}
                    </div>

                    <div className="hospital-price-box">
                      <div className="price-label">Starting at</div>
                      <div className="price-amount" style={{ color: displayColor }}>
                      {hospital.lowestPrice < 1 ? 'Not Listed' : `$${hospital.lowestPrice.toFixed(0)}`}
                      </div>
                      <div className="procedure-count">
                        {hospital.procedureCount} option{hospital.procedureCount !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="hospital-arrow-container">
                    <div className="hospital-arrow">›</div>
                    </div>
                  </div>
                );

              })}
            </div>

            <div className="map-container">
              <MapContainer center={DEFAULT_CENTER} zoom={9} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FlyToBounds providerPins={providerPins} />
                {providerPins.map((pin, i) => {
                  const color = getPinColor(pin.price, pinPrices);
                  return (
                    <CircleMarker key={i} center={pin.coords} radius={14} fillColor={color} color="#fff" weight={2} fillOpacity={0.9}>
                      <Popup>
                        <strong>{pin.name}</strong><br />
                        Starting at: {pin.price < 1 ? 'Not Listed' : `$${pin.price.toFixed(2)}`}<br />
                        {pin.r.distance !== null && pin.r.distance !== undefined && <>{pin.r.distance} miles away</>}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </>
      )}

{selectedHospital && (
  <div className="modal-overlay" onClick={() => setSelectedHospital(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setSelectedHospital(null)}>×</button>
      
      <div className="modal-header">
        <h2>{selectedHospital.hospitalName}</h2>
        
        {/* Contact Info */}
        <div className="hospital-contact-info">
          {selectedHospital.procedures[0]?.phone && (
            <a href={`tel:${selectedHospital.procedures[0].phone}`} className="contact-link">
              📞 {selectedHospital.procedures[0].phone}
            </a>
          )}
          
          {selectedHospital.procedures[0]?.website && (
            <a 
              href={selectedHospital.procedures[0].website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact-link"
            >
              🌐 Visit Website
            </a>
          )}
        </div>

        {/* Address - Click to open in Google Maps */}
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedHospital.address + ', ' + selectedHospital.city + ', ' + selectedHospital.state)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="modal-address"
        >
          📍 {selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state}
        </a>

        {selectedHospital.distance !== null && selectedHospital.distance !== undefined && (
          <p className="modal-distance">🚗 {selectedHospital.distance} miles from you</p>
        )}

        {selectedHospital.procedures[0]?.hours && (
          <p className="modal-hours">🕒 {selectedHospital.procedures[0].hours}</p>
        )}
      </div>

      <div className="modal-body">
        <h3>All Matching Procedures ({selectedHospital.procedureCount})</h3>
        <div className="procedure-list">
          {selectedHospital.procedures.map((proc, idx) => (
            <div key={idx} className="procedure-item">
              <div className="procedure-item-name">{proc.procedure_name}</div>
              <div className="procedure-item-price">
              {parseFloat(proc.discounted_cash) < 1 ? 'Not Listed' : `$${parseFloat(proc.discounted_cash).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="modal-footer">
        <p className="modal-cta-text">💡 Call the hospital and mention the CPT code to confirm the cash price</p>
        {selectedHospital.procedures[0]?.phone && (
          <a 
            href={`tel:${selectedHospital.procedures[0].phone}`} 
            className="modal-cta-button"
          >
            📞 Call {selectedHospital.hospitalName}
          </a>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}