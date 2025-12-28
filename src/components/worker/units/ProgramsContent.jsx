import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../shared/Toast';
import Icon from '../../shared/Icon';
import IdeaCard from '../../pipeline/IdeaCard';
import IdeaDetailModal from './IdeaDetailModal';
import { PIPELINE_STAGES, UNIT_PERMISSIONS } from '../../../data/mockData';
import './UnitContent.css';

const ProgramsContent = ({
  ideas = [],
  allIdeas = [],
  allUnits = {},
  unit,
  university,
  currentUser,
  onApprove,
  onReturn,
  onReject,
  onUpdateDriveLink,
  loading = false
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const permissions = UNIT_PERMISSIONS.programs;

  const getFilteredIdeas = () => {
    switch (activeTab) {
      case 'pending':
        return ideas.filter(i => i.currentStatus !== PIPELINE_STAGES.REJECTED);
      case 'lobby':
        return allIdeas.filter(i => i.currentStatus !== PIPELINE_STAGES.REJECTED);
      default:
        return ideas;
    }
  };

  const filteredIdeas = getFilteredIdeas();
  const pendingCount = ideas.filter(i => i.currentStatus !== PIPELINE_STAGES.REJECTED).length;
  const lobbyCount = allIdeas.filter(i => i.currentStatus !== PIPELINE_STAGES.REJECTED).length;

  const handleIdeaClick = (idea) => {
    setSelectedIdea(idea);
    const viewOnly = idea.currentUnit !== 'programs';
    setIsViewOnly(viewOnly);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedIdea(null);
  };

  const handleApprove = async (ideaId, notes) => {
    try {
      await onApprove(ideaId, notes);
      toast.success('Idea approved and forwarded to Operations');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to approve idea. Please try again.');
    }
  };

  const handleReturn = async (ideaId, reason) => {
    try {
      await onReturn(ideaId, reason);
      toast.success('Idea returned to Academic Unit');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to return idea. Please try again.');
    }
  };

  const handleReject = async (ideaId, reason) => {
    try {
      await onReject(ideaId, reason);
      toast.success('Idea rejected');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to reject idea. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="unit-content-loading">
        <div className="loading-spinner"></div>
        <p>Loading ideas...</p>
      </div>
    );
  }

  return (
    <div className="unit-content" style={{ '--unit-color': unit?.color }}>
      <div className="unit-content__header">
        <div className="unit-content__title">
          <span className="unit-content__icon">
            <Icon name={unit?.icon || 'ClipboardList'} size={28} />
          </span>
          <div>
            <h1>{unit?.name || 'Programs Unit'}</h1>
            <p className="unit-content__subtitle">{unit?.description}</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Icon name="Inbox" size={18} />
          Queue
          {pendingCount > 0 && <span className="tab__badge">{pendingCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'lobby' ? 'active' : ''}`}
          onClick={() => setActiveTab('lobby')}
        >
          <Icon name="LayoutGrid" size={18} />
          Lobby
          {lobbyCount > 0 && <span className="tab__badge">{lobbyCount}</span>}
        </button>
      </div>

      {filteredIdeas.length > 0 ? (
        <div className="ideas-grid">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onClick={() => handleIdeaClick(idea)}
              showUnit={false}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="Inbox" size={64} />
          <h3 className="empty-state__title">
            {activeTab === 'pending' ? 'No ideas in queue' : 'No ideas in lobby'}
          </h3>
          <p className="empty-state__description">
            {activeTab === 'pending'
              ? 'Ideas approved by Academic will appear here'
              : 'All ideas across the pipeline will appear here'}
          </p>
        </div>
      )}

      <AnimatePresence>
        {showModal && selectedIdea && (
          <IdeaDetailModal
            idea={selectedIdea}
            unitId="programs"
            permissions={permissions}
            currentUser={currentUser}
            onClose={handleCloseModal}
            onApprove={handleApprove}
            onReturn={handleReturn}
            onReject={handleReject}
            onSaveDriveLink={onUpdateDriveLink}
            viewOnly={isViewOnly}
            allUnits={allUnits}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgramsContent;
