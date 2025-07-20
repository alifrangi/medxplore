import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import { checkDepartmentAccess } from '../services/database';
import DepartmentDashboardLayout from '../components/DepartmentDashboardLayout';
import UpcomingEvents from '../components/UpcomingEvents';
import DepartmentChat from '../components/DepartmentChat';
import DepartmentIdeas from '../components/DepartmentIdeas';
import DepartmentFiles from '../components/DepartmentFiles';
import './DepartmentDashboard.css';

const StudentEngagementDashboard = () => {
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
    if (worker && worker.departments.includes('student-engagement')) {
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Check department code access
    const accessResult = await checkDepartmentAccess('student-engagement');
    if (accessResult.success) {
      setHasAccess(true);
    } else {
      navigate('/admin');
    }
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
    id: 'student-engagement',
    name: 'Student Engagement',
    color: '#FF9800',
    description: 'Building strong communities and fostering student participation'
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
        <h5>About Student Engagement</h5>
        <p>{departmentInfo.description}</p>
        <div className="department-stats">
          <div className="stat">
            <span className="stat-value">500+</span>
            <span className="stat-label">Active Students</span>
          </div>
          <div className="stat">
            <span className="stat-value">25+</span>
            <span className="stat-label">Programs</span>
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
              <h2>Welcome to Student Engagement</h2>
              <p>Foster community, create meaningful connections, and enhance the student experience through innovative engagement programs.</p>
            </div>
            
            <div className="quick-actions">
              <div className="action-card" onClick={() => setActiveTab('ideas')}>
                <span className="material-icons-outlined">group</span>
                <h4>Propose Program</h4>
                <p>Share student engagement program ideas</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('files')}>
                <span className="material-icons-outlined">event</span>
                <h4>Event Resources</h4>
                <p>Access planning guides and materials</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('chat')}>
                <span className="material-icons-outlined">diversity_3</span>
                <h4>Community Discussion</h4>
                <p>Connect with engagement coordinators</p>
              </div>
            </div>

            <UpcomingEvents departmentFilter="student-engagement" limit={5} />
          </div>
        );
      
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
    return null;
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

export default StudentEngagementDashboard;