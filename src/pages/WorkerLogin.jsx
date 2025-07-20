import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import './WorkerLogin.css';

const WorkerLogin = () => {
  const navigate = useNavigate();
  const { login } = useWorkerAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const worker = await login(formData.email, formData.password);
      
      // Redirect based on worker's departments
      if (worker.departments.includes('all')) {
        // Worker has access to all departments, redirect to admin dashboard
        navigate('/admin/dashboard');
      } else if (worker.departments.includes('research')) {
        navigate('/departments/research');
      } else if (worker.departments.includes('academic')) {
        navigate('/departments/academic');
      } else if (worker.departments.includes('global-outreach')) {
        navigate('/departments/global-outreach');
      } else {
        // Default to first department
        navigate(`/departments/${worker.departments[0]}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-login-page">
      <div className="login-container">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-header">
            <h1>Department Worker Login</h1>
            <p>Access your department dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="worker@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="material-icons-outlined">error</span>
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Not a worker? Access departments with a code:</p>
            <div className="department-links">
              <button 
                onClick={() => navigate('/departments/research')}
                className="department-link"
              >
                🧬 Research
              </button>
              <button 
                onClick={() => navigate('/departments/academic')}
                className="department-link"
              >
                📚 Academic
              </button>
              <button 
                onClick={() => navigate('/departments/global-outreach')}
                className="department-link"
              >
                🌍 Global Outreach
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkerLogin;