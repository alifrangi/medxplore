import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePipeline } from '../contexts/PipelineContext';
import { getApplications, getAllEvents, deleteApplication, approveApplication, getAllFeedback, getAllAccessCodes, createAccessCode, updateAccessCode, deleteAccessCode } from '../services/database';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Icon from '../components/shared/Icon';
import DepartmentWorkerManager from '../components/DepartmentWorkerManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminData, logout } = useAuth();
  const { logoutUser } = usePipeline();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    totalEvents: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [accessCodes, setAccessCodes] = useState([]);
  const [showAccessCodeForm, setShowAccessCodeForm] = useState(false);
  const [accessCodeFormData, setAccessCodeFormData] = useState({
    code: '',
    university: 'ALL',
    description: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get student count
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const totalStudents = studentsSnapshot.size;

      // Get pending applications
      const pendingApps = await getApplications('pending');
      const pendingApplications = pendingApps.length;

      // Get events count
      const events = await getAllEvents();
      const totalEvents = events.length;

      // Get recent activity (last 5 applications)
      const allApplications = await getApplications();
      const recentActivity = allApplications.slice(0, 5);

      // Get feedback
      const feedbackResult = await getAllFeedback();
      if (feedbackResult.success) {
        setFeedback(feedbackResult.feedback);
      }

      // Get access codes
      const accessCodesResult = await getAllAccessCodes();
      if (accessCodesResult.success) {
        setAccessCodes(accessCodesResult.codes);
      }

      setStats({
        totalStudents,
        pendingApplications,
        totalEvents,
        recentActivity
      });
    } catch (error) {
      // Error loading dashboard data
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear both auth contexts
    await logout();
    logoutUser();

    // Clear all session storage
    sessionStorage.clear();

    navigate('/admin');
  };

  const handleDeleteApplication = async (applicationId, applicationName) => {
    if (!confirm(`Are you sure you want to delete the application from ${applicationName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteApplication(applicationId);
      if (result.success) {
        alert('Application deleted successfully!');
        // Reload dashboard data
        await loadDashboardData();
      } else {
        alert('Failed to delete application: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred while deleting the application');
    }
  };

  const handleViewApplication = (applicationId) => {
    const app = stats.recentActivity.find(a => a.id === applicationId);
    setSelectedApplication(app);
  };

  // Access Code Management
  const handleCreateAccessCode = async (e) => {
    e.preventDefault();
    if (!accessCodeFormData.code.trim()) {
      alert('Please enter an access code');
      return;
    }

    try {
      const result = await createAccessCode({
        code: accessCodeFormData.code.toUpperCase(),
        university: accessCodeFormData.university,
        description: accessCodeFormData.description
      });

      if (result.success) {
        alert('Access code created successfully!');
        setAccessCodeFormData({ code: '', university: 'ALL', description: '' });
        setShowAccessCodeForm(false);
        loadDashboardData();
      } else {
        alert('Failed to create access code: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred while creating the access code');
    }
  };

  const handleToggleAccessCode = async (codeId, currentStatus) => {
    try {
      const result = await updateAccessCode(codeId, { isActive: !currentStatus });
      if (result.success) {
        loadDashboardData();
      } else {
        alert('Failed to update access code');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleDeleteAccessCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this access code?')) {
      return;
    }

    try {
      const result = await deleteAccessCode(codeId);
      if (result.success) {
        loadDashboardData();
      } else {
        alert('Failed to delete access code');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleApproveApplication = async (applicationId, applicationName) => {
    if (!confirm(`Are you sure you want to approve the application from ${applicationName}?`)) {
      return;
    }

    try {
      const result = await approveApplication(applicationId, adminData?.id || 'admin');
      if (result.success) {
        alert(`Application approved successfully! Passport Number: ${result.passportNumber}`);
        // Reload dashboard data to update the list
        await loadDashboardData();
      } else {
        alert('Failed to approve application: ' + result.error);
      }
    } catch (error) {
      alert('An error occurred while approving the application');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, {adminData?.name || 'Admin'}</p>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        <motion.div 
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="stat-card">
            <div className="stat-icon students-icon">
              <Icon name="Users" size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon applications-icon">
              <Icon name="FileText" size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingApplications}</h3>
              <p>Pending Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon events-icon">
              <Icon name="Calendar" size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="quick-actions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/applications" className="action-card">
              <div className="action-icon">
                <Icon name="FileEdit" size={28} />
              </div>
              <h3>Review Applications</h3>
              <p>Review and approve pending student applications</p>
            </Link>

            <Link to="/admin/students" className="action-card">
              <div className="action-icon">
                <Icon name="GraduationCap" size={28} />
              </div>
              <h3>Manage Students</h3>
              <p>View and manage all registered students</p>
            </Link>

            <Link to="/admin/events" className="action-card">
              <div className="action-icon">
                <Icon name="Target" size={28} />
              </div>
              <h3>Manage Events</h3>
              <p>Create events and track attendance</p>
            </Link>

          </div>
        </motion.div>

        <motion.div 
          className="department-dashboards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2>Unit Dashboards</h2>
          <div className="departments-grid">
            <Link to="/worker/academic" className="department-card academic">
              <div className="department-icon">
                <Icon name="BookOpen" size={28} />
              </div>
              <h3>Academic Unit</h3>
              <p>Reviews academic value and learning outcomes</p>
            </Link>

            <Link to="/worker/programs" className="department-card programs">
              <div className="department-icon">
                <Icon name="ClipboardList" size={28} />
              </div>
              <h3>Programs Unit</h3>
              <p>Prepares program structure and event design</p>
            </Link>

            <Link to="/worker/operations" className="department-card operations">
              <div className="department-icon">
                <Icon name="Settings" size={28} />
              </div>
              <h3>Operations Unit</h3>
              <p>Handles feasibility and logistics</p>
            </Link>

            <Link to="/worker/external" className="department-card external">
              <div className="department-icon">
                <Icon name="Building2" size={28} />
              </div>
              <h3>External Approvals</h3>
              <p>Secures official permissions and approvals</p>
            </Link>

            <Link to="/worker/systems" className="department-card systems">
              <div className="department-icon">
                <Icon name="Monitor" size={28} />
              </div>
              <h3>Systems Unit</h3>
              <p>Creates and publishes events on platform</p>
            </Link>

            <Link to="/worker/passport" className="department-card passport">
              <div className="department-icon">
                <Icon name="Ticket" size={28} />
              </div>
              <h3>Passport Unit</h3>
              <p>Manages attendance and passport credits</p>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="department-worker-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <DepartmentWorkerManager />
        </motion.div>

        {/* Access Codes Section */}
        <motion.div
          className="access-codes-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <div className="section-header">
            <h2>Access Codes</h2>
            <button
              className="add-code-btn"
              onClick={() => setShowAccessCodeForm(!showAccessCodeForm)}
            >
              {showAccessCodeForm ? 'Cancel' : 'Add Code'}
            </button>
          </div>

          {showAccessCodeForm && (
            <motion.form
              className="access-code-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleCreateAccessCode}
            >
              <div className="form-row">
                <div className="form-group">
                  <label>Access Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., MEDX2025"
                    value={accessCodeFormData.code}
                    onChange={(e) => setAccessCodeFormData({...accessCodeFormData, code: e.target.value.toUpperCase()})}
                    maxLength={12}
                  />
                </div>
                <div className="form-group">
                  <label>University</label>
                  <select
                    value={accessCodeFormData.university}
                    onChange={(e) => setAccessCodeFormData({...accessCodeFormData, university: e.target.value})}
                  >
                    <option value="ALL">All Universities</option>
                    <option value="JUST">JUST</option>
                    <option value="YU">YU</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Spring 2025 Ideas Submission"
                  value={accessCodeFormData.description}
                  onChange={(e) => setAccessCodeFormData({...accessCodeFormData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="submit-code-btn">Create Access Code</button>
            </motion.form>
          )}

          {accessCodes.length > 0 ? (
            <div className="access-codes-list">
              {accessCodes.map((code) => (
                <div key={code.id} className={`access-code-item ${!code.isActive ? 'inactive' : ''}`}>
                  <div className="code-info">
                    <span className="code-value">{code.code}</span>
                    <span className={`code-status ${code.isActive ? 'active' : 'inactive'}`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="code-details">
                    <span className="code-university">{code.university === 'ALL' ? 'All Universities' : code.university}</span>
                    {code.description && <span className="code-description">{code.description}</span>}
                    <span className="code-usage">Used: {code.usageCount || 0} times</span>
                  </div>
                  <div className="code-actions">
                    <button
                      className={`toggle-btn ${code.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleAccessCode(code.id, code.isActive)}
                    >
                      {code.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="delete-code-btn"
                      onClick={() => handleDeleteAccessCode(code.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-codes">No access codes created yet. Create one to allow idea submissions.</p>
          )}
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          className="feedback-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <h2>User Feedback</h2>
          {feedback.length > 0 ? (
            <div className="feedback-list">
              {feedback.map((item) => (
                <div key={item.id} className={`feedback-item feedback-item--${item.type}`}>
                  <div className="feedback-item__header">
                    <span className={`feedback-type-badge feedback-type-badge--${item.type}`}>
                      {item.type}
                    </span>
                    <span className="feedback-item__date">
                      {item.createdAt instanceof Date
                        ? item.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : new Date(item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                      }
                    </span>
                  </div>
                  <p className="feedback-item__message">{item.message}</p>
                  <div className="feedback-item__footer">
                    <span className="feedback-item__user">
                      From: {item.userName || 'Anonymous'}
                      {item.university && ` (${item.university})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-feedback">No feedback received yet</p>
          )}
        </motion.div>


        <motion.div 
          className="recent-activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Recent Applications</h2>
          {stats.recentActivity.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((app) => (
                <div key={app.id} className="activity-item">
                  <div className="activity-info">
                    <h4>{app.fullName}</h4>
                    <p>{app.university} - {app.program}</p>
                  </div>
                  <div className="activity-actions">
                    <button 
                      className="action-btn view-btn-small"
                      onClick={() => handleViewApplication(app.id)}
                    >
                      View
                    </button>
                    {app.status === 'pending' && (
                      <button 
                        className="action-btn approve-btn-small"
                        onClick={() => handleApproveApplication(app.id, app.fullName)}
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
                      onClick={() => handleDeleteApplication(app.id, app.fullName)}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent applications</p>
          )}
          <Link to="/admin/applications" className="view-all-link">
            View All Applications →
          </Link>
        </motion.div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <motion.div 
          className="application-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedApplication(null)}
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
                onClick={() => setSelectedApplication(null)}
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
                    <span className="info-value">{selectedApplication.fullName}</span>
                  </div>
                  {selectedApplication.dateOfBirth && (
                    <div className="info-item">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">{selectedApplication.dateOfBirth}</span>
                    </div>
                  )}
                  {selectedApplication.nationality && (
                    <div className="info-item">
                      <span className="info-label">Nationality</span>
                      <span className="info-value">{selectedApplication.nationality}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedApplication.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">
                      {selectedApplication.countryCode || ''} {selectedApplication.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">Academic Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">University</span>
                    <span className="info-value">{selectedApplication.university}</span>
                  </div>
                  {selectedApplication.studentId && (
                    <div className="info-item">
                      <span className="info-label">Student ID</span>
                      <span className="info-value">{selectedApplication.studentId}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <span className="info-label">Program</span>
                    <span className="info-value">{selectedApplication.program}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Year of Study</span>
                    <span className="info-value">{selectedApplication.yearOfStudy}</span>
                  </div>
                  {selectedApplication.major && (
                    <div className="info-item">
                      <span className="info-label">Major</span>
                      <span className="info-value">{selectedApplication.major}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedApplication.preferredSpecialties || selectedApplication.careerGoals) && (
                <div className="info-section">
                  <h3 className="section-title">Medical Interests</h3>
                  <div className="info-grid">
                    {selectedApplication.preferredSpecialties && (
                      <div className="info-item full-width">
                        <span className="info-label">Preferred Specialties</span>
                        <span className="info-value">{selectedApplication.preferredSpecialties}</span>
                      </div>
                    )}
                    {selectedApplication.careerGoals && (
                      <div className="info-item full-width">
                        <span className="info-label">Career Goals</span>
                        <span className="info-value">{selectedApplication.careerGoals}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApplication.previousExperience && (
                <div className="info-section">
                  <h3 className="section-title">Experience</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <span className="info-label">Previous Experience</span>
                      <span className="info-value">{selectedApplication.previousExperience}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedApplication.motivationStatement && (
                <div className="info-section">
                  <h3 className="section-title">Motivation</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <span className="info-label">Motivation Statement</span>
                      <span className="info-value">{selectedApplication.motivationStatement}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="info-section">
                <h3 className="section-title">Application Status</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`status-badge ${selectedApplication.status}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Submitted</span>
                    <span className="info-value">
                      {selectedApplication.submittedAt?.toDate?.()?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) || 'N/A'}
                    </span>
                  </div>
                  {selectedApplication.passportNumber && (
                    <div className="info-item full-width">
                      <span className="info-label">Passport Number</span>
                      <span className="info-value passport-highlight">{selectedApplication.passportNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedApplication.status === 'pending' && (
                <button 
                  className="modal-btn approve-btn"
                  onClick={() => {
                    setSelectedApplication(null);
                    handleApproveApplication(selectedApplication.id);
                  }}
                >
                  Approve Application
                </button>
              )}
              <button 
                className="modal-btn delete-btn"
                onClick={() => {
                  setSelectedApplication(null);
                  handleDeleteApplication(selectedApplication.id, selectedApplication.fullName);
                }}
              >
                Delete Application
              </button>

            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;