import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdeaCard from './IdeaCard';
import IdeaDetailModal from './IdeaDetailModal';
import { usePipeline } from '../../contexts/PipelineContext';
import { UNITS } from '../../data/mockData';
import './pipeline.css';

const IdeaQueue = ({ unitId, university }) => {
  const {
    getIdeasForUnit,
    approveIdea,
    returnIdea,
    rejectIdea,
    updateDriveLink
  } = usePipeline();

  const [selectedIdea, setSelectedIdea] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('oldest'); // oldest, newest, title

  const unit = UNITS[unitId];

  // Get ideas for this unit and university
  const ideas = getIdeasForUnit(unitId, university);

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter(idea => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        idea.title.toLowerCase().includes(search) ||
        idea.id.toLowerCase().includes(search) ||
        idea.submittedBy.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'oldest':
        default:
          return new Date(a.submittedAt) - new Date(b.submittedAt);
      }
    });

  const handleApprove = async (ideaId, notes) => {
    approveIdea(ideaId, notes);
  };

  const handleReturn = async (ideaId, reason) => {
    returnIdea(ideaId, reason);
  };

  const handleReject = async (ideaId, reason) => {
    rejectIdea(ideaId, reason);
  };

  const handleUpdateDriveLink = (ideaId, link) => {
    updateDriveLink(ideaId, link);
  };

  return (
    <div className="idea-queue">
      {/* Queue Header */}
      <div className="queue-header">
        <div className="queue-stats">
          <span className="queue-count">{filteredIdeas.length}</span>
          <span className="queue-label">
            {filteredIdeas.length === 1 ? 'idea' : 'ideas'} in queue
          </span>
        </div>

        <div className="queue-controls">
          {/* Search */}
          <div className="queue-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ideas..."
            />
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="oldest">Oldest First</option>
            <option value="newest">Newest First</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <motion.div className="ideas-list" layout>
          <AnimatePresence>
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => setSelectedIdea(idea)}
                showUnit={false}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3>No ideas in queue</h3>
          <p>
            {searchTerm
              ? 'No ideas match your search criteria'
              : `There are currently no ideas waiting for ${unit?.name || 'this unit'}`
            }
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          unitId={unitId}
          onClose={() => setSelectedIdea(null)}
          onApprove={handleApprove}
          onReturn={handleReturn}
          onReject={handleReject}
          onUpdateDriveLink={handleUpdateDriveLink}
        />
      )}
    </div>
  );
};

export default IdeaQueue;
