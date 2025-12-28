import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePipeline } from '../contexts/PipelineContext';
import { authenticateWorker } from '../services/database';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, adminData } = useAuth();
  const { currentUser, restoreSession, setUserDirectly } = usePipeline();

  // Check for existing sessions on mount
  useEffect(() => {
    // Try to restore pipeline session
    const restored = restoreSession();
    if (restored) {
      if (restored.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker');
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (adminData) {
      navigate('/admin/dashboard');
    }
  }, [adminData, navigate]);

  useEffect(() => {
    if (currentUser && !loading) {
      if (currentUser.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker');
      }
    }
  }, [currentUser, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Try Firebase workers collection
      const workerResult = await authenticateWorker(email, password);

      if (workerResult.success) {
        // Create user object from Firebase worker
        const worker = workerResult.worker;
        const user = {
          id: worker.id,
          name: `${worker.firstName} ${worker.lastName}`,
          email: worker.email,
          university: worker.university || 'JUST',
          units: worker.units || [],
          role: 'worker',
          isFirebaseWorker: true
        };

        // Set user in PipelineContext
        setUserDirectly(user);

        // Navigate to appropriate page
        navigate('/worker');
        return;
      }

      // 2. If worker login failed, try Firebase admin login
      const adminResult = await loginAdmin(email, password);

      if (adminResult.success) {
        navigate('/admin/dashboard');
      } else {
        // All login methods failed
        setError('Invalid email or password');
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format');
      } else {
        setError(error.message || 'Failed to login');
      }
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-container unified"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-header">
          <h1>MedXplore</h1>
          <p>Admin & Unit Worker Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
              autoComplete="current-password"
            />
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-info">
          <div className="back-link">
            <a href="/passport">← Back to Student Portal</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
