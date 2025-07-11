import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getStudentEvents, TIER_DEFINITIONS } from '../services/database';
import './PassportDashboard.css';

const PassportDashboard = () => {
  const navigate = useNavigate();
  const { studentData, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadStudentEvents();
  }, [studentData]);

  const loadStudentEvents = async () => {
    if (studentData?.passportNumber) {
      const studentEvents = await getStudentEvents(studentData.passportNumber);
      setEvents(studentEvents);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/passport');
  };

  const getTierProgress = () => {
    const currentTier = studentData?.tier || 'Bronze';
    const totalEvents = studentData?.totalEvents || 0;
    const tierDef = TIER_DEFINITIONS[currentTier];
    
    let nextTier = null;
    let eventsToNext = 0;
    
    if (currentTier === 'Bronze' && totalEvents < 5) {
      nextTier = 'Silver';
      eventsToNext = 5 - totalEvents;
    } else if (currentTier === 'Silver' && totalEvents < 10) {
      nextTier = 'Gold';
      eventsToNext = 10 - totalEvents;
    } else if (currentTier === 'Gold' && totalEvents < 20) {
      nextTier = 'Platinum';
      eventsToNext = 20 - totalEvents;
    }
    
    return { currentTier, nextTier, eventsToNext, totalEvents };
  };

  const filteredEvents = filterCategory === 'all' 
    ? events 
    : events.filter(e => e.event?.category === filterCategory);

  const { currentTier, nextTier, eventsToNext, totalEvents } = getTierProgress();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="passport-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {studentData?.fullName}</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <motion.div 
          className="passport-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="passport-card">
            <div className="passport-header-section">
              <h2>MedXperience Passport</h2>
              <div className="passport-number">{studentData?.passportNumber}</div>
            </div>

            <div className="passport-info">
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{studentData?.fullName}</p>
                </div>
                <div className="info-item">
                  <label>University</label>
                  <p>{studentData?.university}</p>
                </div>
                <div className="info-item">
                  <label>Program</label>
                  <p>{studentData?.program}</p>
                </div>
                <div className="info-item">
                  <label>Year of Study</label>
                  <p>Year {studentData?.yearOfStudy}</p>
                </div>
              </div>
            </div>

            <div className="tier-section">
              <div 
                className="current-tier"
                style={{ backgroundColor: TIER_DEFINITIONS[currentTier]?.color }}
              >
                <span className="tier-label">Current Tier</span>
                <span className="tier-name">{currentTier}</span>
              </div>
              
              {nextTier && (
                <div className="tier-progress">
                  <p className="progress-text">
                    {eventsToNext} more event{eventsToNext !== 1 ? 's' : ''} to reach {nextTier}
                  </p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${((totalEvents - (TIER_DEFINITIONS[currentTier]?.min || 0)) / 
                                  ((TIER_DEFINITIONS[nextTier]?.min || 5) - (TIER_DEFINITIONS[currentTier]?.min || 0))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="tier-benefits">
              <h4>Your Benefits:</h4>
              <ul>
                {TIER_DEFINITIONS[currentTier]?.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="events-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="section-header">
            <h2>Event Participation</h2>
            <div className="event-stats">
              <span className="stat-item">Total Events: {totalEvents}</span>
            </div>
          </div>

          <div className="filter-buttons">
            <button 
              className={filterCategory === 'all' ? 'active' : ''}
              onClick={() => setFilterCategory('all')}
            >
              All Events
            </button>
            <button 
              className={filterCategory === 'workshop' ? 'active' : ''}
              onClick={() => setFilterCategory('workshop')}
            >
              Workshops
            </button>
            <button 
              className={filterCategory === 'conference' ? 'active' : ''}
              onClick={() => setFilterCategory('conference')}
            >
              Conferences
            </button>
            <button 
              className={filterCategory === 'seminar' ? 'active' : ''}
              onClick={() => setFilterCategory('seminar')}
            >
              Seminars
            </button>
          </div>

          <div className="events-grid">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((participation) => (
                <motion.div 
                  key={participation.id}
                  className="event-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="event-header">
                    <h3>{participation.event?.name || 'Event'}</h3>
                    <span className="event-date">
                      {participation.event?.date ? new Date(participation.event.date).toLocaleDateString() : 'Date TBD'}
                    </span>
                  </div>
                  
                  <div className="event-details">
                    <p className="event-location">{participation.event?.location || 'Location TBD'}</p>
                    <p className="event-description">{participation.event?.description || 'No description available'}</p>
                  </div>
                  
                  <div className="event-footer">
                    <span className="participation-type">{participation.participationType}</span>
                    {participation.certificateUrl && (
                      <a 
                        href={participation.certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="certificate-link"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-events">
                <p>No events attended yet. Start your medical journey by attending MedXplore events!</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="export-section">
          <h3>Export Options</h3>
          <div className="export-buttons">
            <button className="export-button" disabled>
              Generate PDF (Coming Soon)
            </button>
            <button className="export-button" disabled>
              Share Link (Coming Soon)
            </button>
            <button className="export-button" disabled>
              QR Code (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportDashboard;