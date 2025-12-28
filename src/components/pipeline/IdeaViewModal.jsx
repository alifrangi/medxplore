import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';
import StatusTimeline from './StatusTimeline';
import Icon from '../shared/Icon';
import { UNITS, IDEA_TYPES, getTimeInStatus } from '../../data/mockData';
import './IdeaViewModal.css';

const IdeaViewModal = ({ idea, onClose }) => {
  const currentUnit = UNITS[idea.currentUnit];
  const ideaType = IDEA_TYPES.find(t => t.id === idea.type);
  const timeInStatus = idea.statusHistory ? getTimeInStatus(idea.statusHistory) : 'N/A';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="view-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="idea-view-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="view-modal-header">
            <div className="view-modal-header__left">
              <span className="view-idea-id">{idea.id}</span>
              <StatusBadge status={idea.currentStatus} size="md" />
              {currentUnit && (
                <span
                  className="view-unit-badge"
                  style={{ '--unit-color': currentUnit.color }}
                >
                  <Icon name={currentUnit.icon} size={14} /> {currentUnit.label}
                </span>
              )}
            </div>
            <button className="view-close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* View-Only Banner */}
          <div className="view-only-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Only - This idea is being processed by another unit
          </div>

          {/* Body */}
          <div className="view-modal-body">
            {/* Main Content */}
            <div className="view-modal-main">
              <h2>{idea.title}</h2>

              <div className="view-idea-meta">
                <div className="view-meta-item">
                  <strong>Type:</strong> {ideaType?.label || idea.type}
                </div>
                <div className="view-meta-item">
                  <strong>University:</strong> {idea.university}
                </div>
                <div className="view-meta-item">
                  <strong>Audience:</strong> {idea.targetAudience}
                </div>
                <div className="view-meta-item">
                  <strong>Est. Attendees:</strong> {idea.estimatedAttendees}
                </div>
                <div className="view-meta-item">
                  <strong>Requires External:</strong> {idea.requiresApproval ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="view-idea-section">
                <h3>Learning Goal</h3>
                <p>{idea.goal}</p>
              </div>

              <div className="view-idea-section">
                <h3>Description</h3>
                <p>{idea.description}</p>
              </div>

              {idea.suggestedSpeakers && (
                <div className="view-idea-section">
                  <h3>Suggested Speakers</h3>
                  <p>{idea.suggestedSpeakers}</p>
                </div>
              )}

              {idea.resourcesNeeded && (
                <div className="view-idea-section">
                  <h3>Resources Needed</h3>
                  <p>{idea.resourcesNeeded}</p>
                </div>
              )}

              {idea.notes && (
                <div className="view-idea-section">
                  <h3>Additional Notes</h3>
                  <p>{idea.notes}</p>
                </div>
              )}

              {/* Drive Link - Read Only */}
              {idea.driveLink && (
                <div className="view-idea-section view-drive-section">
                  <h3>
                    <Icon name="FolderOpen" size={16} color="#4285f4" style={{ marginRight: '0.5rem' }} />
                    Drive Folder
                  </h3>
                  <a
                    href={idea.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-drive-link"
                  >
                    {idea.driveLink}
                  </a>
                </div>
              )}

              {/* Warning for returned ideas */}
              {idea.returnReason && (
                <div className="view-idea-section view-warning-section">
                  <h3>Return Reason</h3>
                  <p>{idea.returnReason}</p>
                </div>
              )}

              {/* Error for rejected ideas */}
              {idea.rejectionReason && (
                <div className="view-idea-section view-error-section">
                  <h3>Rejection Reason</h3>
                  <p>{idea.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="view-modal-sidebar">
              <div className="view-sidebar-section">
                <h3>Submitted By</h3>
                <p className="view-submitter">{idea.submittedBy}</p>
                <p className="view-submit-date">{formatDate(idea.submittedAt)}</p>
              </div>

              <div className="view-sidebar-section">
                <h3>Time in Queue</h3>
                <p className="view-time-status">{timeInStatus}</p>
              </div>

              {idea.statusHistory && idea.statusHistory.length > 0 && (
                <div className="view-sidebar-section view-timeline-section">
                  <h3>Status History</h3>
                  <StatusTimeline statusHistory={idea.statusHistory} currentStatus={idea.currentStatus} />
                </div>
              )}
            </div>
          </div>

          {/* Footer - Close Only */}
          <div className="view-modal-footer">
            <button className="view-close-footer-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdeaViewModal;
