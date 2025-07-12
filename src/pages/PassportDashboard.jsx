import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getStudentEvents, TIER_DEFINITIONS } from '../services/database';
import TierProgressBar from '../components/TierProgressBar';
import './PassportDashboard.css';

const PassportDashboard = () => {
  const navigate = useNavigate();
  const { studentData, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    loadStudentEvents();
  }, [studentData]);

  // Vanta.js initialization for Pioneer tier
  useEffect(() => {
    const currentTier = studentData?.tier || 'Explorer';
    
    // Clean up any existing effect
    if (vantaEffect) {
      vantaEffect.destroy();
      setVantaEffect(null);
    }
    
    // Initialize Vanta for Pioneer tier
    if (currentTier === 'Pioneer' && window.VANTA && window.VANTA.WAVES && vantaRef.current) {
      setTimeout(() => {
        try {
          const effect = window.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1a1a1a,
            shininess: 50.00,
            waveHeight: 20.00,
            waveSpeed: 0.50,
            zoom: 0.85
          });
          setVantaEffect(effect);
          // Vanta effect initialized successfully
        } catch (error) {
          // Error initializing Vanta effect
        }
      }, 100); // Small delay to ensure DOM is ready
    }
    
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [studentData?.tier]); // Remove vantaEffect from dependencies to avoid loops

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
    const currentTier = studentData?.tier || 'Explorer';
    const totalEvents = studentData?.totalEvents || 0;
    const tierDef = TIER_DEFINITIONS[currentTier];
    
    let nextTier = null;
    let eventsToNext = 0;
    
    if (currentTier === 'Explorer' && totalEvents < 5) {
      nextTier = 'Scholar';
      eventsToNext = 5 - totalEvents;
    } else if (currentTier === 'Scholar' && totalEvents < 20) {
      nextTier = 'Mentor';
      eventsToNext = 20 - totalEvents;
    } else if (currentTier === 'Mentor' && totalEvents < 30) {
      nextTier = 'Pioneer';
      eventsToNext = 30 - totalEvents;
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
    <div className={`passport-dashboard theme-${currentTier.toLowerCase()}`}>
      {currentTier === 'Pioneer' && (
        <div ref={vantaRef} className="vanta-background" style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
        }} />
      )}
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
              <div className="tier-header">
                <h3>Tier Status</h3>
                <span className="event-count">{totalEvents} Events Completed</span>
              </div>
              
              <div className="tier-timeline">
                {Object.entries(TIER_DEFINITIONS).map(([tierName, tierDef], index) => (
                  <div 
                    key={tierName} 
                    className={`timeline-item ${tierName === currentTier ? 'active' : ''} ${totalEvents >= tierDef.min ? 'completed' : ''}`}
                  >
                    <div 
                      className="timeline-icon"
                      style={{ 
                        backgroundColor: totalEvents >= tierDef.min ? tierDef.color : '#e0e0e0',
                        color: totalEvents >= tierDef.min ? 'white' : '#999'
                      }}
                    >
                      <span className="material-icons-outlined">
                        {tierDef.icon}
                      </span>
                    </div>
                    <span className="timeline-label">{tierName}</span>
                    {index < Object.keys(TIER_DEFINITIONS).length - 1 && (
                      <div className={`timeline-connector ${totalEvents >= TIER_DEFINITIONS[Object.keys(TIER_DEFINITIONS)[index + 1]].min ? 'completed' : ''}`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="current-tier">
                <div className="tier-icon-wrapper">
                  <span className="material-icons-outlined tier-icon">
                    {TIER_DEFINITIONS[currentTier]?.icon}
                  </span>
                </div>
                <div className="tier-info">
                  <span className="tier-label">Current Tier</span>
                  <span className="tier-name">{currentTier}</span>
                </div>
              </div>
              
              <p className="tier-description">{TIER_DEFINITIONS[currentTier]?.description}</p>
              
              {/* Enhanced Tier Progress Bar */}
              <div className="tier-progress-container">
                <TierProgressBar 
                  currentTier={currentTier} 
                  totalEvents={totalEvents} 
                />
              </div>
            </div>

            <div className="tier-benefits">
              <h4>Your Current Benefits:</h4>
              <ul>
                {TIER_DEFINITIONS[currentTier]?.benefits && TIER_DEFINITIONS[currentTier].benefits.length > 0 ? (
                  TIER_DEFINITIONS[currentTier].benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))
                ) : (
                  <li>No benefits data available</li>
                )}
              </ul>
              
              {nextTier && (
                <div className="next-tier-preview">
                  <h5>Unlock at {nextTier} Tier:</h5>
                  <ul className="preview-benefits">
                    {TIER_DEFINITIONS[nextTier]?.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                    {TIER_DEFINITIONS[nextTier]?.benefits.length > 2 && (
                      <li className="more-benefits">...and {TIER_DEFINITIONS[nextTier]?.benefits.length - 2} more benefits!</li>
                    )}
                  </ul>
                </div>
              )}
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
                      {(() => {
                        const date = participation.event?.date;
                        if (!date) return 'Date TBD';
                        
                        try {
                          let dateObj;
                          if (date.toDate && typeof date.toDate === 'function') {
                            dateObj = date.toDate();
                          } else if (date.seconds) {
                            dateObj = new Date(date.seconds * 1000);
                          } else if (typeof date === 'string' || typeof date === 'number') {
                            dateObj = new Date(date);
                          } else {
                            return 'Date TBD';
                          }
                          
                          if (isNaN(dateObj.getTime())) {
                            return 'Date TBD';
                          }
                          
                          return dateObj.toLocaleDateString();
                        } catch (error) {
                          return 'Date TBD';
                        }
                      })()}
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