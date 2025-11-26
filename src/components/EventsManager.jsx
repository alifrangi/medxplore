import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getAllStudents,
  bulkAddStudentsToEvent,
  getEventStats,
  TIER_DEFINITIONS
} from '../services/database';
import './EventsManager.css';

const EventsManager = ({ workerId, workerName }) => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addingStudents, setAddingStudents] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: 'workshop',
    maxParticipants: ''
  });

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [participationType, setParticipationType] = useState('Attended');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, studentsData] = await Promise.all([
        getAllEvents(),
        getAllStudents()
      ]);
      setEvents(eventsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const eventData = {
      ...newEvent,
      date: new Date(newEvent.date),
      maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : null
    };

    const result = await createEvent(eventData, workerId || 'worker');

    if (result.success) {
      await loadData();
      setCreatingEvent(false);
      setNewEvent({
        name: '',
        description: '',
        date: '',
        location: '',
        category: 'workshop',
        maxParticipants: ''
      });
      alert('Event created successfully!');
    } else {
      alert('Failed to create event: ' + result.error);
    }

    setActionLoading(false);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const updates = {
      ...editingEvent,
      date: new Date(editingEvent.date),
      maxParticipants: editingEvent.maxParticipants ? parseInt(editingEvent.maxParticipants) : null
    };

    const result = await updateEvent(editingEvent.id, updates);

    if (result.success) {
      await loadData();
      setEditingEvent(null);
      if (selectedEvent && selectedEvent.id === editingEvent.id) {
        setSelectedEvent({ ...selectedEvent, ...updates });
      }
      alert('Event updated successfully!');
    } else {
      alert('Failed to update event: ' + result.error);
    }

    setActionLoading(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setActionLoading(true);
    const result = await deleteEvent(eventId);

    if (result.success) {
      await loadData();
      setSelectedEvent(null);
      alert('Event deleted successfully!');
    } else {
      alert('Failed to delete event: ' + result.error);
    }

    setActionLoading(false);
  };

  const handleViewEvent = async (event) => {
    setSelectedEvent(event);
    setActionLoading(true);

    const [participants, stats] = await Promise.all([
      getEventParticipants(event.id),
      getEventStats(event.id)
    ]);

    setEventParticipants(participants);
    setEventStats(stats);
    setActionLoading(false);
  };

  const handleBulkAddStudents = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setActionLoading(true);
    const result = await bulkAddStudentsToEvent(
      selectedEvent.id,
      selectedStudents,
      participationType,
      adminNotes
    );

    if (result.success) {
      await loadData();
      const [participants, stats] = await Promise.all([
        getEventParticipants(selectedEvent.id),
        getEventStats(selectedEvent.id)
      ]);
      setEventParticipants(participants);
      setEventStats(stats);
      setSelectedStudents([]);
      setAdminNotes('');
      setAddingStudents(false);
      alert(result.message);
    } else {
      alert('Failed to add students: ' + result.error);
    }

    setActionLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateInput = (timestamp) => {
    if (!timestamp) return '';
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    return new Date(timestamp).toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="events-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-manager">
      <div className="manager-header">
        <h2>Event Management</h2>
        <button
          className="create-btn"
          onClick={() => setCreatingEvent(true)}
        >
          + Create Event
        </button>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-card-header">
              <h3>{event.name}</h3>
              <span className={`category-badge category-${event.category}`}>
                {event.category}
              </span>
            </div>
            <p className="event-description">{event.description}</p>
            <div className="event-meta">
              <span>📅 {formatDate(event.date)}</span>
              <span>📍 {event.location}</span>
            </div>
            <div className="event-actions">
              <button
                className="view-btn"
                onClick={() => handleViewEvent(event)}
              >
                View Details
              </button>
              <button
                className="edit-btn"
                onClick={() => setEditingEvent(event)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteEvent(event.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="no-events">
            <p>No events created yet</p>
            <button
              className="create-first-btn"
              onClick={() => setCreatingEvent(true)}
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {creatingEvent && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCreatingEvent(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Create New Event</h2>
              <button className="close-btn" onClick={() => setCreatingEvent(false)}>×</button>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="conference">Conference</option>
                      <option value="webinar">Webinar</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Event'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setCreatingEvent(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setEditingEvent(null)}
        >
          <motion.div
            className="modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Event</h2>
              <button className="close-btn" onClick={() => setEditingEvent(null)}>×</button>
            </div>
            <form onSubmit={handleUpdateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    value={editingEvent.name}
                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formatDateInput(editingEvent.date)}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={editingEvent.category}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="conference">Conference</option>
                      <option value="webinar">Webinar</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      value={editingEvent.location}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      value={editingEvent.maxParticipants || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, maxParticipants: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Event'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* View Event Details Modal */}
      {selectedEvent && !addingStudents && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            className="modal-content event-details-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedEvent.name}</h2>
              <button className="close-btn" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="event-info">
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
                <p><strong>Location:</strong> {selectedEvent.location}</p>
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                {selectedEvent.maxParticipants && (
                  <p><strong>Max Participants:</strong> {selectedEvent.maxParticipants}</p>
                )}
              </div>

              <div className="participants-section">
                <div className="section-header">
                  <h3>Participants ({eventParticipants.length})</h3>
                  <button
                    className="add-students-btn"
                    onClick={() => setAddingStudents(true)}
                  >
                    + Add Students
                  </button>
                </div>

                {actionLoading ? (
                  <div className="loading">Loading participants...</div>
                ) : (
                  <div className="participants-list">
                    {eventParticipants.map((participant) => (
                      <div key={participant.id} className="participant-item">
                        <div className="participant-info">
                          <h4>{participant.student?.fullName || 'Unknown Student'}</h4>
                          <p>{participant.student?.university}</p>
                          <span className="participation-type">{participant.participationType}</span>
                          {participant.adminNotes && (
                            <div className="participant-admin-notes">
                              <label>Admin Notes:</label>
                              <p>{participant.adminNotes}</p>
                            </div>
                          )}
                        </div>
                        <div className="participant-tier">
                          <span
                            className="tier-badge"
                            style={{ backgroundColor: TIER_DEFINITIONS[participant.student?.tier]?.color || TIER_DEFINITIONS['Explorer']?.color }}
                          >
                            {participant.student?.tier || 'Explorer'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {eventParticipants.length === 0 && (
                      <p className="no-participants">No participants yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Students to Event Modal */}
      {selectedEvent && addingStudents && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setAddingStudents(false)}
        >
          <motion.div
            className="modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add Students to Event</h2>
              <button className="close-btn" onClick={() => setAddingStudents(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Participation Type:</label>
                <select
                  value={participationType}
                  onChange={(e) => setParticipationType(e.target.value)}
                >
                  <option value="Attended">Attended</option>
                  <option value="Presented">Presented</option>
                  <option value="Organized">Organized</option>
                </select>
              </div>

              <div className="admin-notes-section">
                <label>Admin Notes (Optional):</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this participation"
                  rows="4"
                />
                <small>These notes will be visible to students on their dashboard</small>
              </div>

              <div className="students-selection">
                <div className="selection-header">
                  <h3>Select Students ({selectedStudents.length} selected)</h3>
                  <button
                    className="select-all-btn"
                    onClick={() => {
                      if (selectedStudents.length === students.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(students.map(s => s.passportNumber));
                      }
                    }}
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="students-list">
                  {students.map((student) => (
                    <div key={student.passportNumber} className="student-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.passportNumber)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.passportNumber]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.passportNumber));
                          }
                        }}
                      />
                      <label>
                        <strong>{student.fullName}</strong>
                        <span>{student.university} - {student.tier}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="submit-btn"
                onClick={handleBulkAddStudents}
                disabled={actionLoading || selectedStudents.length === 0}
              >
                {actionLoading ? 'Adding...' : `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
              </button>
              <button className="cancel-btn" onClick={() => setAddingStudents(false)}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EventsManager;
