import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Share.css';

const Share = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const [formData, setFormData] = useState({
        hospital_name: queryParams.get('hospital') || '',
        procedure_name: queryParams.get('procedure') || '',
        service_month: '',
        amount_billed: '',
        amount_paid: '',
        payment_type: 'Cash',
        insurance_carrier: '',
        price_honored: 'Yes',
        comment: '',
        display_name: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // NOTE: Using the live Render URL as per your project's standard
            const response = await fetch('https://mediprice-backend.onrender.com/submit-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Thank you! Your experience has been shared to help others.' });
                setTimeout(() => navigate('/'), 3000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Update failed. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="share-container">
            <div className="share-card">
                <h2>Share What You Paid</h2>
                <p>Your anonymous data helps other patients avoid surprise bills.</p>
                
                {message.text && (
                    <div className={`alert ${message.type}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Hospital Name*</label>
                        <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleChange} required placeholder="e.g. Barnes Jewish Hospital" />
                    </div>

                    <div className="form-group">
                        <label>Procedure Name*</label>
                        <input type="text" name="procedure_name" value={formData.procedure_name} onChange={handleChange} required placeholder="e.g. Brain MRI" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Month/Year of Service*</label>
                            <input type="month" name="service_month" value={formData.service_month} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Payment Method*</label>
                            <select name="payment_type" value={formData.payment_type} onChange={handleChange}>
                                <option value="Cash">Cash (No Insurance)</option>
                                <option value="Insurance">Insurance</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount Billed (Optional)</label>
                            <input type="number" name="amount_billed" value={formData.amount_billed} onChange={handleChange} placeholder="$0.00" />
                        </div>
                        <div className="form-group">
                            <label>Amount You Paid*</label>
                            <input type="number" name="amount_paid" value={formData.amount_paid} onChange={handleChange} required placeholder="$0.00" />
                        </div>
                    </div>

                    {formData.payment_type === 'Insurance' && (
                        <div className="form-group">
                            <label>Insurance Carrier</label>
                            <input type="text" name="insurance_carrier" value={formData.insurance_carrier} onChange={handleChange} placeholder="e.g. Blue Cross, Aetna" />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Did they honor the price you were quoted?</label>
                        <select name="price_honored" value={formData.price_honored} onChange={handleChange}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Wasn't quoted">I wasn't given a quote</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notes (Optional)</label>
                        <textarea name="comment" value={formData.comment} onChange={handleChange} maxLength="300" placeholder="Any tips for others? (Max 300 chars)"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input type="text" name="display_name" value={formData.display_name} onChange={handleChange} placeholder="Anonymous (default)" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="submit-btn">
                        {isSubmitting ? 'Submitting...' : 'Submit Price Data'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Share;