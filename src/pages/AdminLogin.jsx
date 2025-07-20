import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import { useAuth } from '../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const navigate = useNavigate();
  const { worker, login, logout: workerLogout } = useWorkerAuth();
  const { loginAdmin } = useAuth();

  const departments = [
    { id: 'admin', name: 'Admin Dashboard', icon: '⚙️', path: '/admin/dashboard', isAdmin: true },
    { id: 'research', name: 'Research', icon: '🧬', path: '/departments/research' },
    { id: 'academic', name: 'Academic', icon: '📚', path: '/departments/academic' },
    { id: 'global-outreach', name: 'Global Outreach', icon: '🌍', path: '/departments/global-outreach' },
    { id: 'student-engagement', name: 'Student Engagement', icon: '🤝', path: '/departments/student-engagement' },
    { id: 'media-communications', name: 'Media & Communications', icon: '📢', path: '/departments/media-communications' }
  ];

  useEffect(() => {
    if (worker && selectedDepartment && !selectedDepartment.isAdmin) {
      // Only navigate for worker login, not admin login
      if (worker.departments.includes(selectedDepartment.id)) {
        handleCloseModal();
        navigate(selectedDepartment.path);
      } else {
        setError('You do not have access to this department');
        setLoading(false);
      }
    }
  }, [worker, navigate, selectedDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (selectedDepartment?.isAdmin) {
        // Admin login using Firebase Auth
        const result = await loginAdmin(email, password);
        if (result.success) {
          handleCloseModal();
          navigate('/admin/dashboard');
        } else {
          setError(result.error || 'Failed to login');
          setLoading(false);
        }
      } else {
        // Worker login for departments
        const workerSession = await login(email, password);
        
        // Check if worker has access to the selected department and navigate immediately
        if (workerSession && workerSession.departments && workerSession.departments.includes(selectedDepartment.id)) {
          handleCloseModal();
          navigate(selectedDepartment.path);
        } else if (workerSession) {
          setError('You do not have access to this department');
          setLoading(false);
        }
        // If workerSession is null, the login failed and error is already handled in catch
      }
    } catch (error) {
      setLoading(false);
      
      if (selectedDepartment?.isAdmin) {
        // Admin login error handling
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setError('Invalid email or password');
        } else if (error.code === 'auth/invalid-email') {
          setError('Invalid email format');
        } else {
          setError(error.message || 'Failed to login');
        }
      } else {
        // Worker login error handling
        setError(error.message || 'Failed to login');
      }
    }
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setShowLoginModal(true);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setSelectedDepartment(null);
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <motion.div 
        className="admin-login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="dashboard-shortcuts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1>Department Access</h1>
          <div className="shortcuts-grid">
            {departments.map((department) => (
              <button 
                key={department.id}
                onClick={() => handleDepartmentClick(department)}
                className={`dashboard-shortcut ${department.id} ${department.isAdmin ? 'admin-shortcut' : ''}`}
              >
                <div className="shortcut-icon">{department.icon}</div>
                <span>{department.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="admin-info">
          <p>For account access, please contact your department administrator.</p>
          {worker && (
            <div className="current-worker">
              <p>Currently logged in as: <strong>{worker.firstName} {worker.lastName}</strong></p>
              <button 
                onClick={async () => {
                  await workerLogout();
                  window.location.reload();
                }}
                className="logout-worker-btn"
              >
                Logout Worker
              </button>
            </div>
          )}
          <div className="back-link">
            <a href="/passport">← Back to Student Portal</a>
          </div>
        </div>
      </motion.div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <motion.div 
            className="login-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedDepartment?.isAdmin ? 'Admin Login' : `Login to ${selectedDepartment?.name}`}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="modal-email">{selectedDepartment?.isAdmin ? 'Admin Email' : 'Email Address'}</label>
                <input
                  type="email"
                  id="modal-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={selectedDepartment?.isAdmin ? "admin@medxplore.com" : "worker@example.com"}
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-password">Password</label>
                <input
                  type="password"
                  id="modal-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="modal-input"
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

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminLogin;