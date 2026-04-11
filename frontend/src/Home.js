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
  { label: 'MRI', query: 'MRI' },
  { label: 'CT Scan', query: 'CT Scan' },
  { label: 'X-Ray', query: 'X-Ray' },
  { label: 'Blood Test', query: 'Blood Test' },
  { label: 'Colonoscopy', query: 'Colonoscopy' }
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
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [priceExampleIndex, setPriceExampleIndex] = useState(0);

  const PRICE_EXAMPLES = [
    {
      procedure: 'Hip Replacement',
      multiplier: '2.7',
      hospitals: [
        { name: 'Missouri Baptist Sullivan', price: 35627 },
        { name: 'Progress West', price: 37760 },
        { name: 'Barnes-Jewish St. Peters', price: 52112 },
        { name: 'Barnes Jewish', price: 96000 },
      ]
    },
    {
      procedure: 'Gallbladder Removal',
      multiplier: '3.4',
      hospitals: [
        { name: 'Missouri Baptist Sullivan', price: 18852 },
        { name: 'Progress West', price: 25432 },
        { name: 'Missouri Baptist Medical', price: 27451 },
        { name: 'Barnes Jewish', price: 64100 },
      ]
    },
    {
      procedure: 'Pneumonia Treatment',
      multiplier: '2.8',
      hospitals: [
        { name: 'Missouri Baptist Sullivan', price: 13045 },
        { name: 'Parkland Health', price: 19209 },
        { name: 'Missouri Baptist Medical', price: 27766 },
        { name: 'Barnes Jewish', price: 41430 },
      ]
    },
    {
      procedure: 'C-Section',
      multiplier: '3.0',
      hospitals: [
        { name: 'Progress West', price: 9166 },
        { name: 'Parkland Health', price: 15001 },
        { name: 'Missouri Baptist Medical', price: 10414 },
        { name: 'Barnes Jewish', price: 23318 },
      ]
    },
    {
      procedure: 'Sepsis Treatment',
      multiplier: '8.1',
      hospitals: [
        { name: 'Missouri Baptist Sullivan', price: 38931 },
        { name: 'Parkland Health', price: 67761 },
        { name: 'Barnes-Jewish St. Peters', price: 127903 },
        { name: 'Barnes Jewish', price: 169360 },
      ]
    },
    {
      procedure: 'Heart Failure',
      multiplier: '3.5',
      hospitals: [
        { name: 'Missouri Baptist Sullivan', price: 11637 },
        { name: 'Parkland Health', price: 16847 },
        { name: 'Missouri Baptist Medical', price: 23243 },
        { name: 'St. Louis Children\'s', price: 36834 },
      ]
    },
  ];
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [medQuery, setMedQuery] = useState('');
  const [medCategory, setMedCategory] = useState(null);
  const [medResults, setMedResults] = useState([]);
  const [medLoading, setMedLoading] = useState(false);
  const [medSelected, setMedSelected] = useState(null);
  const [medCompare, setMedCompare] = useState([]);
  const [medCompareLoading, setMedCompareLoading] = useState(false);
  const [medTotal, setMedTotal] = useState(0);
  const [medOffset, setMedOffset] = useState(0);
  const [medLoadingMore, setMedLoadingMore] = useState(false);

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

  const SEARCH_SUGGESTIONS = [
    'MRI', 'X-Ray', 'CT Scan', 'Knee Replacement',
    'Blood Test', 'Hip Replacement', 'Colonoscopy'
  ];

  useEffect(() => {
    if (searchFocused) return;
    let suggestionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const current = SEARCH_SUGGESTIONS[suggestionIndex];
      if (!isDeleting) {
        setAnimatedPlaceholder(current.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          timeout = setTimeout(type, 1600);
        } else {
          timeout = setTimeout(type, 100);
        }
      } else {
        setAnimatedPlaceholder(current.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          suggestionIndex = (suggestionIndex + 1) % SEARCH_SUGGESTIONS.length;
          timeout = setTimeout(type, 400);
        } else {
          timeout = setTimeout(type, 60);
        }
      }
    };

    timeout = setTimeout(type, 600);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchFocused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceExampleIndex(prev => (prev + 1) % PRICE_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const searchMedications = async (q, cat, append = false) => {
    if (append) {
      setMedLoadingMore(true);
    } else {
      setMedLoading(true);
      setMedResults([]);
      setMedSelected(null);
      setMedCompare([]);
      setMedOffset(0);
      setMedTotal(0);
    }
    try {
      const offset = append ? medOffset + 50 : 0;
      let url = 'https://mediprice-backend.onrender.com/medications-search?';
      const params = [];
      if (q && q.trim()) params.push('query=' + encodeURIComponent(q.trim()));
      if (cat) params.push('category=' + encodeURIComponent(cat));
      params.push('offset=' + offset);
      url += params.join('&');
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.results) {
        setMedResults(prev => append ? [...prev, ...data.results] : data.results);
        setMedTotal(data.total);
        setMedOffset(offset);
      }
    } catch {
      if (!append) setMedResults([]);
    }
    if (append) {
      setMedLoadingMore(false);
    } else {
      setMedLoading(false);
    }
  };

  const compareMedication = async (name) => {
    setMedSelected(name);
    setMedCompareLoading(true);
    setMedCompare([]);
    try {
      const res = await fetch(`https://mediprice-backend.onrender.com/medications-compare?name=${encodeURIComponent(name)}`);
      const data = await res.json();
      setMedCompare(Array.isArray(data) ? data : []);
    } catch {
      setMedCompare([]);
    }
    setMedCompareLoading(false);
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
          <button className="nav-link" onClick={() => navigate('/share')}>Share</button>
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
            placeholder={animatedPlaceholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
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
      <h3>Frequently Searched Procedures</h3>
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

<div style={{ textAlign: 'center', marginTop: '20px' }}>
<button
  onClick={() => setShowHowItWorks(true)}
  className="shortcut-btn"
>
  ❓ How does MedExpense work?
</button>
</div>
</section>

{/* EXPLORE BY TYPE */}
<section className="explore-block-section">
  <div className="explore-block-panel">
    <button className="explore-main-btn" onClick={() => navigate('/explore')}>
      Explore by Type ↗
    </button>
    <div className="explore-category-grid">
    <button className="explore-cat-btn" onClick={() => navigate('/explore?category=imaging')}>Imaging</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=lab-tests')}>Lab Tests</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=emergency')}>Emergency</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=surgery')}>Surgery</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=preventive')}>Preventive</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=maternity')}>Maternity</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=cardiology')}>Cardiology</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=mental-health')}>Mental Health</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=orthopedics')}>Orthopedics</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=neurology')}>Neurology</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=gastroenterology')}>Gastroenterology</button>
<button className="explore-cat-btn" onClick={() => navigate('/explore?category=oncology')}>Oncology</button>
    </div>
  </div>
</section>

{/* MEDICATIONS & SUPPLIES TOOL */}
<section className="med-tool-section">
        <div className="med-tool-card" onClick={() => setShowMedModal(true)}>
          <div className="med-tool-left">
            <span className="med-tool-icon">💊</span>
            <div>
              <h3 className="med-tool-title">Medication & Supply Prices</h3>
              <p className="med-tool-subtitle">See what 25 St. Louis hospitals charge for medications, supplies, and equipment</p>
            </div>
          </div>
          <div className="med-tool-arrow">›</div>
        </div>
      </section>

      {/* PASTE THIS RIGHT HERE: */}
      <section className="share-cta-section">
  <div className="share-cta-card">
    <div className="share-cta-left">
      <span className="share-cta-icon">💬</span>
      <div>
        <h3 className="share-cta-title">Help Others Save</h3>
        <p className="share-cta-subtitle">Paid a different price than what's listed? Share it anonymously to help the St. Louis community.</p>
      </div>
    </div>
    <button onClick={() => navigate('/share')} className="share-cta-btn">
      Share What You Paid →
    </button>
  </div>
</section>

      {/* ROTATING PRICE COMPARISON */}
      <section className="comparison-section">
        <div className="comparison-panel" style={{ cursor: 'pointer' }} onClick={() => navigate(`/search?procedure=${encodeURIComponent(PRICE_EXAMPLES[priceExampleIndex].procedure)}`)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 className="panel-title" style={{ marginBottom: 0 }}>{PRICE_EXAMPLES[priceExampleIndex].procedure}</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>Live example ·  Search this →</span>
          </div>
          <p className="panel-subtitle">Real prices from St. Louis hospitals</p>

          <div className="price-bars">
            {PRICE_EXAMPLES[priceExampleIndex].hospitals.map((h, i) => {
              const max = Math.max(...PRICE_EXAMPLES[priceExampleIndex].hospitals.map(x => x.price));
              const min = Math.min(...PRICE_EXAMPLES[priceExampleIndex].hospitals.map(x => x.price));
              const barWidth = ((h.price - min) / (max - min || 1)) * 100;
              const barColor = barWidth < 33 ? '#22c55e' : barWidth < 66 ? '#eab308' : '#ef4444';
              return (
                <div key={i} className="price-bar-item">
                  <span className="bar-label" style={{ fontSize: '0.82rem' }}>{h.name}</span>
                  <div className="bar-wrapper">
                    <div className="bar" style={{ width: Math.max(barWidth, 4) + '%', backgroundColor: barColor }} />
                  </div>
                  <span className="bar-price" style={{ color: barColor }}>${h.price.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <p className="panel-footer" style={{ borderTop: 'none', paddingTop: 0, margin: 0 }}>
              {PRICE_EXAMPLES[priceExampleIndex].multiplier}x price difference
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {PRICE_EXAMPLES.map((_, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setPriceExampleIndex(i); }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === priceExampleIndex ? '#3b82f6' : '#e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

{/* GUIDE BLOCK */}
<section className="guide-block-section">
  <div className="guide-block-panel" onClick={() => setShowGuideModal(true)}>
    <div className="guide-block-left">
      <span className="guide-block-icon">📋</span>
      <div>
        <h3 className="guide-block-title">Your Complete Pre-Booking Guide</h3>
        <p className="guide-block-subtitle">MedExpense does half the work. Here's how to finish it.</p>
      </div>
    </div>
  </div>
</section>

{/* HOW IT WORKS MODAL */}
{showHowItWorks && (
  <div className="guide-modal-overlay" onClick={() => setShowHowItWorks(false)}>
    <div className="guide-modal" onClick={e => e.stopPropagation()}>
      <button className="guide-modal-close" onClick={() => setShowHowItWorks(false)}>✕</button>
      <div className="guide-modal-inner">
        <h2 className="guide-modal-title">How MedExpense Works</h2>
        <p className="guide-modal-subtitle">Hospitals are required by federal law to publish their prices. Most people don't know that — or where to find them. MedExpense does the work for you.</p>

        <div className="guide-section">
          <h4 className="guide-section-title">🔍 What it is</h4>
          <div className="guide-steps">
            <div className="guide-step">MedExpense is a free price transparency tool for the St. Louis area. We collect real cash prices from 25 local hospitals and put them in one place so you can compare before you go.</div>
            <div className="guide-step">The prices you see are the hospitals' own published cash prices — not estimates, not averages. Real numbers from their own files.</div>
          </div>
        </div>

        <div className="guide-section">
          <h4 className="guide-section-title">⚡ How to use it</h4>
          <div className="guide-steps">
            <div className="guide-step"><strong>1. Search any procedure</strong> — type what you need (MRI, blood test, knee replacement) and see prices from every hospital that has published one.</div>
            <div className="guide-step"><strong>2. Compare hospitals</strong> — click any hospital card to see all their matching procedures, total stay costs, and medication prices.</div>
            <div className="guide-step"><strong>3. Click any procedure</strong> — see a side-by-side price comparison across all 25 hospitals with a color-coded bar chart.</div>
            <div className="guide-step"><strong>4. Factor in your insurance</strong> — use the built-in calculator to see whether cash or insurance is cheaper for your situation.</div>
            <div className="guide-step"><strong>5. Book with confidence</strong> — use the pre-booking checklist to confirm the price before your appointment.</div>
          </div>
        </div>

        <div className="guide-section">
          <h4 className="guide-section-title">💬 Community prices</h4>
          <div className="guide-steps">
            <div className="guide-step">Official prices don't always tell the whole story. That's why MedExpense lets patients share what they actually paid — anonymously. The more people share, the more accurate the picture gets.</div>
          </div>
        </div>

        <div className="guide-section">
          <h4 className="guide-section-title">💊 Medication & supply prices</h4>
          <div className="guide-steps">
            <div className="guide-step">Ever been charged $45 for a Tylenol on a hospital bill? Use our Medication & Supply Prices tool to look up what any hospital charges for any medication or supply — and compare across all 25 hospitals.</div>
          </div>
        </div>

        <div className="guide-footer-note">
          MedExpense is free, independent, and doesn't charge hospitals to be listed. We exist because you deserve to know what healthcare costs before you get the bill.
        </div>
      </div>
    </div>
  </div>
)}


{/* GUIDE MODAL */}
{showGuideModal && (
  <div className="guide-modal-overlay" onClick={() => setShowGuideModal(false)}>
    <div className="guide-modal" onClick={e => e.stopPropagation()}>
      <button className="guide-modal-close" onClick={() => setShowGuideModal(false)}>✕</button>
      <div className="guide-modal-inner">
      
      <h2 className="guide-modal-title">Pre-Booking Price Verification Checklist</h2>
      <p className="guide-modal-subtitle">MedExpense shows you the price. Here's how to lock it in and avoid surprises.</p>

      <div className="guide-section">
        <h4 className="guide-section-title">📌 Before You Search</h4>
        <div className="guide-steps">
          <div className="guide-step">Locate your CPT code. Every procedure has one. It is the only language hospitals and insurers share — and the only way to confirm you are comparing the same service across providers. MedExpense displays it on every result.</div>
          <div className="guide-step">Determine your deductible position. If your annual deductible has not been met, your insurer will not reduce your cost — you pay the full contracted rate. Use the Factor in my Insurance tool on any procedure to calculate your true out-of-pocket before making any decisions.</div>
          <div className="guide-step">Confirm network status before assuming coverage. Call the member services number on your insurance card and verify that the specific facility is in-network. A physician can be in-network while the facility they operate out of is not. These are billed separately.</div>
        </div>
      </div>

      <div className="guide-section">
        <h4 className="guide-section-title">📞 After You Find a Price</h4>
        <div className="guide-steps">
          <div className="guide-step">Contact the hospital's <strong>Billing Department</strong> directly. Ask for financial services or patient billing.</div>
          <div className="guide-step">Request a Good Faith Estimate in writing before your appointment.</div>
          <div className="guide-step"><em>"I'd like to confirm the cash price for CPT code [X] and request a Good Faith Estimate in writing.</em></div>
          <div className="guide-step">Under the No Surprises Act, you are legally entitled to this document. If the representative is unfamiliar with the requirement, ask to speak with a supervisor.</div>
          <div className="guide-step">Do not schedule until you have the estimate in hand. A verbal confirmation is not a commitment.
          </div>
        </div>
      </div>

      <div className="guide-section">
        <h4 className="guide-section-title">❓ Questions to Ask Before You Hang Up</h4>
        <div className="guide-steps">
          <div className="guide-step">Will the radiologist, anesthesiologist, or assistant surgeon bill separately? (They typically do.)</div>
          <div className="guide-step">Is every provider involved in this procedure in-network under my specific plan?</div>
          <div className="guide-step">Is there a discounted rate available for cash payment at time of service?</div>
          <div className="guide-step">Does this facility have a financial assistance or charity care program?</div>
        </div>
      </div>

      <div className="guide-section">
        <h4 className="guide-section-title">🧾 If Your Bill Does Not Match What You Were Quoted</h4>
        <div className="guide-steps">
          <div className="guide-step">Request a fully itemized statement immediately. Not a summary. Every line item, every code, every charge.</div>
          <div className="guide-step">Compare every charge against your Good Faith Estimate. Any discrepancy is grounds for a formal dispute.</div>
          <div className="guide-step">Ask for the <strong>Billing Manager</strong>, not a front line rep. Managers have authority to adjust charges.</div>
          <div className="guide-step">Negotiate. The amount on your first bill is rarely the final number. Hospitals reduce charges regularly — for errors, for financial hardship, and for patients who simply ask. You are expected to push back.</div>
        </div>
      </div>

      <div className="guide-footer-note">
        The American healthcare billing system is complicated by design. MedExpense exists to level the playing field — one price at a time.
        </div>
      </div> {/* closes guide-modal-inner */}
    </div>
  </div>
)}



      {/* MEDICATIONS MODAL */}
      {showMedModal && (
        <div className="guide-modal-overlay" onClick={() => { setShowMedModal(false); setMedQuery(''); setMedCategory(null); setMedResults([]); setMedSelected(null); setMedCompare([]); }}>
          <div className="guide-modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <button className="guide-modal-close" onClick={() => { setShowMedModal(false); setMedQuery(''); setMedCategory(null); setMedResults([]); setMedSelected(null); setMedCompare([]); }}>✕</button>
            
            <div className="guide-modal-inner">
              <h2 className="guide-modal-title">💊 Medication & Supply Prices</h2>
              <p className="guide-modal-subtitle">Search what hospitals charge for any medication, supply, or equipment across 25 St. Louis hospitals.</p>

              {/* SEARCH BAR */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search (e.g. Tylenol, catheter, insulin...)"
                  value={medQuery}
                  onChange={e => setMedQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setMedCategory(null); searchMedications(medQuery, null); }}}
                  style={{ flex: 1, padding: '12px 16px', fontSize: '0.95rem', border: '2px solid #e2e8f0', borderRadius: '10px', outline: 'none' }}
                />
                <button
                  onClick={() => { setMedCategory(null); searchMedications(medQuery, null); }}
                  style={{ padding: '12px 20px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
                >
                  Search
                </button>
              </div>

              {/* CATEGORY GRID */}
              {!medLoading && medResults.length === 0 && !medSelected && (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px', fontWeight: '500' }}>Or browse by category:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    {[
                      { label: '💊 Oral Meds', key: 'oral' },
                      { label: '🩺 IV & Infusions', key: 'iv' },
                      { label: '💉 Injections', key: 'injections' },
                      { label: '🔬 Catheters', key: 'catheters' },
                      { label: '🩹 Surgical Supplies', key: 'surgical' },
                      { label: '🦾 Implants & Devices', key: 'implants' },
                      { label: '😮‍💨 Respiratory', key: 'respiratory' },
                      { label: '🧬 Vaccines', key: 'vaccines' },
                    ].map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => { setMedCategory(cat.key); setMedQuery(''); searchMedications('', cat.key); }}
                        style={{
                          padding: '12px 8px',
                          background: medCategory === cat.key ? '#eff6ff' : '#f8fafc',
                          border: medCategory === cat.key ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.82rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          color: medCategory === cat.key ? '#1e40af' : '#334155',
                          transition: 'all 0.15s',
                          textAlign: 'center'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LOADING */}
              {medLoading && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
                  <p style={{ fontSize: '0.9rem' }}>Searching...</p>
                </div>
              )}

              {/* RESULTS LIST */}
              {!medLoading && medResults.length > 0 && !medSelected && (
                <div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '12px' }}>{medResults.length} of {medTotal} results — click any item to compare prices across hospitals</p>
                  <div id="med-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                    {medResults.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => compareMedication(item.procedure_name)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '500', flex: 1, paddingRight: '12px' }}>{item.procedure_name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: '700' }}>${parseFloat(item.min_price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.hospital_count} hospitals</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {medResults.length < medTotal && (
                    <button
                    onClick={() => searchMedications(medQuery, medCategory, true)}
                    disabled={medLoadingMore}
                    style={{ marginTop: '16px', width: '100%', padding: '12px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', color: '#1e40af', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {medLoadingMore ? 'Loading...' : `Load 50 More (${medTotal - medResults.length} remaining)`}
                  </button>
                  )}
                  <button onClick={() => { setMedResults([]); setMedCategory(null); setMedQuery(''); setMedOffset(0); setMedTotal(0); }} style={{ position: 'absolute', top: '16px', right: '56px', background: 'none', border: 'none', color: '#1e40af', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>← Back</button>
                </div>
              )}

              {/* COMPARE SIDE PANEL */}
              {medSelected && (
                <div>
                  <button onClick={() => { setMedSelected(null); setMedCompare([]); }} style={{ background: 'none', border: 'none', color: '#1e40af', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '16px', padding: 0 }}>← Back to results</button>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{medSelected}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>Price comparison across hospitals</p>

                  {medCompareLoading && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                      <div style={{ width: '24px', height: '24px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px auto' }} />
                      <p style={{ fontSize: '0.85rem' }}>Loading...</p>
                    </div>
                  )}

                  {!medCompareLoading && medCompare.length > 0 && (() => {
                    const prices = medCompare.map(r => parseFloat(r.price));
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                        {medCompare.map((r, i) => {
                          const price = parseFloat(r.price);
                          const barWidth = ((price - min) / (max - min || 1)) * 100;
                          const barColor = barWidth < 33 ? '#22c55e' : barWidth < 66 ? '#eab308' : '#ef4444';
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px', alignItems: 'center', gap: '12px' }}>
                              <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500', lineHeight: '1.3' }}>{r.hospital_name}</div>
                              <div style={{ background: '#f1f5f9', height: '28px', borderRadius: '6px', overflow: 'hidden' }}>
                                <div style={{ width: Math.max(barWidth, 4) + '%', height: '100%', backgroundColor: barColor, borderRadius: '6px', transition: 'width 0.4s ease' }} />
                              </div>
                              <div style={{ fontSize: '0.95rem', fontWeight: '700', color: barColor, textAlign: 'right' }}>${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                          );
                        })}
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', lineHeight: '1.5' }}>
                          ⚠️ Prices are from federally mandated hospital price transparency files. Actual charges may vary.
                        </p>
                      </div>
                    );
                  })()}

                  {!medCompareLoading && medCompare.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No price data available for this item.</p>
                  )}
                </div>
              )}

              {/* NO RESULTS */}
              {!medLoading && medResults.length === 0 && medQuery && !medSelected && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '24px 0' }}>No results found. Try a different search term.</p>
              )}
            </div>
          </div>
        </div>
      )}

     {/* COMBINED EDU + HOW IT WORKS */}
<section className="edu-how-section">
  <div className="edu-how-panel">
    <p className="edu-block-heading">Healthcare pricing isn't standardized — costs can vary widely between providers.</p>
    <p className="edu-block-body">
      Prices for the exact same procedure can change significantly depending on where you go. 
      In many cases, paying cash can actually be less expensive than using insurance. 
      A quick search could save you hundreds, or even thousands. 
      Compare real prices before choosing — it only takes a few seconds.
    </p>

    <div className="edu-divider" />

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

{/* FOOTER */}
<footer className="home-footer">
    <div className="footer-top">
      <div className="footer-brand">
        <span className="footer-logo">MedExpense</span>
        <span className="footer-copy">© 2026</span>
      </div>
      <div className="footer-links">
  <button className="footer-link" onClick={() => handleSearch()}>Search</button>
  <button className="footer-link" onClick={() => navigate('/about')}>About</button>
  <button className="footer-link" onClick={() => navigate('/faq')}>FAQ</button>
  <button className="footer-link" onClick={() => navigate('/share')}>Share</button>
  <button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button>
  <button className="footer-link" onClick={() => navigate('/terms')}>Terms of Service</button>
</div>
    </div>
    <div className="footer-disclaimer">
      Data sourced from federally mandated hospital price transparency files. Prices are for informational purposes only.
    </div>
  </footer>

</div>
  );
}