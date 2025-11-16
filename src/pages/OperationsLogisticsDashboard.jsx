import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import DepartmentDashboardLayout from '../components/DepartmentDashboardLayout';
import UpcomingEvents from '../components/UpcomingEvents';
import DepartmentChat from '../components/DepartmentChat';
import DepartmentIdeas from '../components/DepartmentIdeas';
import DepartmentFiles from '../components/DepartmentFiles';
import ApplicationsManager from '../components/ApplicationsManager';
import EventsManager from '../components/EventsManager';
import NewsManager from '../components/NewsManager';
import PointsManager from '../components/PointsManager';
import './DepartmentDashboard.css';

const OperationsLogisticsDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAdmin, studentData, adminData } = useAuth();
  const { worker, logout: workerLogout } = useWorkerAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    // Check if user is admin
    if (isAdmin) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Check if user is a worker with access
    if (worker && worker.departments.includes('operations-logistics')) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // No access - redirect to admin page
    navigate('/admin');
    setLoading(false);
  };

  const handleLogout = async () => {
    if (worker) {
      await workerLogout();
    } else {
      await logout();
    }
    navigate('/');
  };

  const departmentInfo = {
    id: 'operations-logistics',
    name: 'Operations & Logistics',
    color: '#607D8B',
    description: 'Managing operations, logistics, and points distribution system'
  };

  const headerActions = (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );

  const sidebarContent = (
    <>
      <div className="user-info-card">
        <div className="user-avatar">
          <span className="material-icons-outlined">
            {isAdmin ? 'admin_panel_settings' : 'person'}
          </span>
        </div>
        <h4>{worker ? `${worker.firstName} ${worker.lastName}` : (adminData?.name || studentData?.fullName)}</h4>
        <p>{worker ? 'Department Worker' : (isAdmin ? 'Administrator' : `Student - ${studentData?.tier}`)}</p>
      </div>

      <nav className="dashboard-nav">
        <button
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-icons-outlined">dashboard</span>
          Overview
        </button>
        <button
          className={`nav-item ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          <span className="material-icons-outlined">stars</span>
          Points Manager
        </button>
        <button
          className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <span className="material-icons-outlined">assignment</span>
          Applications
        </button>
        <button
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <span className="material-icons-outlined">event</span>
          Events
        </button>
        <button
          className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <span className="material-icons-outlined">newspaper</span>
          News
        </button>
        <button
          className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span className="material-icons-outlined">forum</span>
          Team Chat
        </button>
        <button
          className={`nav-item ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          <span className="material-icons-outlined">lightbulb</span>
          Ideas Board
        </button>
        <button
          className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <span className="material-icons-outlined">folder</span>
          Files
        </button>
      </nav>

      <div className="department-info">
        <h5>About Operations & Logistics</h5>
        <p>{departmentInfo.description}</p>
        <div className="department-stats">
          <div className="stat">
            <span className="stat-value">Points</span>
            <span className="stat-label">Management</span>
          </div>
          <div className="stat">
            <span className="stat-value">Ops</span>
            <span className="stat-label">Excellence</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-overview">
            <div className="welcome-section">
              <h2>Welcome to Operations & Logistics</h2>
              <p>Manage operations, award points to students, and ensure smooth functioning of all MedXplore activities.</p>
            </div>

            <div className="quick-actions">
              <div className="action-card" onClick={() => setActiveTab('points')}>
                <span className="material-icons-outlined">emoji_events</span>
                <h4>Award Points</h4>
                <p>Manage points for student participations</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('applications')}>
                <span className="material-icons-outlined">assignment</span>
                <h4>Review Applications</h4>
                <p>Review and approve student applications</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('events')}>
                <span className="material-icons-outlined">event</span>
                <h4>Manage Events</h4>
                <p>Create and manage department events</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('news')}>
                <span className="material-icons-outlined">newspaper</span>
                <h4>Publish News</h4>
                <p>Create and manage news articles</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('ideas')}>
                <span className="material-icons-outlined">settings</span>
                <h4>Process Improvement</h4>
                <p>Share operational efficiency ideas</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('files')}>
                <span className="material-icons-outlined">inventory</span>
                <h4>Operations Files</h4>
                <p>Access logistics and operational materials</p>
              </div>
            </div>

            <UpcomingEvents departmentFilter="operations-logistics" limit={5} />
          </div>
        );

      case 'points':
        return <PointsManager workerId={worker?.id || adminData?.id} workerName={worker ? `${worker.firstName} ${worker.lastName}` : adminData?.name} />;

      case 'applications':
        return <ApplicationsManager workerId={worker?.id || adminData?.id} workerName={worker ? `${worker.firstName} ${worker.lastName}` : adminData?.name} />;

      case 'events':
        return <EventsManager workerId={worker?.id || adminData?.id} workerName={worker ? `${worker.firstName} ${worker.lastName}` : adminData?.name} />;

      case 'news':
        return <NewsManager workerId={worker?.id || adminData?.id} workerName={worker ? `${worker.firstName} ${worker.lastName}` : adminData?.name} />;

      case 'chat':
        return <DepartmentChat departmentId={departmentInfo.id} departmentName={departmentInfo.name} />;

      case 'ideas':
        return <DepartmentIdeas departmentId={departmentInfo.id} departmentName={departmentInfo.name} />;

      case 'files':
        return <DepartmentFiles departmentId={departmentInfo.id} departmentName={departmentInfo.name} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Checking access...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{
      '--primary-color': departmentInfo.color,
      '--primary-color-dark': departmentInfo.color
    }}>
      <DepartmentDashboardLayout
        departmentName={departmentInfo.name}
        departmentColor={departmentInfo.color}
        sidebarContent={sidebarContent}
        headerActions={headerActions}
      >
        {renderContent()}
      </DepartmentDashboardLayout>
    </div>
  );
};

export default OperationsLogisticsDashboard;
