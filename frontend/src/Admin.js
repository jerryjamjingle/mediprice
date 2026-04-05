import React, { useState } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://mediprice-backend.onrender.com/admin-reviews?password=${encodeURIComponent(password)}`);
      if (res.status === 401) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setReviews(data);
      setAuthed(true);
    } catch {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  const approve = async (id) => {
    await fetch('https://mediprice-backend.onrender.com/admin-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: id, password })
    });
    setReviews(reviews.filter(r => r.id !== id));
  };

  const deleteReview = async (id) => {
    await fetch('https://mediprice-backend.onrender.com/admin-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: id, password })
    });
    setReviews(reviews.filter(r => r.id !== id));
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px', width: '320px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#0f172a' }}>Admin Access</h2>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', marginBottom: '12px' }}
          />
          {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}
          <button
            onClick={login}
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Flagged Reviews</h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9rem' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''} flagged</p>

        {reviews.length === 0 && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No flagged reviews — all clear!
          </div>
        )}

        {reviews.map(review => (
          <div key={review.id} style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{review.procedure_name}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{review.hospital_name}</p>
              </div>
              <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '99px' }}>
                {review.flag_count} flags
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
              <span>Paid: <strong>${parseFloat(review.amount_paid).toFixed(0)}</strong></span>
              <span>{review.payment_type}</span>
              {review.insurance_carrier && <span>{review.insurance_carrier}</span>}
              <span>{review.price_honored === 'Yes' ? '✓ Price Honored' : review.price_honored === 'No' ? '✗ Not Honored' : '— Not Quoted'}</span>
            </div>
            {review.comment && <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', marginBottom: '12px' }}>"{review.comment}"</p>}
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px' }}>— {review.display_name || 'Anonymous'} · {new Date(review.created_at).toLocaleDateString()}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => approve(review.id)}
                style={{ padding: '8px 20px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => deleteReview(review.id)}
                style={{ padding: '8px 20px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}