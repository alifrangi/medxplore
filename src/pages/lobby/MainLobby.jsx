import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useToast } from '../../components/shared/Toast';
import Icon from '../../components/shared/Icon';
import IdeaCard from '../../components/pipeline/IdeaCard';
import IdeaViewModal from '../../components/pipeline/IdeaViewModal';
import { UNITS } from '../../data/mockData';
import './MainLobby.css';

const MainLobby = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    currentUser,
    logoutUser,
    restoreSession,
    getIdeasForLobby,
    getPendingCountForUnit
  } = usePipeline();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const unitMenuRef = useRef(null);

  const userUniversity = currentUser?.university;
  const userUnits = currentUser?.units || [];

  useEffect(() => {
    if (!currentUser) {
      const restored = restoreSession();
      if (!restored) {
        navigate('/admin');
      }
    }
  }, [currentUser, restoreSession, navigate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (unitMenuRef.current && !unitMenuRef.current.contains(event.target)) {
        setShowUnitMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/admin');
  };

  const handleIdeaClick = (idea) => {
    if (!idea.currentUnit) return;

    // Check if user has access to the unit where the idea is
    const hasAccess = userUnits.includes(idea.currentUnit);

    if (hasAccess) {
      // Navigate to unit workspace
      if (idea.currentUnit === 'systems') {
        navigate(`/unit/systems?idea=${idea.id}`);
      } else if (idea.currentUnit === 'passport') {
        navigate(`/unit/passport?idea=${idea.id}`);
      } else {
        navigate(`/unit/${idea.currentUnit}?idea=${idea.id}`);
      }
    } else {
      // Show view-only modal in lobby with toast notification
      const unitName = UNITS[idea.currentUnit]?.name || idea.currentUnit;
      toast.info(`View only - This idea is being processed by ${unitName}`);
      setSelectedIdea(idea);
      setShowViewModal(true);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedIdea(null);
  };

  const handleGoToUnit = (unitId) => {
    setShowUnitMenu(false);
    if (unitId === 'systems') {
      navigate('/unit/systems');
    } else if (unitId === 'passport') {
      navigate('/unit/passport');
    } else {
      navigate(`/unit/${unitId}`);
    }
  };

  // Get ideas filtered by university and status
  const lobbyIdeas = userUniversity ? getIdeasForLobby(userUniversity, filterStatus) : [];

  // Apply search filter
  const filteredIdeas = lobbyIdeas.filter(idea => {
    if (!searchQuery) return true;
    return idea.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
           idea.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate total pending count across all user's units
  const getTotalPendingCount = () => {
    return userUnits.reduce((total, unitId) => {
      return total + getPendingCountForUnit(unitId, userUniversity);
    }, 0);
  };

  // Status filter options - simplified per plan
  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'rejected', label: 'Rejected' }
  ];

  if (!currentUser) {
    return (
      <div className="lobby-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="main-lobby">
      {/* Simplified Header */}
      <header className="lobby-header">
        <div className="lobby-header__left">
          <span className="lobby-logo">MedXplore</span>
          <span className="university-tag">{userUniversity}</span>
        </div>

        <div className="lobby-header__center">
          <div className="header-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="lobby-header__right">
          {/* User Info */}
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <button className="logout-link" onClick={handleLogout}>Logout</button>
          </div>

          {/* Unit Workspaces Button */}
          {userUnits.length > 0 && (
            <div className="units-wrapper" ref={unitMenuRef}>
              {userUnits.length === 1 ? (
                // Single unit - direct button
                <button
                  className="workspace-btn"
                  onClick={() => handleGoToUnit(userUnits[0])}
                  style={{ '--unit-color': UNITS[userUnits[0]]?.color }}
                >
                  <span className="workspace-icon">
                    <Icon name={UNITS[userUnits[0]]?.icon} size={18} />
                  </span>
                  <span className="workspace-label">{UNITS[userUnits[0]]?.name}</span>
                  {getPendingCountForUnit(userUnits[0], userUniversity) > 0 && (
                    <span className="workspace-badge">
                      {getPendingCountForUnit(userUnits[0], userUniversity)}
                    </span>
                  )}
                </button>
              ) : (
                // Multiple units - dropdown menu
                <>
                  <button
                    className="workspace-btn workspace-btn--multi"
                    onClick={() => setShowUnitMenu(!showUnitMenu)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                    </svg>
                    <span className="workspace-label">My Workspaces</span>
                    {getTotalPendingCount() > 0 && (
                      <span className="workspace-badge">{getTotalPendingCount()}</span>
                    )}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="chevron">
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showUnitMenu && (
                      <motion.div
                        className="units-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        {userUnits.map(unitId => {
                          const unit = UNITS[unitId];
                          if (!unit) return null;
                          const count = getPendingCountForUnit(unitId, userUniversity);
                          return (
                            <button
                              key={unitId}
                              className="unit-menu-item"
                              onClick={() => handleGoToUnit(unitId)}
                              style={{ '--unit-color': unit.color }}
                            >
                              <span className="unit-menu-icon">
                                <Icon name={unit.icon} size={18} />
                              </span>
                              <span className="unit-menu-name">{unit.name}</span>
                              {count > 0 && <span className="unit-menu-badge">{count}</span>}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Filter Pills */}
      <div className="lobby-filters">
        <div className="filter-pills">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              className={`filter-pill ${filterStatus === filter.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <span className="filter-count">{filteredIdeas.length} items</span>
      </div>

      {/* Main Content */}
      <main className="lobby-content">
        {filteredIdeas.length > 0 ? (
          <div className="ideas-grid">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={handleIdeaClick}
                showUnit={true}
              />
            ))}
          </div>
        ) : (
          <div className="empty-feed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>
              {filterStatus === 'all'
                ? `No ideas for ${userUniversity} yet`
                : `No ${filterStatus} ideas for ${userUniversity}`
              }
            </p>
          </div>
        )}
      </main>

      {/* View-Only Modal for ideas user doesn't have access to */}
      {showViewModal && selectedIdea && (
        <IdeaViewModal
          idea={selectedIdea}
          onClose={handleCloseViewModal}
        />
      )}
    </div>
  );
};

export default MainLobby;
