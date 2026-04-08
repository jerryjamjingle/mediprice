import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', padding: '20px 24px', textAlign: 'center' }}>
        <h1 onClick={() => navigate('/')} style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', cursor: 'pointer', marginBottom: '4px' }}>MedExpense</h1>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Terms of Service</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px 24px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>

          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '32px' }}>Last updated: April 2026</p>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>1. Acceptance of Terms</h2>
            <p style={p}>By accessing or using MedExpense ("the Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, users, and anyone who accesses or uses the Service.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>2. Description of Service</h2>
            <p style={p}>MedExpense is a hospital price transparency tool that displays publicly available price data sourced from federally mandated hospital price transparency files, as well as community-submitted price reviews. The Service is intended to help users research and compare healthcare costs. MedExpense is not a healthcare provider, medical billing service, insurance company, or financial advisor.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>3. Not Medical or Financial Advice</h2>
            <p style={p}>NOTHING ON MEDEXPENSE CONSTITUTES MEDICAL ADVICE, FINANCIAL ADVICE, INSURANCE ADVICE, OR LEGAL ADVICE. All content, including price data, community reviews, calculators, checklists, and any other tools or information provided by the Service, is for informational and educational purposes only.</p>
            <p style={p}>You should always consult with qualified healthcare professionals, insurance representatives, and financial advisors before making any healthcare or financial decisions. MedExpense is not responsible for any decisions you make based on information found on the Service.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>4. Accuracy of Price Data</h2>
            <p style={p}>Hospital price data displayed on MedExpense is sourced from federally mandated price transparency files published by hospitals. While we make reasonable efforts to present this data accurately, we make no warranties or representations regarding the accuracy, completeness, timeliness, or reliability of any price information displayed.</p>
            <p style={p}>Prices are subject to change at any time. Actual costs may vary based on your insurance coverage, negotiated rates, individual circumstances, additional services rendered, and other factors. MedExpense prices should be used as a starting point for research only, not as a guarantee of what you will be charged.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>5. User-Submitted Content</h2>
            <p style={p}>MedExpense allows users to submit price reviews ("User Content"). By submitting User Content, you represent and warrant that:</p>
            <ul style={ul}>
              <li style={li}>The information you submit is accurate to the best of your knowledge</li>
              <li style={li}>You are not submitting false, misleading, or fraudulent information</li>
              <li style={li}>Your submission does not violate any applicable law or regulation</li>
              <li style={li}>You are not submitting content on behalf of a hospital, insurance company, or any entity with a financial interest in the data</li>
              <li style={li}>You have not included any personally identifiable information about yourself or any other individual beyond what is necessary for the review</li>
            </ul>
            <p style={p}>By submitting User Content, you grant MedExpense a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, display, reproduce, modify, adapt, publish, and distribute such content in connection with operating and improving the Service.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>6. Content Moderation</h2>
            <p style={p}>MedExpense reserves the right, but not the obligation, to monitor, review, edit, or remove any User Content at any time and for any reason, including but not limited to content that we determine in our sole discretion to be false, misleading, abusive, spam, or otherwise in violation of these Terms. We are not liable for any failure to remove, or any delay in removing, harmful or objectionable content.</p>
            <p style={p}>MedExpense is protected under Section 230 of the Communications Decency Act, which provides immunity from liability for user-submitted content. We are not the publisher or speaker of User Content submitted by third parties.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>7. Prohibited Conduct</h2>
            <p style={p}>You agree not to:</p>
            <ul style={ul}>
              <li style={li}>Submit false, fabricated, or intentionally misleading price data</li>
              <li style={li}>Submit reviews on behalf of a hospital, healthcare system, or any entity with a commercial interest</li>
              <li style={li}>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li style={li}>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
              <li style={li}>Scrape, crawl, or systematically extract data from the Service without prior written permission</li>
              <li style={li}>Interfere with or disrupt the integrity or performance of the Service</li>
              <li style={li}>Use the Service in any manner that could damage, disable, or impair the Service</li>
            </ul>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>8. Disclaimer of Warranties</h2>
            <p style={p}>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. MEDEXPENSE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>9. Limitation of Liability</h2>
            <p style={p}>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, MEDEXPENSE AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, PERSONAL INJURY, OR PROPERTY DAMAGE, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p style={p}>IN NO EVENT SHALL MEDEXPENSE'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE EXCEED ONE HUNDRED DOLLARS ($100).</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>10. Indemnification</h2>
            <p style={p}>You agree to indemnify, defend, and hold harmless MedExpense and its operators from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with: (a) your use of the Service; (b) your violation of these Terms; (c) your submission of User Content; or (d) your violation of any rights of a third party.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>11. Intellectual Property</h2>
            <p style={p}>The MedExpense name, logo, website design, and original content (excluding hospital price data, which is publicly available, and user-submitted content) are the property of MedExpense and its operators. You may not reproduce, distribute, or create derivative works from our original content without prior written permission.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>12. Third-Party Links</h2>
            <p style={p}>The Service may contain links to third-party websites, including hospital websites and Google. These links are provided for convenience only. MedExpense has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party websites. Your use of third-party websites is at your own risk.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>13. Modifications to the Service</h2>
            <p style={p}>MedExpense reserves the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>14. Changes to Terms</h2>
            <p style={p}>We reserve the right to update or modify these Terms at any time. When we do, we will update the "Last updated" date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the updated Terms. It is your responsibility to review these Terms periodically.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>15. Governing Law</h2>
            <p style={p}>These Terms shall be governed by and construed in accordance with the laws of the State of Missouri, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Missouri.</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h2 style={h2}>16. Age Requirement</h2>
            <p style={p}>You must be at least 18 years of age to use the Service. By using the Service, you represent that you are at least 18 years old.</p>
          </section>

          <section>
            <h2 style={h2}>17. Contact Us</h2>
            <p style={p}>If you have questions about these Terms, please contact us at: <strong>contact.medexpense@gmail.com</strong></p>
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
const p = { fontSize: '0.92rem', color: '#475569', lineHeight: '1.75', marginBottom: '12px' };
const ul = { paddingLeft: '20px', marginBottom: '12px' };
const li = { fontSize: '0.92rem', color: '#475569', lineHeight: '1.75', marginBottom: '4px' };