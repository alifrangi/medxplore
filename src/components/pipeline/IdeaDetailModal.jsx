import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from './StatusBadge';
import StatusTimeline from './StatusTimeline';
import Icon from '../shared/Icon';
import { UNITS, IDEA_TYPES, UNIT_PERMISSIONS, getTimeInStatus } from '../../data/mockData';
import './pipeline.css';

const IdeaDetailModal = ({
  idea,
  unitId,
  onClose,
  onApprove,
  onReturn,
  onReject,
  onUpdateDriveLink
}) => {
  const [action, setAction] = useState(null); // 'approve', 'return', 'reject'
  const [notes, setNotes] = useState('');
  const [driveLink, setDriveLink] = useState(idea.driveLink || '');
  const [loading, setLoading] = useState(false);

  const unit = UNITS[unitId];
  const permissions = UNIT_PERMISSIONS[unitId] || {};
  const ideaType = IDEA_TYPES.find(t => t.id === idea.type);
  const timeInStatus = getTimeInStatus(idea.statusHistory);

  const handleApprove = async () => {
    // Check if Academic unit requires drive link
    if (permissions.requiresDriveLink && !driveLink) {
      alert('Please add a Drive folder link before approving.');
      return;
    }

    setLoading(true);
    try {
      // Save drive link if provided
      if (driveLink && driveLink !== idea.driveLink) {
        onUpdateDriveLink?.(idea.id, driveLink);
      }
      await onApprove?.(idea.id, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for returning this idea.');
      return;
    }
    setLoading(true);
    try {
      await onReturn?.(idea.id, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejecting this idea.');
      return;
    }
    setLoading(true);
    try {
      await onReject?.(idea.id, notes);
      onClose();
    } finally {
      setLoading(false);
    }
  };

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
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="idea-modal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-header__left">
              <span className="idea-id">{idea.id}</span>
              <StatusBadge status={idea.currentStatus} size="md" />
            </div>
            <button className="close-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Main Content */}
            <div className="modal-main">
              <h2>{idea.title}</h2>

              <div className="idea-meta">
                <div className="meta-item">
                  <strong>Type:</strong> {ideaType?.label || idea.type}
                </div>
                <div className="meta-item">
                  <strong>University:</strong> {idea.university}
                </div>
                <div className="meta-item">
                  <strong>Audience:</strong> {idea.targetAudience}
                </div>
                <div className="meta-item">
                  <strong>Est. Attendees:</strong> {idea.estimatedAttendees}
                </div>
                <div className="meta-item">
                  <strong>Requires External:</strong> {idea.requiresApproval ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="idea-section">
                <h3>Learning Goal</h3>
                <p>{idea.goal}</p>
              </div>

              <div className="idea-section">
                <h3>Description</h3>
                <p>{idea.description}</p>
              </div>

              {idea.suggestedSpeakers && (
                <div className="idea-section">
                  <h3>Suggested Speakers</h3>
                  <p>{idea.suggestedSpeakers}</p>
                </div>
              )}

              {idea.resourcesNeeded && (
                <div className="idea-section">
                  <h3>Resources Needed</h3>
                  <p>{idea.resourcesNeeded}</p>
                </div>
              )}

              {idea.notes && (
                <div className="idea-section">
                  <h3>Additional Notes</h3>
                  <p>{idea.notes}</p>
                </div>
              )}

              {/* Drive Link Section - for Academic (editable) or others (view only) */}
              {(permissions.requiresDriveLink || permissions.viewDriveLink || idea.driveLink) && (
                <div className="idea-section drive-section">
                  <h3>
                    <Icon name="FolderOpen" size={16} color="#4285f4" style={{ marginRight: '0.5rem' }} />
                    Drive Folder
                    {permissions.requiresDriveLink && <span style={{ color: '#f44336' }}>*</span>}
                  </h3>
                  {permissions.requiresDriveLink ? (
                    <div className="drive-input-group">
                      <input
                        type="url"
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="Paste Google Drive folder link"
                      />
                      <button
                        onClick={() => onUpdateDriveLink?.(idea.id, driveLink)}
                        disabled={!driveLink || driveLink === idea.driveLink}
                      >
                        Save
                      </button>
                    </div>
                  ) : idea.driveLink ? (
                    <a
                      href={idea.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="drive-link"
                    >
                      {idea.driveLink}
                    </a>
                  ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No drive link added yet</p>
                  )}
                </div>
              )}

              {/* Warning for returned ideas */}
              {idea.returnReason && (
                <div className="idea-section warning-section">
                  <h3>Return Reason</h3>
                  <p>{idea.returnReason}</p>
                </div>
              )}

              {/* Error for rejected ideas */}
              {idea.rejectionReason && (
                <div className="idea-section error-section">
                  <h3>Rejection Reason</h3>
                  <p>{idea.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="modal-sidebar">
              <div className="sidebar-section">
                <h3>Submitted By</h3>
                <p className="submitter">{idea.submittedBy}</p>
                <p className="submit-date">{formatDate(idea.submittedAt)}</p>
              </div>

              <div className="sidebar-section">
                <h3>Time in Queue</h3>
                <p className="time-status">{timeInStatus}</p>
              </div>

              <div className="sidebar-section timeline-section">
                <h3>Status History</h3>
                <StatusTimeline statusHistory={idea.statusHistory} currentStatus={idea.currentStatus} />
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="modal-footer">
            {!action ? (
              <>
                {permissions.canApprove && (
                  <button
                    className="action-btn action-btn--approve"
                    onClick={() => setAction('approve')}
                  >
                    <Icon name="CheckCircle" size={18} />
                    Approve & Forward
                  </button>
                )}
                {permissions.canReturn && (
                  <button
                    className="action-btn action-btn--return"
                    onClick={() => setAction('return')}
                  >
                    <Icon name="Undo2" size={18} />
                    Return for Revision
                  </button>
                )}
                {permissions.canReject && (
                  <button
                    className="action-btn action-btn--reject"
                    onClick={() => setAction('reject')}
                  >
                    <Icon name="XCircle" size={18} />
                    Reject
                  </button>
                )}
              </>
            ) : (
              <div className="action-form">
                <h4>
                  {action === 'approve' && 'Approve & Forward'}
                  {action === 'return' && 'Return for Revision'}
                  {action === 'reject' && 'Reject Idea'}
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    action === 'approve'
                      ? 'Add a comment (optional)...'
                      : action === 'return'
                      ? 'Explain what needs to be revised...'
                      : 'Explain the reason for rejection...'
                  }
                  rows={3}
                />
                <div className="action-form-buttons">
                  <button className="cancel-btn" onClick={() => { setAction(null); setNotes(''); }}>
                    Cancel
                  </button>
                  <button
                    className={`confirm-btn ${action === 'approve' ? 'confirm-btn--success' : ''} ${action === 'reject' ? 'confirm-btn--danger' : ''}`}
                    onClick={action === 'approve' ? handleApprove : action === 'return' ? handleReturn : handleReject}
                    disabled={loading || (action !== 'approve' && !notes.trim())}
                  >
                    {loading ? 'Processing...' : action === 'approve' ? 'Approve' : action === 'return' ? 'Return' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IdeaDetailModal;
