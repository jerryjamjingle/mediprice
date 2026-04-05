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
  const [comparisonProcedure, setComparisonProcedure] = useState(null);
  const [radius, setRadius] = useState('50');
const [deductibleTotal, setDeductibleTotal] = useState('');
const [deductibleMet, setDeductibleMet] = useState('');
const [coinsurance, setCoinsurance] = useState('');
const [oopMax, setOopMax] = useState('');
const [oopMet, setOopMet] = useState('');
const [activePanel, setActivePanel] = useState(null); // 'checklist' | 'calculator' | null
const [showShareForm, setShowShareForm] = useState(false);
const [shareAmountPaid, setShareAmountPaid] = useState('');
const [sharePaymentType, setSharePaymentType] = useState('');
const [shareInsuranceCarrier, setShareInsuranceCarrier] = useState('');
const [sharePriceHonored, setSharePriceHonored] = useState('');
const [shareComment, setShareComment] = useState('');
const [shareDisplayName, setShareDisplayName] = useState('');
const [shareSubmitStatus, setShareSubmitStatus] = useState(null);
const [hospitalReviews, setHospitalReviews] = useState([]);
const [hospitalReviewsLoading, setHospitalReviewsLoading] = useState(false);
const [showHospitalReviews, setShowHospitalReviews] = useState(false);

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
    setComparisonProcedure(null);
    try {
      let url = 'https://mediprice-backend.onrender.com/search?';
      let params = [];
      
      if (query.trim()) params.push('procedure=' + encodeURIComponent(query));
      if (zip.trim()) params.push('zip=' + encodeURIComponent(zip.trim()));
      if (cptCode.trim()) params.push('cpt=' + encodeURIComponent(cptCode.trim()));
      if (zip.trim() && radius) params.push('radius=' + encodeURIComponent(radius));
      
      url += params.join('&');
      
      const res = await fetch(url);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const compareProcedure = async (proc) => {
    setComparisonProcedure({ loading: true, procedure: proc, data: null });
    try {
      let url = 'https://mediprice-backend.onrender.com/compare-procedure?';
      let params = [];
      if (proc.procedure_name) params.push('name=' + encodeURIComponent(proc.procedure_name));
      if (proc.cpt_code) params.push('cpt=' + encodeURIComponent(proc.cpt_code));
      url += params.join('&');
      const res = await fetch(url);
      const data = await res.json();
      setComparisonProcedure({ loading: false, procedure: proc, data });
    } catch (err) {
      setComparisonProcedure({ loading: false, procedure: proc, data: { exact: [], similar: [] } });
    }
  };

  const submitShareForm = async () => {
    if (!shareAmountPaid || !sharePaymentType || !sharePriceHonored) return;
    setShareSubmitStatus('loading');
    try {
      const res = await fetch('https://mediprice-backend.onrender.com/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_name: selectedHospital?.hospitalName,
          procedure_name: comparisonProcedure?.procedure?.procedure_name,
          service_month: new Date().toISOString().slice(0, 7),
          amount_paid: parseFloat(shareAmountPaid),
          payment_type: sharePaymentType,
          insurance_carrier: shareInsuranceCarrier || null,
          price_honored: sharePriceHonored === "Wasn't quoted" ? 'N/A' : sharePriceHonored,
          comment: shareComment || null,
          display_name: shareDisplayName || null,
        })
      });
      if (res.ok) {
        setShareSubmitStatus('success');
      } else {
        setShareSubmitStatus('error');
      }
    } catch {
      setShareSubmitStatus('error');
    }
  };

  const fetchHospitalReviews = async (hospitalName) => {
    setHospitalReviewsLoading(true);
    setShowHospitalReviews(true);
    try {
      const res = await fetch(`https://mediprice-backend.onrender.com/get-reviews?hospital=${encodeURIComponent(hospitalName)}`);
      const data = await res.json();
      setHospitalReviews(Array.isArray(data) ? data : []);
    } catch {
      setHospitalReviews([]);
    }
    setHospitalReviewsLoading(false);
  };

  const prices = results.map(r => parseFloat(r.discounted_cash)).filter(p => !isNaN(p) && p >= 10);

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
  <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>MedExpense</h1>
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
        />
        <input
          type="text"
          placeholder="CPT code"
          value={cptCode}
          onChange={e => setCptCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          className="cpt-input"
        />
        {zip.trim() && (
  <select
    value={radius}
    onChange={e => setRadius(e.target.value)}
    className="radius-select"
  >
    <option value="5">5 mi</option>
    <option value="10">10 mi</option>
    <option value="25">25 mi</option>
    <option value="50">50 mi</option>
    <option value="100">100 mi</option>
  </select>
)}
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
                    <div className="hospital-rank-badge">
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
  <div className="modal-overlay" onClick={() => { setSelectedHospital(null); setComparisonProcedure(null); setShowShareForm(false); setShowHospitalReviews(false); setHospitalReviews([]); setShareAmountPaid(''); setSharePaymentType(''); setShareInsuranceCarrier(''); setSharePriceHonored(''); setShareComment(''); setShareDisplayName(''); setShareSubmitStatus(null); }}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
    <button className="modal-close" onClick={() => { setSelectedHospital(null); setComparisonProcedure(null); setShowShareForm(false); setShowHospitalReviews(false); setHospitalReviews([]); setShareAmountPaid(''); setSharePaymentType(''); setShareInsuranceCarrier(''); setSharePriceHonored(''); setShareComment(''); setShareDisplayName(''); setShareSubmitStatus(null); }}>×</button>

      
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
    <a href={selectedHospital.procedures[0].website} target="_blank" rel="noopener noreferrer" className="contact-link">
      🌐 Website
    </a>
  )}
  <a href={`https://www.google.com/search?q=${encodeURIComponent(selectedHospital.hospitalName + ' ' + selectedHospital.city + ' reviews')}`} target="_blank" rel="noopener noreferrer" className="contact-link">🔍 Google Reviews</a>
</div>

<button
  className="hospital-reviews-btn"
  onClick={(e) => { e.stopPropagation(); fetchHospitalReviews(selectedHospital.hospitalName); }}
>
  ⭐ Patient Price Reviews →
</button>

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
            <div key={idx} className="procedure-item" onClick={(e) => { e.stopPropagation(); compareProcedure(proc); }}>
              <div className="procedure-item-name">{proc.procedure_name}</div>
              <div className="procedure-item-price">
              {parseFloat(proc.discounted_cash) < 1 ? 'Not Listed' : `$${parseFloat(proc.discounted_cash).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HOSPITAL REVIEWS PANEL */}
{showHospitalReviews && (
  <div className="side-panel" style={{ zIndex: 3 }}>
    <button className="side-panel-back" onClick={() => setShowHospitalReviews(false)}>← Back</button>
    <h3 className="share-form-title">⭐ Patient Price Reviews</h3>
    <p className="share-form-subtitle">Community reported — not verified by MedExpense</p>

    {hospitalReviewsLoading && (
      <div className="reviews-loading" style={{ marginTop: '24px' }}>
        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
        <p>Loading reviews...</p>
      </div>
    )}

    {!hospitalReviewsLoading && hospitalReviews.length === 0 && (
      <div className="reviews-empty" style={{ marginTop: '24px' }}>
        <p>No reviews yet for this hospital.</p>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '8px' }}>
          Click a procedure and use "Paid a different price?" to be the first.
        </p>
      </div>
    )}

    {!hospitalReviewsLoading && hospitalReviews.length > 0 && (
      <div className="reviews-list" style={{ marginTop: '16px' }}>
        {hospitalReviews.map((review, i) => (
          <div key={i} className="review-card">
            <div className="review-top">
              <span className="review-procedure">{review.procedure_name}</span>
              <span className={`review-honored ${review.price_honored === 'Yes' ? 'honored-yes' : review.price_honored === 'No' ? 'honored-no' : 'honored-na'}`}>
                {review.price_honored === 'Yes' ? '✓ Honored' : review.price_honored === 'No' ? '✗ Not Honored' : '— Not Quoted'}
              </span>
            </div>
            <div className="review-details">
              <span className="review-paid">Paid: <strong>${parseFloat(review.amount_paid).toFixed(0)}</strong></span>
              <span className="review-type">{review.payment_type}</span>
              {review.insurance_carrier && <span className="review-carrier">{review.insurance_carrier}</span>}
              <span className="review-date">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            {review.comment && <p className="review-comment">"{review.comment}"</p>}
            <p className="review-author">— {review.display_name || 'Anonymous'}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
     
      {comparisonProcedure && (
  <div className="comparison-overlay">
    <div className="comparison-header">
    <button className="comparison-back" onClick={() => { 
  setComparisonProcedure(null); 
  setActivePanel(null);
  setDeductibleTotal(''); 
  setDeductibleMet('');
  setCoinsurance('');
  setOopMax('');
  setOopMet('');
}}>
  ← Back
</button>
      <h3>{comparisonProcedure.procedure?.procedure_name}</h3>
      {comparisonProcedure.procedure?.cpt_code && (
        <span className="comparison-cpt">CPT: {comparisonProcedure.procedure.cpt_code}</span>
      )}
    </div>

    {/* --- ADD THIS NEW SECTION --- */}
<div className="comparison-cta-container">
  <button 
    className="comparison-share-btn"
    onClick={() => setShowShareForm(true)}
  >
    💬 Paid a different price? Share it here
  </button>
</div>

{/* TWO BUTTONS ROW */}
{!activePanel && (
  <div className="panel-btn-row">
    <button className="panel-half-btn" onClick={() => setActivePanel('checklist')}>
      📋 Before You Book
    </button>
    <button className="panel-half-btn" onClick={() => setActivePanel('calculator')}>
      📊 Factor in my Insurance
    </button>
  </div>
)}

{/* CHECKLIST PANEL */}
{activePanel === 'checklist' && (
  <div className="side-panel">
    <button className="side-panel-back" onClick={() => setActivePanel(null)}>← Back</button>
    <div className="estimator-body">
      {(() => {
        const cpt = comparisonProcedure?.procedure?.cpt_code || '';
        const name = comparisonProcedure?.procedure?.procedure_name?.toLowerCase() || '';
        const isImaging = name.includes('mri') || name.includes('ct') || name.includes('x-ray') || name.includes('xray') || name.includes('ultrasound') || name.includes('scan');
        const isSurgery = name.includes('surgery') || name.includes('repair') || name.includes('replacement') || name.includes('removal') || name.includes('ectomy') || name.includes('otomy');
        const isLab = name.includes('panel') || name.includes('blood') || name.includes('lab') || name.includes('urinalysis') || name.includes('test');

        const generalSteps = [
          { text: `Confirm the cash price matches CPT code ${cpt || 'shown'} before your appointment` },
          { text: 'Request a Good Faith Estimate in writing — you are legally entitled to this under the No Surprises Act' },
          { text: 'Ask if they have financial assistance or charity care programs' },
          { text: 'Ask if paying cash upfront gets you a discount' },
          { text: 'Know that hospitals negotiate — the first number is rarely the final number' },
        ];

        const imagingSteps = [
          { text: `Confirm the cash price matches CPT code ${cpt || 'shown'}` },
          { text: 'Ask if a radiologist reads separately — that is a separate bill' },
          { text: 'Ask if contrast dye is included or billed extra' },
          { text: 'Request a Good Faith Estimate in writing — you are legally entitled to this' },
          { text: 'Ask if this facility is in-network if using insurance' },
        ];

        const surgerySteps = [
          { text: 'Confirm surgeon, anesthesiologist, and facility are all in-network' },
          { text: 'Ask for the anesthesia fee estimate separately — it is almost always a separate bill' },
          { text: 'Ask if an assistant surgeon is billed separately' },
          { text: 'Request an itemized Good Faith Estimate before booking' },
          { text: 'Ask about post-op follow up visit costs' },
        ];

        const labSteps = [
          { text: 'Ask if the lab is in-network — it often is not even if your doctor is' },
          { text: 'Request results be sent directly to you' },
          { text: 'Ask if there is a cash discount if paying same day' },
          { text: 'Confirm which lab is processing your sample — it may not be the one at the facility' },
        ];

        const steps = isImaging ? imagingSteps : isSurgery ? surgerySteps : isLab ? labSteps : generalSteps;

        return (
          <>
            <p className="estimator-intro">
              MedExpense found you the price. Here's how to confirm it and avoid surprises before you book.
            </p>
            <div className="checklist-steps">
              {steps.map((step, i) => (
                <div key={i} className="checklist-step">
                  <span className="checklist-icon">✅</span>
                  <span className="checklist-text">{step.text}</span>
                </div>
              ))}
            </div>
            <div className="checklist-tip">
              💡 Say this when you call: <em>"I'd like to confirm the cash price for CPT code {cpt || '[shown above]'} and request a Good Faith Estimate in writing."</em>
            </div>
          </>
        );
      })()}
    </div>
  </div>
)}

{/* CALCULATOR PANEL */}
{activePanel === 'calculator' && (
  <div className="side-panel">
    <button className="side-panel-back" onClick={() => setActivePanel(null)}>← Back</button>
    <div className="estimator-body">
      <p className="estimator-intro">
        Enter your insurance details to see what you'd actually pay — and whether cash might be cheaper.
      </p>
      <div className="estimator-inputs">
        <div className="estimator-input-group">
          <label>Total deductible</label>
          <div className="estimator-input-wrap">
            <span className="estimator-dollar">$</span>
            <input type="number" placeholder="e.g. 3000" value={deductibleTotal} onChange={e => setDeductibleTotal(e.target.value)} className="estimator-input" />
          </div>
        </div>
        <div className="estimator-input-group">
          <label>Deductible met so far</label>
          <div className="estimator-input-wrap">
            <span className="estimator-dollar">$</span>
            <input type="number" placeholder="e.g. 500" value={deductibleMet} onChange={e => setDeductibleMet(e.target.value)} className="estimator-input" />
          </div>
        </div>
        <div className="estimator-input-group">
          <label>Coinsurance rate</label>
          <div className="estimator-input-wrap">
            <span className="estimator-dollar">%</span>
            <input type="number" placeholder="e.g. 20" value={coinsurance} onChange={e => setCoinsurance(e.target.value)} className="estimator-input" />
          </div>
        </div>
        <div className="estimator-input-group">
          <label>Out-of-pocket max</label>
          <div className="estimator-input-wrap">
            <span className="estimator-dollar">$</span>
            <input type="number" placeholder="e.g. 6000" value={oopMax} onChange={e => setOopMax(e.target.value)} className="estimator-input" />
          </div>
        </div>
        <div className="estimator-input-group">
          <label>Out-of-pocket met so far</label>
          <div className="estimator-input-wrap">
            <span className="estimator-dollar">$</span>
            <input type="number" placeholder="e.g. 1000" value={oopMet} onChange={e => setOopMet(e.target.value)} className="estimator-input" />
          </div>
        </div>
      </div>
      {deductibleTotal && deductibleMet && comparisonProcedure?.data?.exact?.length > 0 && (() => {
        const cashPrice = parseFloat(comparisonProcedure.data.exact[0]?.discounted_cash);
        const total = parseFloat(deductibleTotal) || 0;
        const met = parseFloat(deductibleMet) || 0;
        const coinsuranceRate = parseFloat(coinsurance) / 100 || 0.2;
        const oop = parseFloat(oopMax) || 999999;
        const oopMetSoFar = parseFloat(oopMet) || 0;
        const deductibleRemaining = Math.max(total - met, 0);
        const oopRemaining = Math.max(oop - oopMetSoFar, 0);
        let insuranceCost = 0;
        if (oopRemaining === 0) {
          insuranceCost = 0;
        } else if (cashPrice <= deductibleRemaining) {
          insuranceCost = Math.min(cashPrice, oopRemaining);
        } else {
          const afterDeductible = cashPrice - deductibleRemaining;
          insuranceCost = Math.min(deductibleRemaining + (afterDeductible * coinsuranceRate), oopRemaining);
        }
        const cashIsCheaper = cashPrice < insuranceCost;
        const savings = Math.abs(insuranceCost - cashPrice);
        return (
          <div className="estimator-result">
            <div className="estimator-result-row">
              <span className="estimator-result-label">💵 Cash price</span>
              <span className="estimator-result-value">${cashPrice.toFixed(0)}</span>
            </div>
            <div className="estimator-result-row">
              <span className="estimator-result-label">🏥 Estimated cost through insurance</span>
              <span className="estimator-result-value">${insuranceCost.toFixed(0)}</span>
            </div>
            {deductibleRemaining > 0 && (
              <div className="estimator-breakdown">
                <span>Deductible still owed: <strong>${deductibleRemaining.toFixed(0)}</strong></span>
                {coinsurance && <span>Coinsurance rate: <strong>{coinsurance}%</strong></span>}
                {oopMax && oopRemaining < 999999 && <span>Out-of-pocket remaining: <strong>${oopRemaining.toFixed(0)}</strong></span>}
              </div>
            )}
            <div className={`estimator-verdict ${cashIsCheaper ? 'verdict-cash' : 'verdict-insurance'}`}>
              {oopRemaining === 0
                ? `✅ You've hit your out-of-pocket max — insurance covers this 100%!`
                : cashIsCheaper
                  ? `💰 Cash is cheaper — you'd save $${savings.toFixed(0)} by paying cash`
                  : `🏥 Insurance is cheaper — you'd save $${savings.toFixed(0)} using insurance`
              }
            </div>
            <p className="estimator-disclaimer">
              This is an estimate only. Actual costs may vary based on your specific plan, copays, and coinsurance terms.
            </p>
          </div>
        );
      })()}
    </div>
  </div>
)}

{/* SHARE FORM PANEL */}
{showShareForm && (
  <div className="side-panel" style={{ zIndex: 3 }}>
    <button className="side-panel-back" onClick={() => setShowShareForm(false)}>← Back</button>
    <div className="share-form-inner">
      <h3 className="share-form-title">💬 Share What You Paid</h3>
      <p className="share-form-subtitle">Help others know what to expect. Takes 30 seconds.</p>

      <div className="share-form-group">
        <label>Hospital</label>
        <div className="share-form-readonly">{selectedHospital?.hospitalName}</div>
      </div>
      <div className="share-form-group">
        <label>Procedure</label>
        <div className="share-form-readonly">{comparisonProcedure?.procedure?.procedure_name}</div>
      </div>

      <div className="share-form-group">
        <label>Amount you paid <span className="share-form-required">*</span></label>
        <div className="estimator-input-wrap">
          <span className="estimator-dollar">$</span>
          <input
            type="number"
            className="estimator-input"
            placeholder="e.g. 450"
            value={shareAmountPaid}
            onChange={e => setShareAmountPaid(e.target.value)}
          />
        </div>
      </div>

      <div className="share-form-group">
        <label>How did you pay? <span className="share-form-required">*</span></label>
        <div className="share-form-btn-group">
          {['Cash', 'Insurance', 'Medicare', 'Medicaid'].map(type => (
            <button
              key={type}
              className={`share-form-option-btn ${sharePaymentType === type ? 'selected' : ''}`}
              onClick={() => setSharePaymentType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {sharePaymentType === 'Insurance' && (
        <div className="share-form-group">
          <label>Insurance carrier <span className="share-form-optional">(optional)</span></label>
          <input
            type="text"
            className="share-form-input"
            placeholder="e.g. Cigna, Aetna, BCBS"
            value={shareInsuranceCarrier}
            onChange={e => setShareInsuranceCarrier(e.target.value)}
          />
        </div>
      )}

      <div className="share-form-group">
        <label>Was the quoted price honored? <span className="share-form-required">*</span></label>
        <div className="share-form-btn-group">
          {['Yes', 'No', "Wasn't quoted"].map(opt => (
            <button
              key={opt}
              className={`share-form-option-btn ${sharePriceHonored === opt ? 'selected' : ''}`}
              onClick={() => setSharePriceHonored(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="share-form-group">
        <label>Any other details? <span className="share-form-optional">(optional)</span></label>
        <textarea
          className="share-form-textarea"
          placeholder="e.g. They tried to bill me more but I negotiated it down..."
          value={shareComment}
          onChange={e => setShareComment(e.target.value)}
          rows={3}
        />
      </div>

      <div className="share-form-group">
        <label>Your name <span className="share-form-optional">(optional)</span></label>
        <input
          type="text"
          className="share-form-input"
          placeholder="Leave blank to post as Anonymous"
          value={shareDisplayName}
          onChange={e => setShareDisplayName(e.target.value)}
        />
      </div>

      {shareSubmitStatus === 'success' ? (
        <div className="share-form-success">
          ✅ Thanks for sharing! Your review helps others save.
        </div>
      ) : (
        <button
          className="share-form-submit-btn"
          onClick={submitShareForm}
          disabled={shareSubmitStatus === 'loading'}
        >
          {shareSubmitStatus === 'loading' ? 'Submitting...' : 'Submit Review →'}
        </button>
      )}
      {shareSubmitStatus === 'error' && (
        <p className="share-form-error">Something went wrong. Please try again.</p>
      )}
    </div>
  </div>
)}
      {comparisonProcedure.loading && (
      <div className="comparison-loading">
        <div className="spinner"></div>
        <p>Finding prices...</p>
      </div>
    )}

    {!comparisonProcedure.loading && comparisonProcedure.data && (
      <div className="comparison-body">

        {comparisonProcedure.data.exact.length > 0 && (
          <>
            <p className="comparison-section-title">💰 Prices Across Hospitals</p>
            {(() => {
              const validPrices = comparisonProcedure.data.exact
                .map(r => parseFloat(r.discounted_cash))
                .filter(p => p >= 1);
              const min = Math.min(...validPrices);
              const max = Math.max(...validPrices);
              return comparisonProcedure.data.exact.map((r, i) => {
                const price = parseFloat(r.discounted_cash);
                const isNotListed = price < 1;
                const barWidth = isNotListed ? 0 : ((price - min) / (max - min || 1)) * 100;
                const barColor = isNotListed ? '#e2e8f0' :
                  barWidth < 33 ? '#22c55e' :
                  barWidth < 66 ? '#eab308' : '#ef4444';
                return (
                  <div key={i} className="comparison-row">
                    <div className="comparison-rank">#{i + 1}</div>
                    <div className="comparison-hospital-name">{r.hospital_name}</div>
                    <div className="comparison-bar-wrap">
                      <div className="comparison-bar" style={{ width: Math.max(barWidth, 4) + '%', backgroundColor: barColor }} />
                    </div>
                    <div className="comparison-price" style={{ color: barColor }}>
                      {isNotListed ? 'N/A' : '$' + price.toFixed(0)}
                    </div>
                  </div>
                );
              });
            })()}
          </>
        )}

        {comparisonProcedure.data.similar.length > 0 && (
          <>
            <p className="comparison-section-title" style={{ marginTop: '24px' }}>🔍 Similar Procedures</p>
            {comparisonProcedure.data.similar.map((r, i) => {
              const similarPrices = comparisonProcedure.data.similar
                .map(s => parseFloat(s.discounted_cash))
                .filter(p => p >= 1);
              const sMin = Math.min(...similarPrices);
              const sMax = Math.max(...similarPrices);
              const price = parseFloat(r.discounted_cash);
              const isNA = price < 1;
              const barWidth = isNA ? 0 : ((price - sMin) / (sMax - sMin || 1)) * 100;
              const barColor = isNA ? '#e2e8f0' :
                barWidth < 33 ? '#22c55e' :
                barWidth < 66 ? '#eab308' : '#ef4444';
              return (
                <div key={i} className="comparison-row">
                  <div className="comparison-rank">#{i + 1}</div>
                  <div className="comparison-hospital-name" style={{ fontSize: '0.8rem' }}>
                    {r.procedure_name}
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 400 }}>{r.hospital_name}</div>
                  </div>
                  <div className="comparison-bar-wrap">
                    <div className="comparison-bar" style={{ width: Math.max(barWidth, 4) + '%', backgroundColor: barColor }} />
                  </div>
                  <div className="comparison-price" style={{ color: barColor }}>
                    {isNA ? 'N/A' : '$' + price.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </>
        )}


      </div>
    )}
  </div>
)}
 </div>
  </div>
)}
    </div>
  );
}