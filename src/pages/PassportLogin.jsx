import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './PassportLogin.css';

const PassportLogin = () => {
  const [passportNumber, setPassportNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithPassport, isStudent } = useAuth();

  useEffect(() => {
    if (isStudent) {
      navigate('/passport/dashboard');
    }
  }, [isStudent, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithPassport(passportNumber.toUpperCase());
    
    if (result.success) {
      navigate('/passport/dashboard');
    } else {
      setError(result.error || 'Invalid passport number');
    }
    
    setLoading(false);
  };

  return (
    <div className="passport-login-page">
      <motion.div 
        className="passport-login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="passport-login-card">
          <h1>MedXperience Passport</h1>
          <p className="subtitle">Access your medical education journey</p>
          
          <form onSubmit={handleSubmit} className="passport-form">
            <div className="form-group">
              <label htmlFor="passport">Enter Your Passport Number</label>
              <input
                type="text"
                id="passport"
                placeholder="MXP-2025-XXXX"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
                pattern="MXP-\d{4}-\d{4}"
                className="passport-input"
              />
              <small className="input-hint">Format: MXP-YYYY-XXXX</small>
            </div>

            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Accessing...' : 'Access Passport'}
            </button>
          </form>

          <div className="passport-actions">
            <p>Don't have a passport yet?</p>
            <button 
              onClick={() => navigate('/passport/apply')}
              className="apply-button"
            >
              Apply for Passport
            </button>
          </div>

          <div className="admin-link">
            <a href="/portal">Admin Portal</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PassportLogin;