import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <header className="about-header">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>MediPrice</h1>
        <nav className="about-nav">
          <button className="nav-link" onClick={() => navigate('/')}>Search</button>
          <button className="nav-link" onClick={() => navigate('/community')}>Community</button>
          <button className="nav-link active">About</button>
          <button className="nav-link" onClick={() => navigate('/faq')}>FAQ</button>
        </nav>
      </header>

      <div className="about-content">
        <div className="about-hero">
          <h2>Search, compare, and save on medical care.</h2>
        </div>

        <div className="about-body">
          <p>Healthcare pricing is broken. A simple MRI can cost $300 at one hospital and $3,000 at another — and until now, patients had no way to know the difference before getting the bill.</p>

          <p className="highlight">MediPrice changes that.</p>

          <p>We pull directly from hospital price transparency files, and turn it into something anyone can use. Search a procedure, and instantly see real cash prices from providers near you.</p>

          <p>No surprises. Just honest prices.</p>

          <p>We're starting in the St. Louis area with Saint Anthony's Health Center, but the model works anywhere. Every hospital in America is sitting on this data. We're building the tool that makes it useful.</p>

          <p>MediPrice is for the 30 million uninsured Americans, the millions more with high deductibles, and anyone who's ever gotten a medical bill and thought — <em>why didn't anyone tell me this beforehand?</em></p>

          <p className="highlight">We believe healthcare pricing should be as easy to compare as flights or hotels.</p>

          <p><strong>MediPrice is how we get there.</strong></p>
        </div>

        <div className="about-cta">
          <button className="cta-button" onClick={() => navigate('/')}>Start Searching Prices</button>
        </div>
      </div>
    </div>
  );
}