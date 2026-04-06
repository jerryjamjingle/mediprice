import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '20px 24px', textAlign: 'center' }}>
        <h1 onClick={() => navigate('/')} style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', cursor: 'pointer', marginBottom: '4px' }}>MedExpense</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Privacy Policy</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px 24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '32px' }}>Last updated: April 2026</p>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>1. Overview</h2>
            <p style={p}>MedExpense ("we," "us," or "our") operates the website located at mediprice.vercel.app (the "Service"). This Privacy Policy explains how we collect, use, and protect information when you use our Service. By using MedExpense, you agree to the practices described in this policy.</p>
            <p style={p}>MedExpense is an independent price transparency tool. We are not a healthcare provider, insurance company, or medical billing service. Nothing on this site constitutes medical, financial, or legal advice.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>2. Information We Collect</h2>
            <h3 style={h3}>Information You Voluntarily Submit</h3>
            <p style={p}>When you submit a patient price review, we collect the information you provide, which may include: hospital name, procedure name, amount paid, payment type, insurance carrier, whether the quoted price was honored, an optional comment, and an optional display name. This information is submitted anonymously — we do not require you to create an account or provide your real name.</p>
            <h3 style={h3}>Automatically Collected Information</h3>
            <p style={p}>When you use our Service, we may automatically collect certain technical information, including your IP address, browser type, device type, pages visited, and the date and time of your visit. This information is used solely for operating and improving the Service and is never sold to third parties.</p>
            <h3 style={h3}>Search Queries</h3>
            <p style={p}>When you search for procedures or hospitals on MedExpense, we may log search queries to improve search functionality and understand how users interact with the Service. These logs do not contain personally identifiable information.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>3. How We Use Your Information</h2>
            <p style={p}>We use the information we collect to:</p>
            <ul style={ul}>
              <li style={li}>Display community-submitted price reviews to help other users make informed decisions</li>
              <li style={li}>Operate, maintain, and improve the Service</li>
              <li style={li}>Detect and prevent spam, abuse, and fraudulent submissions</li>
              <li style={li}>Moderate user-submitted content in accordance with our Terms of Service</li>
              <li style={li}>Analyze usage patterns to improve the user experience</li>
            </ul>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>4. What We Do Not Do</h2>
            <ul style={ul}>
              <li style={li}>We do not sell, rent, or trade your personal information to third parties</li>
              <li style={li}>We do not require account registration or collect your name or email address to use the Service</li>
              <li style={li}>We do not serve targeted advertisements based on your personal data</li>
              <li style={li}>We do not share your submitted review data with hospitals, insurance companies, or any healthcare entities</li>
              <li style={li}>We do not use your data for automated decision-making that affects your rights</li>
            </ul>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>5. User-Submitted Reviews</h2>
            <p style={p}>Reviews submitted through MedExpense are displayed publicly on the Service. While you may submit a review anonymously or under a display name of your choosing, please do not include personal information such as your full name, date of birth, member ID, or any information that could identify you as a patient in your review or comment fields.</p>
            <p style={p}>MedExpense reserves the right to moderate, edit, or remove any submitted content that violates our Terms of Service or that we determine in our sole discretion to be inappropriate, false, or harmful.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>6. Data Retention</h2>
            <p style={p}>We retain user-submitted reviews indefinitely to maintain the usefulness of the Service. If you would like to request deletion of a review you submitted, please contact us at [CONTACT EMAIL] with details about your submission. We will make reasonable efforts to locate and delete the requested data, though we cannot guarantee deletion of data that has already been aggregated or anonymized.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>7. Cookies and Tracking</h2>
            <p style={p}>MedExpense may use cookies or similar technologies to maintain the functionality of the Service, such as remembering your preferences. We do not use third-party advertising cookies or tracking pixels. You can disable cookies in your browser settings, though some features of the Service may not function properly as a result.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>8. Third-Party Services</h2>
            <p style={p}>MedExpense uses the following third-party services to operate:</p>
            <ul style={ul}>
              <li style={li}><strong>Vercel</strong> — website hosting</li>
              <li style={li}><strong>Render</strong> — backend API hosting</li>
              <li style={li}><strong>NeonDB</strong> — database storage</li>
              <li style={li}><strong>OpenStreetMap</strong> — map display</li>
            </ul>
            <p style={p}>Each of these services has its own privacy policy. We are not responsible for the privacy practices of third-party services.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>9. Children's Privacy</h2>
            <p style={p}>MedExpense is not directed at individuals under the age of 18. We do not knowingly collect personal information from anyone under 18. If you believe someone under 18 has submitted information to us, please contact us at [CONTACT EMAIL] and we will promptly delete it.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>10. California Privacy Rights (CCPA)</h2>
            <p style={p}>If you are a California resident, you have the right to request information about the categories of personal data we collect, the purposes for which we use it, and whether we sell it (we do not). You also have the right to request deletion of your personal data. To exercise these rights, contact us at [CONTACT EMAIL].</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>11. Security</h2>
            <p style={p}>We take reasonable technical and organizational measures to protect the information we collect from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security and are not responsible for unauthorized access resulting from circumstances beyond our reasonable control.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>12. Changes to This Policy</h2>
            <p style={p}>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 style={h2}>13. Contact Us</h2>
            <p style={p}>If you have questions or concerns about this Privacy Policy or how your data is handled, please contact us at: <strong>[CONTACT EMAIL]</strong></p>
          </section>

        </div>
      </div>

      <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '20px 24px', textAlign: 'center' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1e40af', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>← Back to MedExpense</button>
      </footer>
    </div>
  );
}

const h2 = { fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px', marginTop: '0' };
const h3 = { fontSize: '0.95rem', fontWeight: '700', color: '#334155', marginBottom: '8px', marginTop: '16px' };
const p = { fontSize: '0.92rem', color: '#475569', lineHeight: '1.75', marginBottom: '12px' };
const ul = { paddingLeft: '20px', marginBottom: '12px' };
const li = { fontSize: '0.92rem', color: '#475569', lineHeight: '1.75', marginBottom: '4px' };