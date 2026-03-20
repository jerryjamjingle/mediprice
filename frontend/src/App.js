import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Search from './Search';
import About from './About';
import FAQ from './FAQ';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/community" element={<CommunityPlaceholder />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder for Community page (V2 feature)
function CommunityPlaceholder() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      background: '#f8fafc',
      padding: '40px'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#0f172a' }}>
          Community Coming Soon
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '32px' }}>
          We're building a Reddit-style community where users can share their actual medical bills, 
          reviews, and pricing experiences. Stay tuned!
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '14px 32px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}