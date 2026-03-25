import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

const HOSPITALS = [
    { name: 'Saint Anthonys Hospital', coords: [38.907626, -90.172100] },
    { name: 'Alton Memorial Hospital', coords: [38.899890, -90.160060] },
    { name: 'SSM Health Saint Louis University Hospital', coords: [38.624243, -90.239151] },
    { name: 'SSM Health St. Clare Hospital', coords: [38.528012, -90.475846] },
    { name: "SSM Health St. Mary's Hospital", coords: [38.633082, -90.311083] },
    { name: 'SSM Health St. Joseph Hospital', coords: [38.803112, -90.775874] },
    { name: 'Gateway Regional Medical Center', coords: [38.700700, -90.144500] },
    { name: "HSHS St. Elizabeth's Hospital", coords: [38.583791, -89.932180] },
    { name: "HSHS St. Joseph's Hospital Highland", coords: [38.754634, -89.670160] },
    { name: "HSHS St. Joseph's Hospital Breese", coords: [38.626295, -89.526533] },
    { name: 'HSHS St. Francis Hospital', coords: [39.179797, -89.640194] },
    { name: 'Anderson Hospital', coords: [38.738000, -89.947800] },
    { name: "HSHS St. Anthony's Memorial Hospital", coords: [39.126527, -88.552469] },
    { name: 'Barnes Jewish Hospital', coords: [38.6348, -90.2630] },
    { name: 'Christian Hospital', coords: [38.7719, -90.2359] },
    { name: 'Missouri Baptist Medical Center', coords: [38.6351, -90.4405] },
    { name: 'Missouri Baptist Sullivan Hospital', coords: [38.2087, -91.1565] },
    { name: 'Parkland Health Center', coords: [37.7820, -90.4237] },
    { name: 'Progress West Hospital', coords: [38.7631, -90.6800] },
    { name: "St. Louis Children's Hospital", coords: [38.6362, -90.2626] },
    { name: 'Barnes-Jewish West County Hospital', coords: [38.6601, -90.4475] },
    { name: 'Barnes-Jewish St. Peters Hospital', coords: [38.7888, -90.6288] },
    { name: 'SSM Health DePaul Hospital', coords: [38.7364, -90.4197] },
    { name: 'SSM Health St. Joseph Hospital St. Charles', coords: [38.7836, -90.4990] },
    { name: 'SSM Health St. Joseph Hospital Wentzville', coords: [38.8043, -90.8631] },
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
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <h1>MedExpense</h1>
        <p className="tagline">Compare Real Hospital Prices Near You</p>
        
        <nav className="home-nav">
          <button className="nav-link active">Search</button>
          <div className="nav-link-dropdown" ref={dropdownRef}>
            <button 
              className="nav-link"
              onClick={() => setShowCategories(!showCategories)}
            >
              Categories ▼
            </button>
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
        <p className="hero-subtitle">Compare cash prices across 25 St. Louis hospitals instantly</p>
        
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
        <strong>200,000+</strong> Procedures
        </div>
        <div className="stat-divider">|</div>
        <div className="stat">
        <strong>25</strong> Hospitals
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

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <div className="how-it-works-panel">
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4 className="step-title">Search</h4>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4 className="step-title">Compare</h4>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4 className="step-title">Save</h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}