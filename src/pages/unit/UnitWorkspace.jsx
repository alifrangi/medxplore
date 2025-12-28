import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useToast } from '../../components/shared/Toast';
import Icon from '../../components/shared/Icon';
import IdeaCard from '../../components/pipeline/IdeaCard';
import StatusBadge from '../../components/pipeline/StatusBadge';
import StatusTimeline from '../../components/pipeline/StatusTimeline';
import { UNITS, PIPELINE_STAGES, IDEA_TYPES, UNIT_PERMISSIONS, getTimeInStatus, getNextStage } from '../../data/mockData';
import './UnitWorkspace.css';

const UnitWorkspace = () => {
  const { unitId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    currentUser,
    restoreSession,
    logoutUser,
    getIdeasForUnit,
    approveIdea,
    returnIdea,
    rejectIdea,
    updateDriveLink,
    getIdeaById
  } = usePipeline();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionModal, setActionModal] = useState(null); // 'return' | 'reject'
  const [actionNotes, setActionNotes] = useState('');
  const [driveLink, setDriveLink] = useState('');

  const unit = UNITS[unitId];
  const permissions = UNIT_PERMISSIONS[unitId] || {};
  const userUniversity = currentUser?.university;

  useEffect(() => {
    if (!currentUser) {
      const restored = restoreSession();
      if (!restored) {
        navigate('/admin');
      }
    }
  }, [currentUser, restoreSession, navigate]);

  // Access guard - redirect if user doesn't have access to this unit
  useEffect(() => {
    if (currentUser && currentUser.units && !currentUser.units.includes(unitId)) {
      navigate('/lobby');
    }
  }, [currentUser, unitId, navigate]);

  useEffect(() => {
    // Check for idea param in URL
    const ideaId = searchParams.get('idea');
    if (ideaId) {
      const idea = getIdeaById(ideaId);
      if (idea) {
        setSelectedIdea(idea);
        setShowModal(true);
        setDriveLink(idea.driveLink || '');
      }
    }
  }, [searchParams, getIdeaById]);

  const handleLogout = () => {
    logoutUser();
    navigate('/admin');
  };

  const handleGoToLobby = () => {
    navigate('/lobby');
  };

  // Get ideas for this unit filtered by university
  const unitIdeas = getIdeasForUnit(unitId, userUniversity);

  // Filter ideas based on tab
  const getFilteredIdeas = () => {
    switch (activeTab) {
      case 'pending':
        return unitIdeas.filter(i =>
          i.currentStatus !== PIPELINE_STAGES.REJECTED
        );
      case 'history':
        // Show all ideas that have passed through this unit
        return unitIdeas;
      default:
        return unitIdeas;
    }
  };

  const filteredIdeas = getFilteredIdeas();
  const pendingCount = unitIdeas.filter(i => i.currentStatus !== PIPELINE_STAGES.REJECTED).length;

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    setDriveLink(idea.driveLink || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIdea(null);
    setActionModal(null);
    setActionNotes('');
    // Remove idea param from URL
    navigate(`/unit/${unitId}`, { replace: true });
  };

  const handleApprove = async () => {
    if (!selectedIdea) return;

    // Check if Academic unit requires drive link
    if (permissions.requiresDriveLink && !driveLink) {
      toast.error('Please add a Drive folder link before approving');
      return;
    }

    try {
      // Save drive link if provided and different
      if (driveLink && driveLink !== selectedIdea.driveLink) {
        await updateDriveLink(selectedIdea.id, driveLink);
      }

      const nextStage = getNextStage(selectedIdea.currentStatus, selectedIdea.requiresApproval);
      const approvalNote = actionNotes.trim()
        ? `${actionNotes} — ${currentUser?.name || 'Admin'}`
        : `Approved by ${currentUser?.name || 'Admin'}`;

      await approveIdea(selectedIdea.id, approvalNote);
      toast.success(`Idea approved and forwarded to ${nextStage ? 'next stage' : 'completion'}`);
      handleCloseModal();
    } catch (error) {
      console.error('Error approving idea:', error);
      toast.error('Failed to approve idea. Please try again.');
    }
  };

  const handleReturn = async () => {
    if (!selectedIdea || !actionNotes.trim()) {
      toast.error('Please provide a reason for returning');
      return;
    }

    try {
      await returnIdea(selectedIdea.id, actionNotes);
      toast.success('Idea returned for revision');
      handleCloseModal();
    } catch (error) {
      console.error('Error returning idea:', error);
      toast.error('Failed to return idea. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!selectedIdea || !actionNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectIdea(selectedIdea.id, actionNotes);
      toast.success('Idea rejected');
      handleCloseModal();
    } catch (error) {
      console.error('Error rejecting idea:', error);
      toast.error('Failed to reject idea. Please try again.');
    }
  };

  const handleSaveDriveLink = async () => {
    if (!selectedIdea) return;
    try {
      await updateDriveLink(selectedIdea.id, driveLink);
      toast.success('Drive link saved');
    } catch (error) {
      console.error('Error saving drive link:', error);
      toast.error('Failed to save drive link. Please try again.');
    }
  };

  const tabs = [
    { id: 'pending', label: 'Queue', count: pendingCount },
    { id: 'history', label: 'History', count: 0 }
  ];

  if (!unit) {
    return (
      <div className="unit-workspace">
        <div className="unit-error">
          <h2>Unit not found</h2>
          <p>The requested unit does not exist.</p>
          <button onClick={() => navigate('/admin')}>Back to Admin</button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="unit-workspace">
        <div className="unit-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-workspace" style={{ '--unit-color': unit.color }}>
      {/* Header */}
      <header className="unit-header">
        <div className="unit-header__left">
          <button className="back-btn" onClick={handleGoToLobby}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="unit-header__title">
            <span className="unit-icon">
              <Icon name={unit.icon} size={24} />
            </span>
            <h1>{unit.name}</h1>
          </div>
        </div>
        <div className="unit-header__right">
          <span className="user-name">{currentUser.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="unit-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`unit-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="unit-content">
        {filteredIdeas.length > 0 ? (
          <div className="ideas-list">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={handleIdeaClick}
                showUnit={false}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>No items in this tab</h3>
            <p>Items will appear here when they reach this stage</p>
          </div>
        )}
      </main>

      {/* Idea Detail Modal */}
      <AnimatePresence>
        {showModal && selectedIdea && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <motion.div
              className="idea-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="modal-header__left">
                  <span className="idea-id">{selectedIdea.id}</span>
                  <StatusBadge status={selectedIdea.currentStatus} size="md" />
                </div>
                <button className="close-btn" onClick={handleCloseModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-main">
                  <h2>{selectedIdea.title}</h2>

                  <div className="idea-meta">
                    <span className="meta-item">
                      <strong>Type:</strong> {IDEA_TYPES.find(t => t.id === selectedIdea.type)?.label || selectedIdea.type}
                    </span>
                    <span className="meta-item">
                      <strong>University:</strong> {selectedIdea.university}
                    </span>
                    <span className="meta-item">
                      <strong>Audience:</strong> {selectedIdea.targetAudience}
                    </span>
                    <span className="meta-item">
                      <strong>Attendees:</strong> {selectedIdea.estimatedAttendees}
                    </span>
                  </div>

                  <div className="idea-section">
                    <h3>Learning Goal</h3>
                    <p>{selectedIdea.goal}</p>
                  </div>

                  <div className="idea-section">
                    <h3>Description</h3>
                    <p>{selectedIdea.description}</p>
                  </div>

                  {selectedIdea.suggestedSpeakers && (
                    <div className="idea-section">
                      <h3>Suggested Speakers</h3>
                      <p>{selectedIdea.suggestedSpeakers}</p>
                    </div>
                  )}

                  {selectedIdea.resourcesNeeded && (
                    <div className="idea-section">
                      <h3>Resources Needed</h3>
                      <p>{selectedIdea.resourcesNeeded}</p>
                    </div>
                  )}

                  {selectedIdea.notes && (
                    <div className="idea-section">
                      <h3>Additional Notes</h3>
                      <p>{selectedIdea.notes}</p>
                    </div>
                  )}

                  <div className="idea-section">
                    <h3>Requires Official Approvals</h3>
                    <p>{selectedIdea.requiresApproval === true ? 'Yes' : selectedIdea.requiresApproval === false ? 'No' : 'Not Sure'}</p>
                  </div>

                  {/* Drive Link - Editable for Academic, Read-only for others */}
                  {(permissions.requiresDriveLink || permissions.viewDriveLink || selectedIdea.driveLink) && (
                    <div className="idea-section drive-section">
                      <h3>
                        Google Drive Folder
                        {permissions.requiresDriveLink && <span style={{ color: '#f44336' }}> *</span>}
                      </h3>
                      {permissions.requiresDriveLink ? (
                        <>
                          <div className="drive-input-group">
                            <input
                              type="url"
                              value={driveLink}
                              onChange={(e) => setDriveLink(e.target.value)}
                              placeholder="https://drive.google.com/drive/folders/..."
                            />
                            <button onClick={handleSaveDriveLink} disabled={driveLink === selectedIdea.driveLink}>
                              Save
                            </button>
                          </div>
                          {selectedIdea.driveLink && (
                            <a href={selectedIdea.driveLink} target="_blank" rel="noopener noreferrer" className="drive-link">
                              Open in Drive
                            </a>
                          )}
                        </>
                      ) : selectedIdea.driveLink ? (
                        <a href={selectedIdea.driveLink} target="_blank" rel="noopener noreferrer" className="drive-link">
                          {selectedIdea.driveLink}
                        </a>
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No drive link added yet</p>
                      )}
                    </div>
                  )}

                  {/* Return/Reject reason display */}
                  {selectedIdea.returnReason && (
                    <div className="idea-section warning-section">
                      <h3>Return Reason</h3>
                      <p>{selectedIdea.returnReason}</p>
                    </div>
                  )}

                  {selectedIdea.rejectionReason && (
                    <div className="idea-section error-section">
                      <h3>Rejection Reason</h3>
                      <p>{selectedIdea.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="modal-sidebar">
                  <div className="sidebar-section">
                    <h3>Submitted By</h3>
                    <p className="submitter">{selectedIdea.submittedBy}</p>
                    <p className="submit-date">{new Date(selectedIdea.submittedAt).toLocaleDateString()}</p>
                  </div>

                  <div className="sidebar-section">
                    <h3>Time in Status</h3>
                    <p className="time-status">{getTimeInStatus(selectedIdea.statusHistory)}</p>
                  </div>

                  <div className="sidebar-section timeline-section">
                    <h3>Status History</h3>
                    <StatusTimeline
                      statusHistory={selectedIdea.statusHistory}
                      currentStatus={selectedIdea.currentStatus}
                    />
                  </div>
                </div>
              </div>

              {/* Actions - Show based on permissions */}
              {selectedIdea.currentUnit === unitId && selectedIdea.currentStatus !== PIPELINE_STAGES.REJECTED && (
                <div className="modal-footer">
                  {actionModal === null ? (
                    <>
                      {permissions.canApprove && (
                        <button className="action-btn action-btn--approve" onClick={() => setActionModal('approve')}>
                          <Icon name="CheckCircle" size={18} />
                          Approve & Forward
                        </button>
                      )}
                      {permissions.canReturn && (
                        <button className="action-btn action-btn--return" onClick={() => setActionModal('return')}>
                          <Icon name="Undo2" size={18} />
                          Return for Revision
                        </button>
                      )}
                      {permissions.canReject && (
                        <button className="action-btn action-btn--reject" onClick={() => setActionModal('reject')}>
                          <Icon name="XCircle" size={18} />
                          Reject
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="action-form">
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
                      <div className="action-form-buttons">
                        <button className="cancel-btn" onClick={() => { setActionModal(null); setActionNotes(''); }}>
                          Cancel
                        </button>
                        <button
                          className={`confirm-btn ${actionModal === 'approve' ? 'confirm-btn--success' : ''} ${actionModal === 'reject' ? 'confirm-btn--danger' : ''}`}
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnitWorkspace;
