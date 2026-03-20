import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

const HOSPITALS = [
  { name: 'Saint Anthonys Hospital', coords: [38.9076, -90.1721] },
  { name: 'Alton Memorial Hospital', coords: [38.8897, -90.1843] },
  { name: 'SSM Health Saint Louis University Hospital', coords: [38.6184, -90.2620] },
  { name: 'SSM Health St. Clare Hospital', coords: [38.5137, -90.4363] },
  { name: "SSM Health St. Mary's Hospital", coords: [38.6351, -90.3182] },
  { name: 'SSM Health St. Joseph Hospital', coords: [38.7937, -90.7857] }
];

const POPULAR_SEARCHES = [
  { label: '🧠 MRI', query: 'MRI' },
  { label: '🩻 CT Scan', query: 'CT Scan' },
  { label: '🦴 X-Ray', query: 'X-Ray' },
  { label: '💉 Blood Test', query: 'Blood Test' },
  { label: '🩺 Colonoscopy', query: 'Colonoscopy' }
];

const CATEGORIES = [
  { label: '🧠 Brain/Head', query: 'brain' },
  { label: '🦴 Spine', query: 'spine' },
  { label: '🫁 Chest', query: 'chest' },
  { label: '🫀 Abdomen', query: 'abdomen' },
  { label: '🦴 Pelvis', query: 'pelvis' },
  { label: '🦵 Extremities', query: 'extremities' },
  { label: '🩺 Breast', query: 'breast' },
  { label: '❤️ Cardiac', query: 'cardiac' }
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [zip, setZip] = useState('');
  const [cptCode, setCptCode] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const handleSearch = () => {
    if (!query.trim() && !cptCode.trim()) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set('procedure', query);
    if (zip.trim()) params.set('zip', zip);
    if (cptCode.trim()) params.set('cpt', cptCode);
    navigate(`/search?${params.toString()}`);
  };

  const handleQuickSearch = (searchQuery) => {
    navigate(`/search?procedure=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategoryClick = (categoryQuery) => {
    navigate(`/search?procedure=${encodeURIComponent(categoryQuery)}`);
    setShowCategories(false);
  };

  return (
    <div className="home">
      {/* HEADER */}
      <header className="home-header">
        <h1>MediPrice</h1>
        <p className="tagline">Compare Real Hospital Prices Near You</p>
        
        <nav className="home-nav">
          <button className="nav-link active">Search</button>
          <div 
            className="nav-link-dropdown"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="nav-link">Categories ▼</button>
            {showCategories && (
              <div className="categories-dropdown">
                {CATEGORIES.map((cat, i) => (
                  <button 
                    key={i} 
                    className="category-item"
                    onClick={() => handleCategoryClick(cat.query)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="nav-link" onClick={() => navigate('/community')}>Community</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-link" onClick={() => navigate('/faq')}>FAQ</button>
        </nav>
      </header>

      {/* HERO SEARCH */}
      <section className="hero">
        <h2 className="hero-title">What medical procedure do you need?</h2>
        <p className="hero-subtitle">Compare cash prices across 6 St. Louis hospitals instantly</p>
        
        <div className="hero-search">
          <input
            type="text"
            placeholder="Search procedure (e.g. MRI, CT Scan, X-Ray)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="hero-input"
          />
          <input
            type="text"
            placeholder="ZIP code"
            value={zip}
            onChange={e => setZip(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="hero-input-small"
          />
          <input
            type="text"
            placeholder="CPT code"
            value={cptCode}
            onChange={e => setCptCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="hero-input-small"
          />
          <button onClick={handleSearch} className="hero-button">Search Prices</button>
        </div>

        {/* MINI MAP PREVIEW */}
        <div className="mini-map">
          <MapContainer 
            center={[38.7, -90.3]} 
            zoom={9} 
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {HOSPITALS.map((hospital, i) => (
              <CircleMarker
                key={i}
                center={hospital.coords}
                radius={8}
                fillColor="#3b82f6"
                color="#fff"
                weight={2}
                fillOpacity={0.8}
              />
            ))}
          </MapContainer>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar">
        <div className="stat">
          <strong>50,000+</strong> Procedures
        </div>
        <div className="stat-divider">|</div>
        <div className="stat">
          <strong>6</strong> Hospitals
        </div>
        <div className="stat-divider">|</div>
        <div className="stat">
          <strong>Real</strong> Data
        </div>
      </section>

      {/* POPULAR SEARCHES */}
      <section className="popular-searches">
        <h3>Not sure what to search? Try these:</h3>
        <div className="search-shortcuts">
          {POPULAR_SEARCHES.map((item, i) => (
            <button 
              key={i} 
              className="shortcut-btn"
              onClick={() => handleQuickSearch(item.query)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* PRICE COMPARISON EXAMPLE */}
      <section className="comparison-section">
        <div className="comparison-panel">
          <h3 className="panel-title">Liver Biopsy (CPT 47000)</h3>
          <p className="panel-subtitle">Same procedure across 4 hospitals</p>
          
          <div className="price-bars">
            <div className="price-bar-item">
              <span className="bar-label">Hospital A</span>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: '56%', backgroundColor: '#22c55e' }}></div>
              </div>
              <span className="bar-price">$7,634</span>
            </div>
            
            <div className="price-bar-item">
              <span className="bar-label">Hospital B</span>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: '78%', backgroundColor: '#eab308' }}></div>
              </div>
              <span className="bar-price">$10,500</span>
            </div>
            
            <div className="price-bar-item">
              <span className="bar-label">Hospital C</span>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: '92%', backgroundColor: '#f59e0b' }}></div>
              </div>
              <span className="bar-price">$12,400</span>
            </div>
            
            <div className="price-bar-item">
              <span className="bar-label">Hospital D</span>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: '100%', backgroundColor: '#ef4444' }}></div>
              </div>
              <span className="bar-price">$13,683</span>
            </div>
          </div>
          
          <p className="panel-footer">1.8x price difference</p>
        </div>
      </section>
    </div>
  );
}