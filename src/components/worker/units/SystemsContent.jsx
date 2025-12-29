import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../shared/Toast';
import Icon from '../../shared/Icon';
import IdeaCard from '../../pipeline/IdeaCard';
import IdeaViewModal from '../../pipeline/IdeaViewModal';
import StatusBadge from '../../pipeline/StatusBadge';
import DepartmentWorkerManager from '../../DepartmentWorkerManager';
import { PIPELINE_STAGES, IDEA_TYPES } from '../../../data/mockData';
import { deleteEvent, deleteIdea } from '../../../services/database';
import './UnitContent.css';

const SystemsContent = ({
  ideas = [],
  allIdeas = [],
  allUnits = {},
  unit,
  university,
  currentUser,
  onPublish,
  loading = false
}) => {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState('queue');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: 'workshop',
    maxParticipants: '',
    googleFormsLink: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Filter ideas ready for publishing (in systems stage, not rejected/published)
  const queueIdeas = ideas.filter(idea =>
    idea.currentStatus !== PIPELINE_STAGES.REJECTED &&
    idea.currentStatus !== PIPELINE_STAGES.PUBLISHED
  );

  // Get published events from allIdeas (since published ideas have currentUnit = null)
  const publishedEvents = allIdeas.filter(idea =>
    idea.currentStatus === PIPELINE_STAGES.PUBLISHED
  );

  // Get all ideas for lobby (including rejected)
  const lobbyIdeas = allIdeas;

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

  const handleViewIdea = (idea) => {
    setSelectedIdea(idea);
    const viewOnly = idea.currentUnit !== 'systems';
    setIsViewOnly(viewOnly);
    setShowViewModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!eventForm.date) {
      toast.error('Please select an event date');
      return;
    }

    setPublishLoading(true);
    try {
      await onPublish(selectedIdea.id, {
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
      setPublishLoading(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    setDeleteLoading(true);
    try {
      // Delete the event from events collection
      if (event.eventId) {
        await deleteEvent(event.eventId);
      }
      // Delete the idea
      await deleteIdea(event.id);
      toast.success('Event deleted successfully');
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="unit-content-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="unit-content" style={{ '--unit-color': unit?.color }}>
      {/* Header */}
      <div className="unit-content__header">
        <div className="unit-content__title">
          <span className="unit-content__icon">
            <Icon name={unit?.icon || 'Monitor'} size={28} />
          </span>
          <div>
            <h1>{unit?.name || 'Systems Unit'}</h1>
            <p className="unit-content__subtitle">{unit?.description}</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeSection === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveSection('queue')}
        >
          <Icon name="FileText" size={18} />
          Ready to Publish
          {queueIdeas.length > 0 && <span className="tab__badge">{queueIdeas.length}</span>}
        </button>
        <button
          className={`tab ${activeSection === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSection('events')}
        >
          <Icon name="Calendar" size={18} />
          Published Events
          {publishedEvents.length > 0 && <span className="tab__badge">{publishedEvents.length}</span>}
        </button>
        <button
          className={`tab ${activeSection === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveSection('workers')}
        >
          <Icon name="Users" size={18} />
          Workers
        </button>
        <button
          className={`tab ${activeSection === 'lobby' ? 'active' : ''}`}
          onClick={() => setActiveSection('lobby')}
        >
          <Icon name="LayoutGrid" size={18} />
          Lobby
          {lobbyIdeas.length > 0 && <span className="tab__badge">{lobbyIdeas.length}</span>}
        </button>
      </div>

      {/* Content */}
      {activeSection === 'queue' && (
        <div className="queue-section">
          {queueIdeas.length > 0 ? (
            <div className="ideas-grid">
              {queueIdeas.map((idea) => (
                <div key={idea.id} className="publish-card">
                  <IdeaCard
                    idea={idea}
                    showUnit={false}
                    onClick={() => handleViewIdea(idea)}
                  />
                  <div className="publish-actions">
                    <button
                      className="publish-btn"
                      onClick={() => handlePublishIdea(idea)}
                    >
                      <Icon name="Check" size={16} />
                      Publish as Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="FileText" size={64} />
              <h3 className="empty-state__title">No ideas ready for publishing</h3>
              <p className="empty-state__description">
                Ideas will appear here after they complete the approval pipeline
              </p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'events' && (
        <div className="events-section">
          {publishedEvents.length > 0 ? (
            <div className="ideas-grid">
              {publishedEvents.map((event) => {
                const ideaType = IDEA_TYPES.find(t => t.id === event.type);
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card__header">
                      <span className="event-card__id">{event.eventId || event.id}</span>
                      <StatusBadge status={event.currentStatus} size="sm" />
                    </div>
                    <h3 className="event-card__title">{event.title}</h3>
                    <div className="event-card__meta">
                      <span>{ideaType?.label || event.type}</span>
                      <span>{event.estimatedAttendees} attendees</span>
                    </div>
                    {event.eventData?.date && (
                      <p className="event-card__date">
                        {(() => {
                          try {
                            const date = event.eventData.date;
                            // Handle Firestore Timestamp
                            const dateObj = date?.toDate ? date.toDate() :
                                           date?.seconds ? new Date(date.seconds * 1000) :
                                           new Date(date);
                            return dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            });
                          } catch {
                            return 'Date TBD';
                          }
                        })()}
                      </p>
                    )}
                    <p className="event-card__published">
                      Published {event.publishedAt
                        ? (() => {
                            try {
                              const date = event.publishedAt;
                              const dateObj = date?.toDate ? date.toDate() :
                                             date?.seconds ? new Date(date.seconds * 1000) :
                                             new Date(date);
                              return dateObj.toLocaleDateString();
                            } catch {
                              return 'recently';
                            }
                          })()
                        : 'recently'}
                    </p>
                    <div className="event-card__actions">
                      <button
                        className="delete-event-btn"
                        onClick={() => setShowDeleteConfirm(event)}
                        disabled={deleteLoading}
                      >
                        <Icon name="Trash2" size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="Calendar" size={64} />
              <h3 className="empty-state__title">No events published yet</h3>
              <p className="empty-state__description">
                Events will appear here after you publish them from the queue
              </p>
            </div>
          )}
        </div>
      )}

      {activeSection === 'workers' && (
        <div className="workers-section">
          <DepartmentWorkerManager university={university} />
        </div>
      )}

      {activeSection === 'lobby' && (
        <div className="lobby-section">
          {lobbyIdeas.length > 0 ? (
            <div className="ideas-grid">
              {lobbyIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => handleViewIdea(idea)}
                  showUnit={true}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="LayoutGrid" size={64} />
              <h3 className="empty-state__title">No ideas in lobby</h3>
              <p className="empty-state__description">
                All ideas across the pipeline will appear here
              </p>
            </div>
          )}
        </div>
      )}

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
                <button
                  className="idea-modal__close"
                  onClick={() => setShowPublishModal(false)}
                >
                  <Icon name="X" size={20} />
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
                  disabled={publishLoading || !eventForm.date}
                >
                  {publishLoading ? 'Publishing...' : 'Publish Event'}
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
            viewOnly={isViewOnly}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div
              className="delete-confirm-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal-header">
                <h2>Delete Event</h2>
                <button
                  className="idea-modal__close"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p className="delete-warning">
                  Are you sure you want to delete this event?
                </p>
                <p className="delete-event-name">
                  <strong>{showDeleteConfirm.title}</strong>
                </p>
                <p className="delete-note">
                  This action cannot be undone. The event will be permanently removed.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-btn"
                  onClick={() => handleDeleteEvent(showDeleteConfirm)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemsContent;
