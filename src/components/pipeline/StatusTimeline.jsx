import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../shared/Icon';
import { STATUS_CONFIG, UNITS } from '../../data/mockData';
import './pipeline.css';

const StatusTimeline = ({ statusHistory, currentStatus }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Guard against undefined or empty history
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="status-timeline">
        <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>
          No status history available
        </p>
      </div>
    );
  }

  return (
    <div className="status-timeline">
      {statusHistory.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || { label: entry.status, color: '#666' };
        const unit = entry.unit ? UNITS[entry.unit] : null;
        const isCurrent = index === statusHistory.length - 1;

        return (
          <motion.div
            key={index}
            className={`timeline-item ${isCurrent ? 'timeline-item--current' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="timeline-marker">
              <div
                className="timeline-dot"
                style={{ backgroundColor: config.color }}
              />
              {index < statusHistory.length - 1 && (
                <div className="timeline-line" />
              )}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span
                  className="timeline-status"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <span className="timeline-date">{formatDate(entry.timestamp)}</span>
              </div>

              <div className="timeline-meta">
                {unit && (
                  <span className="timeline-unit" style={{ color: unit.color }}>
                    <Icon name={unit.icon} size={12} /> {unit.name}
                  </span>
                )}
                {entry.actor && (
                  <span className="timeline-actor">by {entry.actor}</span>
                )}
              </div>

              {entry.notes && (
                <p className="timeline-notes">{entry.notes}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
