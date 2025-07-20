import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllDepartmentCodes, updateDepartmentCode } from '../services/database';
import './DepartmentCodeManager.css';

const DepartmentCodeManager = () => {
  const [codes, setCodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState(null);
  const [newCode, setNewCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const result = await getAllDepartmentCodes();
      if (result.success) {
        setCodes(result.codes);
      }
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCode = (departmentId) => {
    setEditingCode(departmentId);
    setNewCode(codes[departmentId]?.code || '');
    setError('');
    setSuccess('');
  };

  const handleSaveCode = async (departmentId) => {
    if (!/^\d{6}$/.test(newCode)) {
      setError('Code must be exactly 6 digits');
      return;
    }

    try {
      const result = await updateDepartmentCode(departmentId, newCode);
      if (result.success) {
        setCodes(prev => ({
          ...prev,
          [departmentId]: {
            ...prev[departmentId],
            code: newCode,
            updatedAt: new Date()
          }
        }));
        setEditingCode(null);
        setSuccess(`${codes[departmentId]?.name || departmentId} code updated successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to update code');
    }
  };

  const handleCancelEdit = () => {
    setEditingCode(null);
    setNewCode('');
    setError('');
  };

  const getDepartmentIcon = (departmentId) => {
    const icons = {
      research: '🧬',
      academic: '📚',
      'global-outreach': '🌍'
    };
    return icons[departmentId] || '📂';
  };

  const getDepartmentColor = (departmentId) => {
    const colors = {
      research: '#00BCD4',
      academic: '#4CAF50',
      'global-outreach': '#9C27B0'
    };
    return colors[departmentId] || '#666';
  };

  if (loading) {
    return (
      <div className="code-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading department codes...</p>
      </div>
    );
  }

  return (
    <div className="department-code-manager">
      <div className="manager-header">
        <h2>Department Code Management</h2>
        <p>Manage access codes for department dashboards</p>
      </div>

      {success && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <span className="material-icons-outlined">check_circle</span>
          {success}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="material-icons-outlined">error</span>
          {error}
        </motion.div>
      )}

      <div className="codes-grid">
        {Object.entries(codes).map(([departmentId, codeData]) => (
          <motion.div
            key={departmentId}
            className="code-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <div className="card-header">
              <div className="department-info">
                <div 
                  className="department-icon-small"
                  style={{ backgroundColor: getDepartmentColor(departmentId) }}
                >
                  {getDepartmentIcon(departmentId)}
                </div>
                <div>
                  <h3>{codeData.name}</h3>
                  <p className="department-id">{departmentId}</p>
                </div>
              </div>
            </div>

            <div className="code-section">
              <label>Access Code:</label>
              {editingCode === departmentId ? (
                <div className="code-edit">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setNewCode(value);
                        setError('');
                      }
                    }}
                    className="code-input"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSaveCode(departmentId)}
                      className="save-button"
                      disabled={newCode.length !== 6}
                    >
                      <span className="material-icons-outlined">save</span>
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      <span className="material-icons-outlined">close</span>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="code-display">
                  <span className="code-value">{codeData.code}</span>
                  <button
                    onClick={() => handleEditCode(departmentId)}
                    className="edit-button"
                    title="Edit code"
                  >
                    <span className="material-icons-outlined">edit</span>
                  </button>
                </div>
              )}
            </div>

            <div className="code-meta">
              <div className="meta-item">
                <span className="material-icons-outlined">schedule</span>
                <span>
                  Updated: {codeData.updatedAt 
                    ? new Date(codeData.updatedAt.toDate?.() || codeData.updatedAt).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="meta-item">
                <span className="material-icons-outlined">person</span>
                <span>By: {codeData.updatedBy || codeData.createdBy || 'System'}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="manager-footer">
        <div className="security-note">
          <span className="material-icons-outlined">security</span>
          <p>
            <strong>Security Note:</strong> Department codes provide access to sensitive areas. 
            Only share codes with authorized personnel and update them regularly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCodeManager;