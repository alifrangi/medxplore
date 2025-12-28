import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useToast } from '../../components/shared/Toast';
import Icon from '../../components/shared/Icon';
import IdeaCard from '../../components/pipeline/IdeaCard';
import IdeaViewModal from '../../components/pipeline/IdeaViewModal';
import StatusBadge from '../../components/pipeline/StatusBadge';
import { UNITS, IDEA_TYPES, getTimeInStatus } from '../../data/mockData';
import './SystemsUnit.css';

const SystemsUnit = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    currentUser,
    restoreSession,
    logoutUser,
    getIdeasForUnit,
    getPublishedEvents,
    publishIdea
  } = usePipeline();

  const [activeSection, setActiveSection] = useState('queue'); // 'queue', 'events'
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: 'workshop',
    maxParticipants: '',
    googleFormsLink: ''
  });

  const unit = UNITS.systems;
  const userUniversity = currentUser?.university;

  useEffect(() => {
    if (!currentUser) {
      const restored = restoreSession();
      if (!restored) {
        navigate('/admin');
      }
    }
  }, [currentUser, restoreSession, navigate]);

  // Access guard - redirect if user doesn't have access to systems unit
  useEffect(() => {
    if (currentUser && currentUser.units && !currentUser.units.includes('systems')) {
      navigate('/lobby');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/admin');
  };

  // Get ideas in Systems queue for this university
  const queueIdeas = getIdeasForUnit('systems', userUniversity);
  const publishedEvents = getPublishedEvents(userUniversity);

  const handlePublishIdea = (idea) => {
    setSelectedIdea(idea);
    setEventForm({
      name: idea.title,
      description: idea.description,
      date: '',
      location: '',
      category: idea.type || 'workshop',
      maxParticipants: idea.estimatedAttendees?.toString() || '',
      googleFormsLink: ''
    });
    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!eventForm.date) {
      toast.error('Please select an event date');
      return;
    }

    setLoading(true);
    try {
      await publishIdea(selectedIdea.id, {
        ...eventForm,
        date: new Date(eventForm.date),
        maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : null
      });
      toast.success('Event published successfully!');
      setShowPublishModal(false);
      setSelectedIdea(null);
    } catch (error) {
      console.error('Error publishing event:', error);
      toast.error('Failed to publish event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="systems-unit">
        <div className="unit-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="systems-unit" style={{ '--unit-color': unit.color }}>
      {/* Header */}
      <header className="unit-header">
        <div className="unit-header__left">
          <button className="back-btn" onClick={() => navigate('/lobby')}>
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
          <span className="university-badge">{userUniversity}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button
          className={`section-tab ${activeSection === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveSection('queue')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ready to Publish
          {queueIdeas.length > 0 && <span className="tab-badge">{queueIdeas.length}</span>}
        </button>
        <button
          className={`section-tab ${activeSection === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSection('events')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Events
          {publishedEvents.length > 0 && <span className="tab-badge">{publishedEvents.length}</span>}
        </button>
      </div>

      {/* Content */}
      <main className="unit-content">
        {/* Queue Section */}
        {activeSection === 'queue' && (
          <div className="queue-section">
            {queueIdeas.length > 0 ? (
              <div className="ideas-grid">
                {queueIdeas.map((idea) => (
                  <div key={idea.id} className="publish-card">
                    <IdeaCard
                      idea={idea}
                      showUnit={false}
                      onClick={() => {
                        setSelectedIdea(idea);
                        setShowViewModal(true);
                      }}
                    />
                    <div className="publish-actions">
                      <button
                        className="publish-btn"
                        onClick={() => handlePublishIdea(idea)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Publish as Event
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>No ideas ready for publishing</h3>
                <p>Ideas will appear here after they complete the approval pipeline</p>
              </div>
            )}
          </div>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <div className="events-section">
            {publishedEvents.length > 0 ? (
              <div className="events-grid">
                {publishedEvents.map((event) => {
                  const ideaType = IDEA_TYPES.find(t => t.id === event.type);
                  return (
                    <div key={event.id} className="event-card">
                      <div className="event-card__header">
                        <span className="event-id">{event.eventId || event.id}</span>
                        <StatusBadge status={event.currentStatus} size="sm" />
                      </div>
                      <h3 className="event-card__title">{event.title}</h3>
                      <div className="event-card__meta">
                        <span>{ideaType?.label || event.type}</span>
                        <span>{event.estimatedAttendees} attendees</span>
                      </div>
                      {event.eventData?.date && (
                        <p className="event-card__date">
                          {new Date(event.eventData.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      <p className="event-card__published">
                        Published {event.publishedAt ? new Date(event.publishedAt).toLocaleDateString() : 'recently'}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>No events published yet</h3>
                <p>Events will appear here after you publish them from the queue</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && selectedIdea && (
          <div className="modal-overlay" onClick={() => setShowPublishModal(false)}>
            <motion.div
              className="publish-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>Publish Event</h2>
                <button className="close-btn" onClick={() => setShowPublishModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <p className="modal-subtitle">
                  Publishing: <strong>{selectedIdea.title}</strong>
                </p>

                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    value={eventForm.name}
                    onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Event name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Venue or online"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  <div className="form-group">
                    <label>Google Forms Link</label>
                    <input
                      type="url"
                      value={eventForm.googleFormsLink}
                      onChange={(e) => setEventForm(prev => ({ ...prev, googleFormsLink: e.target.value }))}
                      placeholder="Registration form URL"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowPublishModal(false)}>
                  Cancel
                </button>
                <button
                  className="publish-confirm-btn"
                  onClick={handleConfirmPublish}
                  disabled={loading || !eventForm.date}
                >
                  {loading ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Idea View Modal */}
      <AnimatePresence>
        {showViewModal && selectedIdea && (
          <IdeaViewModal
            idea={selectedIdea}
            onClose={() => {
              setShowViewModal(false);
              setSelectedIdea(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemsUnit;
