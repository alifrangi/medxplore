import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '../../shared/Icon';
import StatusBadge from '../../pipeline/StatusBadge';
import StatusTimeline from '../../pipeline/StatusTimeline';
import { PIPELINE_STAGES, IDEA_TYPES, getTimeInStatus } from '../../../data/mockData';

const IdeaDetailModal = ({
  idea,
  unitId,
  permissions = {},
  currentUser,
  onClose,
  onApprove,
  onReturn,
  onReject,
  onSaveDriveLink,
  onPublish // For Systems unit
}) => {
  const [actionModal, setActionModal] = useState(null); // 'approve' | 'return' | 'reject'
  const [actionNotes, setActionNotes] = useState('');
  const [driveLink, setDriveLink] = useState(idea?.driveLink || '');

  const handleApprove = () => {
    // Check if drive link is required but not provided
    if (permissions.requiresDriveLink && !driveLink.trim()) {
      return; // Don't proceed - button should be disabled anyway
    }

    const approvalNote = actionNotes.trim()
      ? `${actionNotes} — ${currentUser?.name || 'Admin'}`
      : `Approved by ${currentUser?.name || 'Admin'}`;

    onApprove(idea.id, approvalNote, permissions.requiresDriveLink ? driveLink : null);
  };

  // Check if approval should be disabled due to missing drive link
  const isApproveDisabled = permissions.requiresDriveLink && !driveLink.trim();

  const handleReturn = () => {
    if (!actionNotes.trim()) return;
    onReturn(idea.id, actionNotes);
  };

  const handleReject = () => {
    if (!actionNotes.trim()) return;
    onReject(idea.id, actionNotes);
  };

  const handleSaveDriveLink = () => {
    if (driveLink !== idea.driveLink) {
      onSaveDriveLink(idea.id, driveLink);
    }
  };

  const canTakeAction = idea.currentUnit === unitId && idea.currentStatus !== PIPELINE_STAGES.REJECTED;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="idea-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="idea-modal__header">
          <div className="idea-modal__header-left">
            <span className="idea-modal__id">{idea.id}</span>
            <StatusBadge status={idea.currentStatus} size="md" />
          </div>
          <button className="idea-modal__close" onClick={onClose} aria-label="Close modal">
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="idea-modal__body">
          <div className="idea-modal__main">
            <h2 className="idea-modal__title">{idea.title}</h2>

            <div className="idea-modal__meta">
              <span className="idea-modal__meta-item">
                <strong>Type:</strong> {IDEA_TYPES.find(t => t.id === idea.type)?.label || idea.type}
              </span>
              <span className="idea-modal__meta-item">
                <strong>University:</strong> {idea.university}
              </span>
              <span className="idea-modal__meta-item">
                <strong>Audience:</strong> {idea.targetAudience}
              </span>
              <span className="idea-modal__meta-item">
                <strong>Attendees:</strong> {idea.estimatedAttendees}
              </span>
            </div>

            <div className="idea-modal__section">
              <h3>Learning Goal</h3>
              <p>{idea.goal}</p>
            </div>

            <div className="idea-modal__section">
              <h3>Description</h3>
              <p>{idea.description}</p>
            </div>

            {idea.suggestedSpeakers && (
              <div className="idea-modal__section">
                <h3>Suggested Speakers</h3>
                <p>{idea.suggestedSpeakers}</p>
              </div>
            )}

            {idea.resourcesNeeded && (
              <div className="idea-modal__section">
                <h3>Resources Needed</h3>
                <p>{idea.resourcesNeeded}</p>
              </div>
            )}

            {idea.notes && (
              <div className="idea-modal__section">
                <h3>Additional Notes</h3>
                <p>{idea.notes}</p>
              </div>
            )}

            <div className="idea-modal__section">
              <h3>Requires Official Approvals</h3>
              <p>{idea.requiresApproval === true ? 'Yes' : idea.requiresApproval === false ? 'No' : 'Not Sure'}</p>
            </div>

            {/* Drive Link Section */}
            {(permissions.requiresDriveLink || permissions.viewDriveLink || idea.driveLink) && (
              <div className="idea-modal__section idea-modal__section--drive">
                <h3>
                  Google Drive Folder
                  {permissions.requiresDriveLink && <span className="required-marker"> *</span>}
                </h3>
                {permissions.requiresDriveLink ? (
                  <div className="drive-input-group">
                    <input
                      type="url"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                    />
                    <button
                      onClick={handleSaveDriveLink}
                      disabled={driveLink === idea.driveLink}
                      className="btn btn-secondary btn-sm"
                    >
                      Save
                    </button>
                  </div>
                ) : idea.driveLink ? (
                  <a href={idea.driveLink} target="_blank" rel="noopener noreferrer" className="drive-link">
                    <Icon name="ExternalLink" size={14} />
                    Open in Drive
                  </a>
                ) : (
                  <p className="text-muted">No drive link added yet</p>
                )}
              </div>
            )}

            {/* Return/Reject reason display */}
            {idea.returnReason && (
              <div className="idea-modal__section idea-modal__section--warning">
                <h3>Return Reason</h3>
                <p>{idea.returnReason}</p>
              </div>
            )}

            {idea.rejectionReason && (
              <div className="idea-modal__section idea-modal__section--error">
                <h3>Rejection Reason</h3>
                <p>{idea.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="idea-modal__sidebar">
            <div className="idea-modal__sidebar-section">
              <h3>Submitted By</h3>
              <p className="idea-modal__submitter">{idea.submittedBy}</p>
              <p className="idea-modal__date">
                {idea.submittedAt instanceof Date
                  ? idea.submittedAt.toLocaleDateString()
                  : new Date(idea.submittedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="idea-modal__sidebar-section">
              <h3>Time in Status</h3>
              <p className="idea-modal__time">{getTimeInStatus(idea.statusHistory)}</p>
            </div>

            <div className="idea-modal__sidebar-section">
              <h3>Status History</h3>
              <StatusTimeline
                statusHistory={idea.statusHistory}
                currentStatus={idea.currentStatus}
              />
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        {canTakeAction && (
          <div className="idea-modal__footer">
            {actionModal === null ? (
              <div className="idea-modal__actions">
                {permissions.canApprove && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setActionModal('approve')}
                    disabled={isApproveDisabled}
                    title={isApproveDisabled ? 'Please add a Google Drive folder link before approving' : ''}
                  >
                    <Icon name="CheckCircle" size={18} />
                    {isApproveDisabled ? 'Add Drive Link to Approve' : 'Approve & Forward'}
                  </button>
                )}
                {permissions.canReturn && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setActionModal('return')}
                  >
                    <Icon name="Undo2" size={18} />
                    Return for Revision
                  </button>
                )}
                {permissions.canReject && (
                  <button
                    className="btn btn-danger"
                    onClick={() => setActionModal('reject')}
                  >
                    <Icon name="XCircle" size={18} />
                    Reject
                  </button>
                )}
              </div>
            ) : (
              <div className="idea-modal__action-form">
                <h4>
                  {actionModal === 'approve' && 'Approve & Forward'}
                  {actionModal === 'return' && 'Return Reason'}
                  {actionModal === 'reject' && 'Rejection Reason'}
                </h4>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionModal === 'approve'
                      ? 'Add a comment (optional)...'
                      : actionModal === 'return'
                      ? 'Explain what needs to be revised...'
                      : 'Provide the reason for rejection...'
                  }
                  rows={3}
                />
                <div className="idea-modal__action-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setActionModal(null); setActionNotes(''); }}
                  >
                    Cancel
                  </button>
                  <button
                    className={`btn ${actionModal === 'approve' ? 'btn-primary' : actionModal === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={actionModal === 'approve' ? handleApprove : actionModal === 'return' ? handleReturn : handleReject}
                    disabled={actionModal !== 'approve' && !actionNotes.trim()}
                  >
                    {actionModal === 'approve' ? 'Approve' : actionModal === 'return' ? 'Return Idea' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default IdeaDetailModal;
