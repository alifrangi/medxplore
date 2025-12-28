import React from 'react';
import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import Icon from '../shared/Icon';
import { UNITS, IDEA_TYPES, getTimeInStatus } from '../../data/mockData';
import './pipeline.css';

const IdeaCard = ({ idea, onClick, showUnit = true }) => {
  const unit = idea.currentUnit ? UNITS[idea.currentUnit] : null;
  const ideaType = IDEA_TYPES.find(t => t.id === idea.type);
  const timeInStatus = getTimeInStatus(idea.statusHistory);

  return (
    <motion.div
      className="idea-card"
      onClick={() => onClick && onClick(idea)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      <div className="idea-card__header">
        <div className="idea-card__id">{idea.id}</div>
        <StatusBadge status={idea.currentStatus} size="sm" />
      </div>

      <h3 className="idea-card__title">{idea.title}</h3>

      <div className="idea-card__meta">
        <span className="idea-card__type">
          {ideaType?.label || idea.type}
        </span>
        <span className="idea-card__university">{idea.university}</span>
      </div>

      <div className="idea-card__info">
        <div className="idea-card__info-item">
          <span className="label">Submitted by</span>
          <span className="value">{idea.submittedBy}</span>
        </div>
        <div className="idea-card__info-item">
          <span className="label">Attendees</span>
          <span className="value">{idea.estimatedAttendees}</span>
        </div>
      </div>

      <div className="idea-card__footer">
        {showUnit && unit && (
          <div className="idea-card__unit" style={{ color: unit.color }}>
            <Icon name={unit.icon} size={14} /> {unit.name}
          </div>
        )}

        <div className="idea-card__time">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {timeInStatus}
        </div>

        {idea.driveLink && (
          <div className="idea-card__drive">
            <Icon name="FolderOpen" size={14} color="#4285f4" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default IdeaCard;
