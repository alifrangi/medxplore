import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyDepartmentCode } from '../services/database';
import './DepartmentCodeModal.css';

const DepartmentCodeModal = ({ isOpen, onClose, department, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyDepartmentCode(department.id, code);
      
      if (result.success) {
        onSuccess();
        onClose();
        setCode('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="code-modal"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Department Access Code</h2>
              <button 
                onClick={handleClose}
                className="close-button"
                aria-label="Close modal"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="department-info">
                <div className="department-icon-large">
                  {department.icon}
                </div>
                <h3>{department.name}</h3>
                <p>Enter the 6-digit access code to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="code-form">
                <div className="code-input-container">
                  <input
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    placeholder="000000"
                    className="code-input"
                    maxLength={6}
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="input-underline"></div>
                </div>

                {error && (
                  <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="material-icons-outlined">error</span>
                    {error}
                  </motion.div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="verify-button"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <p className="security-note">
                <span className="material-icons-outlined">security</span>
                Access codes are secured and expire after 24 hours
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DepartmentCodeModal;