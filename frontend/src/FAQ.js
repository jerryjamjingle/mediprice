import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

const FAQ_ITEMS = [
  {
    question: 'Are these prices accurate?',
    answer: 'Yes. Hospitals are legally required to publish this data. We pull directly from their official price transparency files.'
  },
  {
    question: 'Will they actually charge me this price?',
    answer: 'If you\'re paying cash or self-pay, yes. Mention you saw the cash price on their transparency file when you call to schedule.'
  },
  {
    question: 'What if I have insurance?',
    answer: 'These are cash prices. Insurance prices may differ depending on your plan and coverage. However, these prices show you what the procedure actually costs, which can be useful if you have a high deductible or if your insurance doesn\'t cover the procedure.'
  },
  {
    question: 'How do I use this?',
    answer: 'Search for your procedure → Compare prices across hospitals → Call the hospital with the lowest price → Mention the CPT code and ask to confirm the cash/self-pay price → Book your appointment.'
  },
  {
    question: 'Why only St. Louis?',
    answer: 'We\'re starting local to prove the concept and refine the product. Every hospital in America publishes this data — we\'re building the infrastructure to expand nationally. St. Louis is just the beginning.'
  },
  {
    question: 'Where does this data come from?',
    answer: 'Directly from hospital price transparency files. Federal law requires all hospitals to publish their standard charges. We process these files and make them searchable.'
  },
  {
    question: 'How often is the data updated?',
    answer: 'Hospitals are required to update their files at least annually. We refresh our database regularly to ensure you\'re seeing current pricing.'
  },
  {
    question: 'Can I negotiate an even lower price?',
    answer: 'Possibly! The prices you see are the published cash rates, but some hospitals may offer financial assistance or payment plans. Always ask about your options when you call.'
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <header className="faq-header">
        <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>MediPrice</h1>
        <nav className="faq-nav">
          <button className="nav-link" onClick={() => navigate('/')}>Search</button>
          <button className="nav-link" onClick={() => navigate('/community')}>Community</button>
          <button className="nav-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-link active">FAQ</button>
        </nav>
      </header>

      <div className="faq-content">
        <div className="faq-hero">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about MediPrice</p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="faq-item">
              <button 
                className={`faq-question ${openIndex === index ? 'active' : ''}`}
                onClick={() => toggleQuestion(index)}
              >
                <span>{item.question}</span>
                <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-cta">
          <p>Still have questions?</p>
          <button className="cta-button" onClick={() => navigate('/')}>Try Searching Prices</button>
        </div>
      </div>
    </div>
  );
}