import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../shared/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import FeedbackModal from './FeedbackModal';
import './WorkerSidebar.css';

// Map unit IDs to Lucide icon names
const UNIT_ICONS = {
  academic: 'BookOpen',
  programs: 'ClipboardList',
  operations: 'Settings',
  external: 'Building2',
  systems: 'Monitor',
  passport: 'Ticket'
};

const WorkerSidebar = ({
  currentUser,
  activeUnit,
  onUnitChange,
  onLogout,
  isOpen,
  onClose,
  pendingCounts = {},
  quickStats = { pendingTasks: 0, completedToday: 0 },
  units = {},
  isAdmin = false
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get unit color
  const getUnitColor = (unitId) => {
    return units[unitId]?.color || '#666';
  };

  // Sidebar animation variants
  const sidebarVariants = {
    closed: {
      x: -260,
      opacity: 0,
      transition: { duration: 0.2 }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const sidebarContent = (
    <>
      {/* Logo & Close (mobile) */}
      <div className="worker-sidebar__header">
        <span className="worker-sidebar__logo"><span>Med</span>Xplore</span>
        <button
          className="worker-sidebar__close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="worker-sidebar__profile">
        <div
          className="worker-sidebar__avatar"
          style={{ backgroundColor: isAdmin ? '#7c3aed' : getUnitColor(activeUnit) }}
        >
          {getInitials(currentUser?.name)}
        </div>
        <div className="worker-sidebar__user-info">
          <span className="worker-sidebar__user-name">{currentUser?.name}</span>
          <span className="worker-sidebar__university">
            {isAdmin && <span className="worker-sidebar__admin-badge">Admin</span>}
            {currentUser?.university}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="worker-sidebar__stats">
        <div className="worker-sidebar__stat">
          <span className="worker-sidebar__stat-value">{quickStats.pendingTasks}</span>
          <span className="worker-sidebar__stat-label">Pending Tasks</span>
        </div>
        <div className="worker-sidebar__stat-divider"></div>
        <div className="worker-sidebar__stat">
          <span className="worker-sidebar__stat-value">{quickStats.completedToday}</span>
          <span className="worker-sidebar__stat-label">Completed Today</span>
        </div>
      </div>

      {/* Unit Navigation */}
      <nav className="worker-sidebar__nav" aria-label="Unit navigation">
        <span className="worker-sidebar__nav-label">{isAdmin ? 'All Units' : 'Your Units'}</span>
        <ul className="worker-sidebar__nav-list">
          {currentUser?.units?.map((unitId) => {
            const unit = units[unitId];
            if (!unit) return null;

            const isActive = activeUnit === unitId;
            const pendingCount = pendingCounts[unitId] || 0;

            return (
              <li key={unitId}>
                <button
                  className={`worker-sidebar__nav-item ${isActive ? 'worker-sidebar__nav-item--active' : ''}`}
                  onClick={() => onUnitChange(unitId)}
                  style={{ '--unit-color': unit.color }}
                >
                  <span className="worker-sidebar__nav-icon">
                    <Icon name={UNIT_ICONS[unitId] || 'Circle'} size={20} />
                  </span>
                  <span className="worker-sidebar__nav-text">{unit.name}</span>
                  {pendingCount > 0 && (
                    <span className="worker-sidebar__nav-badge">{pendingCount}</span>
                  )}
                  {isActive && (
                    <motion.span
                      className="worker-sidebar__nav-indicator"
                      layoutId="activeUnitIndicator"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer */}
      <div className="worker-sidebar__spacer"></div>

      {/* Footer Actions */}
      <div className="worker-sidebar__footer">
        {/* Feedback Button */}
        <button
          className="worker-sidebar__action-btn"
          onClick={() => setShowFeedbackModal(true)}
        >
          <Icon name="MessageSquare" size={18} />
          <span>Feedback</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="worker-sidebar__action-btn"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={18} />
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button className="worker-sidebar__logout" onClick={onLogout}>
          <Icon name="LogOut" size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (always visible) */}
      <aside className="worker-sidebar worker-sidebar--desktop">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (animated overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="worker-sidebar worker-sidebar--mobile"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        currentUser={currentUser}
      />
    </>
  );
};

export default WorkerSidebar;
