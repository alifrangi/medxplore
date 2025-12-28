import React from 'react';
import { STATUS_CONFIG } from '../../data/mockData';
import './pipeline.css';

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: '#666',
    bgColor: '#f5f5f5'
  };

  return (
    <span
      className={`status-badge status-badge--${size}`}
      style={{
        '--badge-color': config.color,
        '--badge-bg': config.bgColor
      }}
    >
      <span className="status-badge__dot"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
