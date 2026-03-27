import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Explore.css';

const CATEGORIES = [
  {
    id: 'imaging',
    icon: '🩻',
    title: 'Imaging',
    description: 'Diagnostic scans that let doctors see inside your body without surgery.',
    hospitals: 25,
    examples: 'MRI, CT Scan, X-Ray, Ultrasound',
    procedures: [
      { name: 'MRI Brain', query: 'MRI Brain', range: '$340 – $4,200', hospitals: 23 },
      { name: 'MRI Spine', query: 'MRI Spine', range: '$380 – $3,900', hospitals: 22 },
      { name: 'CT Abdomen', query: 'CT Abdomen', range: '$280 – $3,800', hospitals: 24 },
      { name: 'CT Chest', query: 'CT Chest', range: '$250 – $3,200', hospitals: 24 },
      { name: 'X-Ray Chest', query: 'X-Ray Chest', range: '$40 – $800', hospitals: 25 },
      { name: 'Ultrasound Abdomen', query: 'Ultrasound Abdomen', range: '$180 – $1,400', hospitals: 21 },
      { name: 'Mammogram', query: 'Mammogram', range: '$100 – $900', hospitals: 20 },
      { name: 'DEXA Bone Density Scan', query: 'DEXA Bone Density', range: '$120 – $700', hospitals: 18 },
    ]
  },
  {
    id: 'lab-tests',
    icon: '🧪',
    title: 'Lab Tests',
    description: 'Blood, urine, and tissue tests used to diagnose and monitor conditions.',
    hospitals: 25,
    examples: 'Blood panels, Urinalysis, Thyroid, Metabolic',
    procedures: [
      { name: 'Basic Metabolic Panel', query: 'Basic Metabolic Panel', range: '$10 – $340', hospitals: 25 },
      { name: 'Complete Blood Count', query: 'Complete Blood Count', range: '$10 – $280', hospitals: 25 },
      { name: 'Lipid Panel', query: 'Lipid Panel', range: '$15 – $320', hospitals: 24 },
      { name: 'Thyroid Panel', query: 'Thyroid Panel', range: '$20 – $480', hospitals: 23 },
      { name: 'Urinalysis', query: 'Urinalysis', range: '$10 – $180', hospitals: 25 },
      { name: 'Hemoglobin A1C', query: 'Hemoglobin A1C', range: '$15 – $260', hospitals: 24 },
      { name: 'Comprehensive Metabolic Panel', query: 'Comprehensive Metabolic Panel', range: '$15 – $400', hospitals: 25 },
    ]
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Emergency & Urgent',
    description: 'Emergency room visits and urgent care services across severity levels.',
    hospitals: 22,
    examples: 'ER Visits, Laceration Repair, EKG',
    procedures: [
      { name: 'Emergency Room Visit Level 3', query: 'Emergency Room Level 3', range: '$480 – $4,800', hospitals: 20 },
      { name: 'Emergency Room Visit Level 4', query: 'Emergency Room Level 4', range: '$780 – $7,200', hospitals: 20 },
      { name: 'Emergency Room Visit Level 5', query: 'Emergency Room Level 5', range: '$1,200 – $12,000', hospitals: 19 },
      { name: 'Laceration Repair', query: 'Laceration Repair', range: '$200 – $2,400', hospitals: 18 },
      { name: 'EKG / Electrocardiogram', query: 'EKG Electrocardiogram', range: '$50 – $800', hospitals: 22 },
    ]
  },
  {
    id: 'surgery',
    icon: '✂️',
    title: 'Surgery',
    description: 'Common surgical procedures performed at area hospitals.',
    hospitals: 24,
    examples: 'Appendectomy, Hernia Repair, Knee Surgery',
    procedures: [
      { name: 'Appendectomy', query: 'Appendectomy', range: '$8,400 – $32,000', hospitals: 22 },
      { name: 'Cholecystectomy (Gallbladder Removal)', query: 'Cholecystectomy', range: '$7,200 – $28,000', hospitals: 23 },
      { name: 'Hernia Repair', query: 'Hernia Repair', range: '$5,800 – $22,000', hospitals: 22 },
      { name: 'Knee Arthroscopy', query: 'Knee Arthroscopy', range: '$6,400 – $24,000', hospitals: 20 },
      { name: 'Hip Replacement', query: 'Hip Replacement', range: '$18,000 – $52,000', hospitals: 18 },
      { name: 'Knee Replacement', query: 'Knee Replacement', range: '$20,000 – $58,000', hospitals: 18 },
      { name: 'Hysterectomy', query: 'Hysterectomy', range: '$12,000 – $38,000', hospitals: 16 },
      { name: 'Cataract Surgery', query: 'Cataract Surgery', range: '$2,800 – $9,200', hospitals: 14 },
    ]
  },
  {
    id: 'preventive',
    icon: '🩺',
    title: 'Preventive & Wellness',
    description: 'Screenings and checkups designed to catch problems before they start.',
    hospitals: 25,
    examples: 'Wellness Visits, Colonoscopy, Vaccines',
    procedures: [
      { name: 'Annual Wellness Visit', query: 'Annual Wellness Visit', range: '$80 – $480', hospitals: 25 },
      { name: 'Colonoscopy', query: 'Colonoscopy', range: '$1,200 – $6,800', hospitals: 23 },
      { name: 'Flu Shot', query: 'Influenza Vaccine', range: '$15 – $120', hospitals: 22 },
      { name: 'Bone Density Scan', query: 'Bone Density Scan', range: '$120 – $700', hospitals: 19 },
      { name: 'Pap Smear', query: 'Pap Smear', range: '$40 – $380', hospitals: 24 },
      { name: 'Prostate Screening PSA', query: 'Prostate PSA', range: '$30 – $280', hospitals: 23 },
    ]
  },
  {
    id: 'maternity',
    icon: '🤰',
    title: 'Maternity & OB',
    description: 'Pregnancy, delivery, and obstetric care services.',
    hospitals: 18,
    examples: 'OB Ultrasound, Delivery, C-Section',
    procedures: [
      { name: 'OB Ultrasound', query: 'OB Ultrasound', range: '$180 – $1,200', hospitals: 18 },
      { name: 'Vaginal Delivery', query: 'Vaginal Delivery', range: '$4,800 – $18,000', hospitals: 16 },
      { name: 'C-Section', query: 'Cesarean Section', range: '$8,200 – $28,000', hospitals: 15 },
      { name: 'Amniocentesis', query: 'Amniocentesis', range: '$1,200 – $4,800', hospitals: 10 },
      { name: 'Epidural', query: 'Epidural Anesthesia', range: '$800 – $4,200', hospitals: 14 },
    ]
  },
  {
    id: 'cardiology',
    icon: '❤️',
    title: 'Cardiology',
    description: 'Heart and cardiovascular diagnostic tests and procedures.',
    hospitals: 22,
    examples: 'Echocardiogram, Stress Test, Cardiac Cath',
    procedures: [
      { name: 'Echocardiogram', query: 'Echocardiogram', range: '$880 – $5,200', hospitals: 22 },
      { name: 'Stress Test', query: 'Stress Test', range: '$480 – $3,800', hospitals: 21 },
      { name: 'Cardiac Catheterization', query: 'Cardiac Catheterization', range: '$8,400 – $38,000', hospitals: 18 },
      { name: 'Holter Monitor', query: 'Holter Monitor', range: '$180 – $1,200', hospitals: 20 },
      { name: 'Carotid Ultrasound', query: 'Carotid Ultrasound', range: '$280 – $1,800', hospitals: 19 },
    ]
  },
  {
    id: 'mental-health',
    icon: '🧠',
    title: 'Mental Health',
    description: 'Psychiatric evaluations, therapy, and psychological testing services.',
    hospitals: 16,
    examples: 'Psych Evaluation, Therapy, Testing',
    procedures: [
      { name: 'Psychiatric Evaluation', query: 'Psychiatric Evaluation', range: '$280 – $1,800', hospitals: 16 },
      { name: 'Individual Therapy Session', query: 'Individual Psychotherapy', range: '$80 – $380', hospitals: 14 },
      { name: 'Psychological Testing', query: 'Psychological Testing', range: '$480 – $3,200', hospitals: 12 },
      { name: 'Group Therapy', query: 'Group Therapy', range: '$40 – $280', hospitals: 10 },
    ]
  },
];

export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedProcedure, setExpandedProcedure] = useState(null);

  // On load, open overlay if category is in URL
  uuseEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      const found = CATEGORIES.find(c => c.id === cat);
      if (found) setActiveCategory(found);
    } else {
      setActiveCategory(null);
    }
  }, [searchParams]);

  const openCategory = (cat) => {
    setActiveCategory(cat);
    setExpandedProcedure(null);
    setSearchParams({ category: cat.id });
  };

  const closeOverlay = () => {
    setActiveCategory(null);
    setExpandedProcedure(null);
    setSearchParams({});
  };

  const toggleProcedure = (name) => {
    setExpandedProcedure(prev => prev === name ? null : name);
  };

  const goToSearch = (query) => {
    navigate(`/search?procedure=${encodeURIComponent(query)}`);
  };

  return (
    <div className="explore-page">
      {/* HEADER */}
      <header className="explore-header">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>MedExpense</h1>
        <p className="explore-tagline">Browse procedures by category</p>
        <nav className="explore-nav">
          <button className="explore-nav-link" onClick={() => navigate('/')}>← Home</button>
          <button className="explore-nav-link" onClick={() => navigate('/search')}>Search</button>
          <button className="explore-nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="explore-nav-link" onClick={() => navigate('/faq')}>FAQ</button>
        </nav>
      </header>

      {/* PAGE TITLE */}
      <div className="explore-intro">
        <h2>Explore by Type</h2>
        <p>Browse medical procedures by category. Click any category to see procedures, price ranges, and how many St. Louis hospitals offer them.</p>
      </div>

      {/* CATEGORY CARDS GRID */}
      <div className="explore-grid">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`explore-card ${activeCategory?.id === cat.id ? 'active' : ''}`}
            onClick={() => openCategory(cat)}
          >
            <div className="explore-card-icon">{cat.icon}</div>
            <h3 className="explore-card-title">{cat.title}</h3>
            <p className="explore-card-desc">{cat.description}</p>
            <p className="explore-card-examples">{cat.examples}</p>
            <div className="explore-card-footer">
              <span className="explore-card-hospitals">🏥 {cat.hospitals} hospitals</span>
              <span className="explore-card-cta">Browse →</span>
            </div>
          </div>
        ))}
      </div>

      {/* OVERLAY */}
      {activeCategory && (
        <div className="explore-overlay-backdrop" onClick={closeOverlay}>
          <div className="explore-overlay" onClick={e => e.stopPropagation()}>
            <div className="overlay-header">
              <div>
                <span className="overlay-icon">{activeCategory.icon}</span>
                <h2 className="overlay-title">{activeCategory.title}</h2>
                <p className="overlay-subtitle">{activeCategory.description}</p>
              </div>
              <button className="overlay-close" onClick={closeOverlay}>✕</button>
            </div>

            <div className="overlay-procedures">
              {activeCategory.procedures.map(proc => (
                <div key={proc.name} className="proc-item">
                  <div
                    className="proc-header"
                    onClick={() => toggleProcedure(proc.name)}
                  >
                    <span className="proc-name">{proc.name}</span>
                    <span className="proc-toggle">{expandedProcedure === proc.name ? '▲' : '▼'}</span>
                  </div>

                  {expandedProcedure === proc.name && (
                    <div className="proc-expanded">
                      <div className="proc-info-row">
                        <div className="proc-info">
                          <span className="proc-info-label">Price Range</span>
                          <span className="proc-info-value">{proc.range}</span>
                        </div>
                        <div className="proc-info">
                          <span className="proc-info-label">Hospitals</span>
                          <span className="proc-info-value">{proc.hospitals} of 25</span>
                        </div>
                      </div>
                      <div className="proc-range-bar">
                        <div className="proc-range-fill" />
                      </div>
                      <button
                        className="proc-search-btn"
                        onClick={() => goToSearch(proc.query)}
                      >
                        Compare prices across hospitals →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}