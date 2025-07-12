import React from 'react';
import { TIER_DEFINITIONS } from '../services/database';

const TierProgressBar = ({ currentTier, totalEvents }) => {
  // Get current tier info
  const currentTierInfo = TIER_DEFINITIONS[currentTier];
  
  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    switch (currentTier) {
      case 'Explorer':
        return {
          current: totalEvents,
          min: 0,
          max: 5,
          nextTier: 'Scholar',
          nextTierColor: TIER_DEFINITIONS.Scholar.color,
          currentColor: currentTierInfo.color
        };
      case 'Scholar':
        return {
          current: totalEvents,
          min: 5,
          max: 20,
          nextTier: 'Mentor',
          nextTierColor: TIER_DEFINITIONS.Mentor.color,
          currentColor: currentTierInfo.color
        };
      case 'Mentor':
        return {
          current: totalEvents,
          min: 20,
          max: 30,
          nextTier: 'Pioneer',
          nextTierColor: TIER_DEFINITIONS.Pioneer.color,
          currentColor: currentTierInfo.color
        };
      case 'Pioneer':
        return null; // No next tier for Pioneer
      default:
        return null;
    }
  };

  const progressInfo = getProgressToNextTier();

  // Don't show progress bar for Pioneer tier
  if (!progressInfo || currentTier === 'Pioneer') {
    return null; // Don't show anything for Pioneer tier
  }

  const { current, min, max, nextTier, nextTierColor, currentColor } = progressInfo;
  
  // Calculate progress within the current tier range
  const tierRange = max - min;
  const currentProgress = Math.max(0, current - min);
  const progressPercentage = Math.min((currentProgress / tierRange) * 100, 100);
  const eventsNeeded = Math.max(0, max - current);

  return (
    <div className="tier-progress-card">
      {/* Progress Header */}
      <div className="progress-header">
        <div className="current-tier-info">
          <span className="material-icons-outlined tier-icon" style={{ color: currentColor }}>
            {currentTierInfo.icon}
          </span>
          <div className="tier-details">
            <span className="tier-name">{currentTier}</span>
            <span className="events-count">{current} events</span>
          </div>
        </div>
        
        <div className="next-tier-info">
          <span className="next-label">Next:</span>
          <div className="next-tier-details">
            <span className="material-icons-outlined next-tier-icon" style={{ color: nextTierColor }}>
              {TIER_DEFINITIONS[nextTier].icon}
            </span>
            <span className="next-tier-name">{nextTier}</span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="progress-section">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{
              width: `${progressPercentage}%`,
              background: `linear-gradient(90deg, ${currentColor} 0%, ${nextTierColor} 100%)`,
            }}
          >
            <div className="progress-glow"></div>
          </div>
        </div>
        
        <div className="progress-markers">
          <span className="start-marker">{min}</span>
          <span className="end-marker">{max}</span>
        </div>
      </div>

      {/* Progress Info */}
      <div className="progress-info">
        {eventsNeeded > 0 ? (
          <span className="events-needed">
            <strong style={{ color: nextTierColor }}>{eventsNeeded}</strong> more event{eventsNeeded !== 1 ? 's' : ''} to reach <strong>{nextTier}</strong>
          </span>
        ) : (
          <span className="ready-message" style={{ color: nextTierColor }}>
            Ready to advance to <strong>{nextTier}</strong>!
          </span>
        )}
      </div>
    </div>
  );
};

export default TierProgressBar;