import React, { useState } from 'react';
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

export default function App() {
  const [query, setQuery] = useState('');
  const [zip, setZip] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedHospitals, setExpandedHospitals] = useState({});

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setExpandedHospitals({}); // Reset expanded state on new search
    try {
      let url = 'https://mediprice-backend.onrender.com/search?procedure=' + encodeURIComponent(query);
      if (zip.trim()) url += '&zip=' + encodeURIComponent(zip.trim());
      const res = await fetch(url);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const toggleHospital = (hospitalName) => {
    setExpandedHospitals(prev => ({
      ...prev,
      [hospitalName]: !prev[hospitalName]
    }));
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

  // GROUP RESULTS BY HOSPITAL
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
    acc[r.name].procedures.push(r);
    return acc;
  }, {});

  // Convert to array and sort by lowest price
  const hospitalCards = Object.values(groupedByHospital).map(hospital => {
    const procedurePrices = hospital.procedures
      .map(p => parseFloat(p.discounted_cash))
      .filter(p => !isNaN(p) && p > 0);
    const lowestPrice = procedurePrices.length > 0 ? Math.min(...procedurePrices) : 0;
    
    return {
      ...hospital,
      lowestPrice,
      procedureCount: hospital.procedures.length,
      // Sort procedures within hospital by price
      procedures: hospital.procedures.sort((a, b) => 
        parseFloat(a.discounted_cash) - parseFloat(b.discounted_cash)
      )
    };
  }).sort((a, b) => a.lowestPrice - b.lowestPrice);

  // SUMMARY BAR CALCULATIONS
  const hospitalCount = providerPins.length;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="app">
      <div className="header">
        <h1>MediPrice</h1>
        <p>Find real cash prices for medical procedures in St. Louis</p>
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
          placeholder="ZIP code (optional)"
          value={zip}
          onChange={e => setZip(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          style={{ maxWidth: '140px' }}
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
            Found at {hospitalCount} {hospitalCount === 1 ? 'hospital' : 'hospitals'} · 
            Prices from ${minPrice.toFixed(2)} to ${maxPrice.toFixed(2)} · 
            {results.length} total procedures
          </div>

          <div className="content">
            <div className="results">
              <h2>{hospitalCards.length} hospitals for "{query}"</h2>
              
              {hospitalCards.map((hospital, i) => {
                const isExpanded = expandedHospitals[hospital.hospitalName];
                const displayColor = getPinColor(hospital.lowestPrice, prices);
                
                return (
                  <div key={hospital.hospitalName} className="hospital-card">
                    {/* HOSPITAL HEADER - Always visible */}
                    <div 
                      className="hospital-header" 
                      onClick={() => toggleHospital(hospital.hospitalName)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="hospital-rank">#{i + 1}</div>
                      <div className="hospital-info">
                        <div className="hospital-name">{hospital.hospitalName}</div>
                        <div className="hospital-address">
                          {hospital.address}, {hospital.city}, {hospital.state}
                        </div>
                        {hospital.distance !== null && hospital.distance !== undefined && (
                          <div className="result-distance">{hospital.distance} miles away</div>
                        )}
                        <div className="hospital-procedure-count">
                          {hospital.procedureCount} {hospital.procedureCount === 1 ? 'procedure' : 'procedures'} match
                        </div>
                      </div>
                      <div className="hospital-price-section">
                        <div className="hospital-lowest-label">From</div>
                        <div className="hospital-price" style={{ color: displayColor }}>
                          ${hospital.lowestPrice.toFixed(2)}
                        </div>
                        <div className="expand-arrow">{isExpanded ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {/* EXPANDED PROCEDURES - Only shown when clicked */}
                    {isExpanded && (
                      <div className="procedure-list">
                        {hospital.procedures.map((proc, idx) => (
                          <div key={idx} className="procedure-item">
                            <div className="procedure-name">{proc.procedure_name}</div>
                            <div className="procedure-price">
                              ${parseFloat(proc.discounted_cash).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                        Lowest: ${pin.price.toFixed(2)}<br />
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
    </div>
  );
}