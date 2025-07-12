import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getApplications, getAllEvents } from '../services/database';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminData, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApplications: 0,
    totalEvents: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

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
    await logout();
    navigate('/admin');
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
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
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
            <div className="stat-icon students-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon applications-icon">📋</div>
            <div className="stat-content">
              <h3>{stats.pendingApplications}</h3>
              <p>Pending Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon events-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/admin/applications" className="action-card">
              <div className="action-icon">📝</div>
              <h3>Review Applications</h3>
              <p>Review and approve pending student applications</p>
            </Link>

            <Link to="/admin/students" className="action-card">
              <div className="action-icon">🎓</div>
              <h3>Manage Students</h3>
              <p>View and manage all registered students</p>
            </Link>

            <Link to="/admin/events" className="action-card">
              <div className="action-icon">🎯</div>
              <h3>Manage Events</h3>
              <p>Create events and track attendance</p>
            </Link>
          </div>
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
                  <div className="activity-meta">
                    <span className={`status ${app.status}`}>{app.status}</span>
                    <span className="date">
                      {app.submittedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </span>
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
    </div>
  );
};

export default AdminDashboard;