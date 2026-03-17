import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const PROVIDER_COORDS = {
  'Saint Anthonys Hospital': [38.9076, -90.1721],
};

const DEFAULT_CENTER = [38.627, -90.1994];

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

function FlyToPin({ results }) {
  const map = useMap();
  const first = results.find(r => PROVIDER_COORDS[r.name]);
  if (first) {
    map.flyTo(PROVIDER_COORDS[first.name], 13, { duration: 1.2 });
  }
  return null;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('http://localhost:3001/search?procedure=' + encodeURIComponent(query));
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const prices = results.map(r => parseFloat(r.discounted_cash)).filter(Boolean);

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
        <button onClick={search}>Search</button>
      </div>
      {loading && <div className="status">Searching...</div>}
      {!loading && searched && results.length === 0 && <div className="status">No results found.</div>}
      {!loading && results.length > 0 && (
        <div className="content">
          <div className="results">
            <h2>{results.length} results for "{query}"</h2>
            {results.map((r, i) => (
              <div className="result-card" key={i}>
                <div className="result-rank">#{i + 1}</div>
                <div className="result-info">
                  <div className="result-name">{r.name}</div>
                  <div className="result-procedure">{r.procedure_name}</div>
                  <div className="result-address">{r.address}, {r.city}, {r.state}</div>
                </div>
                <div className="result-price" style={{ color: getPinColor(parseFloat(r.discounted_cash), prices) }}>
                  {r.discounted_cash ? '$' + parseFloat(r.discounted_cash).toFixed(2) : 'N/A'}
                </div>
              </div>
            ))}
          </div>
          <div className="map-container">
            <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyToPin results={results} />
              {results.map((r, i) => {
                const coords = PROVIDER_COORDS[r.name];
                if (!coords) return null;
                const color = getPinColor(parseFloat(r.discounted_cash), prices);
                return (
                  <CircleMarker key={i} center={coords} radius={12} fillColor={color} color="#fff" weight={2} fillOpacity={0.9}>
                    <Popup>
                      <strong>{r.name}</strong><br />
                      {r.procedure_name}<br />
                      {r.discounted_cash ? '$' + parseFloat(r.discounted_cash).toFixed(2) : 'N/A'}
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
