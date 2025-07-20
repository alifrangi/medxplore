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

const ResearchDashboard = () => {
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
    if (worker && worker.departments.includes('research')) {
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Check department code access
    const accessResult = await checkDepartmentAccess('research');
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
    id: 'research',
    name: 'Research',
    color: '#00BCD4',
    description: 'Advancing medical knowledge through innovative research'
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
        <h5>About Research Department</h5>
        <p>{departmentInfo.description}</p>
        <div className="department-stats">
          <div className="stat">
            <span className="stat-value">15+</span>
            <span className="stat-label">Active Projects</span>
          </div>
          <div className="stat">
            <span className="stat-value">50+</span>
            <span className="stat-label">Researchers</span>
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
              <h2>Welcome to Research Department</h2>
              <p>Collaborate with fellow researchers, share innovative ideas, and stay updated on upcoming research events.</p>
            </div>
            
            <div className="quick-actions">
              <div className="action-card" onClick={() => setActiveTab('ideas')}>
                <span className="material-icons-outlined">science</span>
                <h4>Submit Research Proposal</h4>
                <p>Share your research ideas with the team</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('files')}>
                <span className="material-icons-outlined">biotech</span>
                <h4>Access Research Papers</h4>
                <p>Browse and download research materials</p>
              </div>
              <div className="action-card" onClick={() => setActiveTab('chat')}>
                <span className="material-icons-outlined">groups</span>
                <h4>Join Discussion</h4>
                <p>Connect with research team members</p>
              </div>
            </div>

            <UpcomingEvents departmentFilter="research" limit={5} />
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
    return null; // Will redirect to admin page
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

export default ResearchDashboard;