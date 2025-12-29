import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useForceLightMode from '../hooks/useForceLightMode';
import './PassportLogin.css';

const PassportLogin = () => {
  useForceLightMode();
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

  const handlePassportChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Only allow digits

    // Limit to 8 digits (YYYY + XXXX)
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    // Auto-insert dash after first 4 digits
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }

    setPassportNumber(value);
  };

  const getFullPassportNumber = () => {
    return `MXP-${passportNumber}`;
  };

  const isValidFormat = () => {
    // Check if we have exactly 8 digits (YYYY-XXXX format without the dash)
    const digitsOnly = passportNumber.replace(/-/g, '');
    return digitsOnly.length === 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidFormat()) {
      setError('Please enter all 8 digits (YYYY-XXXX)');
      return;
    }

    setLoading(true);

    const result = await loginWithPassport(getFullPassportNumber().toUpperCase());

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
              <div className="passport-input-wrapper">
                <span className="passport-prefix">MXP-</span>
                <input
                  type="text"
                  id="passport"
                  placeholder="2025-XXXX"
                  value={passportNumber}
                  onChange={handlePassportChange}
                  className="passport-input"
                  maxLength={9}
                />
              </div>
              <small className="input-hint">Enter the 8 digits after MXP-</small>
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