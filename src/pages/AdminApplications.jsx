import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getApplications, approveApplication, deleteApplication } from '../services/database';
import './AdminApplications.css';

const AdminApplications = () => {
  const { adminData } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filter]);

  const loadApplications = async () => {
    try {
      const apps = await getApplications();
      setApplications(apps);
    } catch (error) {
      // Error loading applications
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (filter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filter));
    }
  };

  const handleApprove = async (appId, appName) => {
    if (!confirm(`Are you sure you want to approve the application from ${appName}?`)) {
      return;
    }

    setActionLoading(true);
    const result = await approveApplication(appId, adminData?.id || 'admin');
    
    if (result.success) {
      alert(`Application approved! Passport Number: ${result.passportNumber}`);
      await loadApplications();
      setSelectedApp(null);
    } else {
      alert('Failed to approve application: ' + result.error);
    }
    
    setActionLoading(false);
  };

  const handleDelete = async (appId, appName) => {
    if (!confirm(`Are you sure you want to delete the application from ${appName}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteApplication(appId);
      if (result.success) {
        alert('Application deleted successfully!');
        await loadApplications();
        setSelectedApp(null);
      } else {
        alert('Failed to delete application: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred while deleting the application');
    }
    setActionLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-applications">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Application Management</h1>
          </div>
        </div>
      </div>

      <div className="applications-container">
        <div className="filters-section">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
        </div>

        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>University</th>
                <th>Program</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td>{app.fullName}</td>
                  <td>{app.university}</td>
                  <td>{app.program}</td>
                  <td>{formatDate(app.submittedAt)}</td>
                  <td>
                    <span className={`status ${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className="activity-actions">
                      <button 
                        className="action-btn view-btn-small"
                        onClick={() => setSelectedApp(app)}
                      >
                        View
                      </button>
                      {app.status === 'pending' && (
                        <button 
                          className="action-btn approve-btn-small"
                          onClick={() => handleApprove(app.id, app.fullName)}
                          disabled={actionLoading}
                          title="Approve application"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        </button>
                      )}
                      <button 
                        className="action-btn delete-btn-small"
                        onClick={() => handleDelete(app.id, app.fullName)}
                        disabled={actionLoading}
                        title="Delete application"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="no-applications">
              <p>No applications found</p>
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <motion.div 
          className="application-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedApp(null)}
        >
          <motion.div 
            className="application-modal-content"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Application Details</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="info-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{selectedApp.fullName}</span>
                  </div>
                  {selectedApp.dateOfBirth && (
                    <div className="info-item">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">{selectedApp.dateOfBirth}</span>
                    </div>
                  )}
                  {selectedApp.nationality && (
                    <div className="info-item">
                      <span className="info-label">Nationality</span>
                      <span className="info-value">{selectedApp.nationality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedApp.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      {selectedApp.countryCode || ''} {selectedApp.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">Academic Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">University</span>
                    <span className="info-value">{selectedApp.university}</span>
                  </div>
                  {selectedApp.studentId && (
                    <div className="info-item">
                      <span className="info-label">Student ID</span>
                      <span className="info-value">{selectedApp.studentId}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Program</span>
                    <span className="info-value">{selectedApp.program}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Year of Study</span>
                    <span className="info-value">{selectedApp.yearOfStudy}</span>
                  </div>
                  {selectedApp.major && (
                    <div className="info-item">
                      <span className="info-label">Major</span>
                      <span className="info-value">{selectedApp.major}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedApp.preferredSpecialties || selectedApp.careerGoals) && (
                <div className="info-section">
                  <h3 className="section-title">Medical Interests</h3>
                  <div className="info-grid">
                    {selectedApp.preferredSpecialties && (
                      <div className="info-item full-width">
                        <span className="info-label">Preferred Specialties</span>
                        <span className="info-value">{selectedApp.preferredSpecialties}</span>
                      </div>
                    )}
                    {selectedApp.careerGoals && (
                      <div className="info-item full-width">
                        <span className="info-label">Career Goals</span>
                        <span className="info-value">{selectedApp.careerGoals}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApp.previousExperience && (
                <div className="info-section">
                  <h3 className="section-title">Experience</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <span className="info-label">Previous Experience</span>
                      <span className="info-value">{selectedApp.previousExperience}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.motivationStatement && (
                <div className="info-section">
                  <h3 className="section-title">Motivation</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <span className="info-label">Motivation Statement</span>
                      <span className="info-value">{selectedApp.motivationStatement}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="info-section">
                <h3 className="section-title">Application Status</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`status-badge ${selectedApp.status}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Submitted</span>
                    <span className="info-value">
                      {selectedApp.submittedAt?.toDate?.()?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) || formatDate(selectedApp.submittedAt)}
                    </span>
                  </div>
                  {selectedApp.passportNumber && (
                    <div className="info-item full-width">
                      <span className="info-label">Passport Number</span>
                      <span className="info-value passport-highlight">{selectedApp.passportNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedApp.status === 'pending' && (
                <button 
                  className="modal-btn approve-btn"
                  onClick={() => handleApprove(selectedApp.id, selectedApp.fullName)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Approve Application'}
                </button>
              )}
              <button 
                className="modal-btn delete-btn"
                onClick={() => handleDelete(selectedApp.id, selectedApp.fullName)}
                disabled={actionLoading}
              >
                Delete Application
              </button>
              <button 
                className="modal-btn close-btn"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminApplications;