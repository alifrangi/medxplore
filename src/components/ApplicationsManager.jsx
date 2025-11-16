import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getApplications, approveApplication } from '../services/database';
import './ApplicationsManager.css';

const ApplicationsManager = ({ workerId, workerName }) => {
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
      console.error('Error loading applications:', error);
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
    if (!confirm('Are you sure you want to approve this application?')) {
      return;
    }

    setActionLoading(true);
    const result = await approveApplication(appId, workerId || 'worker');

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
      <div className="applications-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-manager">
      <div className="manager-header">
        <h2>Application Management</h2>
        <p className="manager-subtitle">Review and approve student passport applications</p>
      </div>

      <div className="filters-section">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All ({applications.length})
        </button>
        <button
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({applications.filter(a => a.status === 'pending').length})
        </button>
        <button
          className={filter === 'approved' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('approved')}
        >
          Approved ({applications.filter(a => a.status === 'approved').length})
        </button>
      </div>

      <div className="applications-table-wrapper">
        {filteredApplications.length > 0 ? (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>University</th>
                <th>Program</th>
                <th>Year</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td className="name-cell">{app.fullName}</td>
                  <td>{app.university}</td>
                  <td>{app.program}</td>
                  <td>Year {app.yearOfStudy}</td>
                  <td>{formatDate(app.submittedAt)}</td>
                  <td>
                    <span className={`status-badge status-${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelectedApp(app)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No applications found</p>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedApp(null)}
        >
          <motion.div
            className="modal-content application-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Application Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{selectedApp.fullName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>{selectedApp.dateOfBirth}</p>
                  </div>
                  <div className="detail-item">
                    <label>Nationality</label>
                    <p>{selectedApp.nationality}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Academic Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>University</label>
                    <p>{selectedApp.university}</p>
                  </div>
                  <div className="detail-item">
                    <label>Student ID</label>
                    <p>{selectedApp.studentId}</p>
                  </div>
                  <div className="detail-item">
                    <label>Program</label>
                    <p>{selectedApp.program}</p>
                  </div>
                  <div className="detail-item">
                    <label>Year of Study</label>
                    <p>Year {selectedApp.yearOfStudy}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedApp.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{selectedApp.phone}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Medical Interests</h3>
                <div className="detail-item">
                  <label>Preferred Specialties</label>
                  <p>{selectedApp.preferredSpecialties}</p>
                </div>
                <div className="detail-item">
                  <label>Career Goals</label>
                  <p>{selectedApp.careerGoals}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Application Info</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge status-${selectedApp.status}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Submitted At</label>
                    <p>{formatDate(selectedApp.submittedAt)}</p>
                  </div>
                  {selectedApp.passportNumber && (
                    <div className="detail-item">
                      <label>Passport Number</label>
                      <p className="passport-number">{selectedApp.passportNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedApp.status === 'pending' && (
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Approve Application'}
                </button>
              )}
              <button
                className="cancel-btn"
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

export default ApplicationsManager;
