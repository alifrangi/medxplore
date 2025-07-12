import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getApplications, approveApplication } from '../services/database';
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

  const handleApprove = async (appId) => {
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
                    <button 
                      className="view-button"
                      onClick={() => setSelectedApp(app)}
                    >
                      View
                    </button>
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
          className="application-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedApp(null)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Application Details</h2>
            
            <div className="detail-grid">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {selectedApp.fullName}</p>
                <p><strong>Date of Birth:</strong> {selectedApp.dateOfBirth}</p>
                <p><strong>Nationality:</strong> {selectedApp.nationality}</p>
              </div>

              <div className="detail-section">
                <h3>Academic Details</h3>
                <p><strong>University:</strong> {selectedApp.university}</p>
                <p><strong>Student ID:</strong> {selectedApp.studentId}</p>
                <p><strong>Program:</strong> {selectedApp.program}</p>
                <p><strong>Year:</strong> {selectedApp.yearOfStudy}</p>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> {selectedApp.email}</p>
                <p><strong>Phone:</strong> {selectedApp.phone}</p>
              </div>

              <div className="detail-section full-width">
                <h3>Medical Interests</h3>
                <p><strong>Specialties:</strong> {selectedApp.preferredSpecialties}</p>
                <p><strong>Career Goals:</strong> {selectedApp.careerGoals}</p>
                {selectedApp.previousExperience && (
                  <p><strong>Experience:</strong> {selectedApp.previousExperience}</p>
                )}
              </div>

              <div className="detail-section full-width">
                <h3>Motivation Statement</h3>
                <p>{selectedApp.motivationStatement}</p>
              </div>
            </div>

            <div className="modal-actions">
              {selectedApp.status === 'pending' && (
                <button 
                  className="approve-button"
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Approve Application'}
                </button>
              )}
              {selectedApp.status === 'approved' && selectedApp.passportNumber && (
                <p className="passport-info">
                  Passport Number: <strong>{selectedApp.passportNumber}</strong>
                </p>
              )}
              <button 
                className="close-button"
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