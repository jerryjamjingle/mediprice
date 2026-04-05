import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Search from './Search';
import About from './About';
import FAQ from './FAQ';
import Explore from './Explore';
import Share from './Share';
import Admin from './Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/share" element={<Share />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/admin-mx-2026" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}