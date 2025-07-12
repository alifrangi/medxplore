import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventParticipants, 
  bulkAddStudentsToEvent,
  getEventStats,
  getAllStudents,
  TIER_DEFINITIONS
} from '../services/database';
import './AdminEvents.css';

const AdminEvents = () => {
  const { adminData } = useAuth();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
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
      // Error loading data
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
    
    const result = await createEvent(eventData, adminData?.id || 'admin');
    
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
    if (!confirm('Are you sure you want to delete this event? This will also remove all participations and update student tiers accordingly.')) {
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
      participationType
    );
    
    if (result.success) {
      await loadData();
      // Refresh event data
      const [participants, stats] = await Promise.all([
        getEventParticipants(selectedEvent.id),
        getEventStats(selectedEvent.id)
      ]);
      setEventParticipants(participants);
      setEventStats(stats);
      setSelectedStudents([]);
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
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Event Management</h1>
          </div>
          <button 
            className="create-event-btn"
            onClick={() => setCreatingEvent(true)}
          >
            Create New Event
          </button>
        </div>
      </div>

      <div className="events-container">
        <div className="events-grid">
          {events.map((event) => (
            <motion.div 
              key={event.id}
              className="event-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="event-header">
                <h3>{event.name}</h3>
                <span className="event-category">{event.category}</span>
              </div>
              
              <div className="event-details">
                <p className="event-description">{event.description}</p>
                <div className="event-meta">
                  <span className="event-date">📅 {formatDate(event.date)}</span>
                  <span className="event-location">📍 {event.location}</span>
                </div>
              </div>
              
              <div className="event-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => handleViewEvent(event)}
                >
                  View Details
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => setEditingEvent({
                    ...event,
                    date: formatDateInput(event.date)
                  })}
                >
                  Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteEvent(event.id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="no-events">
            <h3>No Events Created Yet</h3>
            <p>Create your first event to get started!</p>
            <button 
              className="create-event-btn"
              onClick={() => setCreatingEvent(true)}
            >
              Create New Event
            </button>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <motion.div 
          className="event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedEvent.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>

            <div className="event-details-content">
              <div className="detail-section">
                <h3>Event Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedEvent.description}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedEvent.category}</span>
                  </div>
                  {selectedEvent.maxParticipants && (
                    <div className="detail-item">
                      <label>Max Participants:</label>
                      <span>{selectedEvent.maxParticipants}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Participants ({eventStats?.totalParticipants || 0})</h3>
                  <button 
                    className="add-students-btn"
                    onClick={() => setAddingStudents(true)}
                  >
                    Add Students
                  </button>
                </div>

                {eventStats && (
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>By Type</h4>
                      {Object.entries(eventStats.byType).map(([type, count]) => (
                        <div key={type} className="stat-item">
                          <span>{type}:</span> <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="stat-card">
                      <h4>By Tier</h4>
                      {Object.entries(eventStats.byTier).map(([tier, count]) => (
                        <div key={tier} className="stat-item">
                          <span>{tier}:</span> <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
          </motion.div>
        </motion.div>
      )}

      {/* Create Event Modal */}
      {creatingEvent && (
        <motion.div 
          className="create-event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCreatingEvent(false)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="event-form">
              <div className="form-group">
                <label>Event Name *</label>
                <input 
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input 
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="webinar">Webinar</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <input 
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Max Participants (Optional)</label>
                <input 
                  type="number"
                  value={newEvent.maxParticipants}
                  onChange={(e) => setNewEvent({...newEvent, maxParticipants: e.target.value})}
                  min="1"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Event'}
                </button>
                <button type="button" onClick={() => setCreatingEvent(false)}>
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
          className="edit-event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setEditingEvent(null)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Event</h2>
            <form onSubmit={handleUpdateEvent} className="event-form">
              <div className="form-group">
                <label>Event Name *</label>
                <input 
                  type="text"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input 
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="conference">Conference</option>
                    <option value="webinar">Webinar</option>
                    <option value="networking">Networking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Location *</label>
                <input 
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Max Participants (Optional)</label>
                <input 
                  type="number"
                  value={editingEvent.maxParticipants || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, maxParticipants: e.target.value})}
                  min="1"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Event'}
                </button>
                <button type="button" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Add Students Modal */}
      {addingStudents && (
        <motion.div 
          className="add-students-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setAddingStudents(false)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add Students to Event</h2>
            
            <div className="participation-type-selector">
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
                    <div className="student-info">
                      <h4>{student.fullName}</h4>
                      <p>{student.university} - {student.program}</p>
                      <span className="passport-number">{student.passportNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={handleBulkAddStudents}
                disabled={selectedStudents.length === 0 || actionLoading}
              >
                {actionLoading ? 'Adding...' : `Add ${selectedStudents.length} Students`}
              </button>
              <button onClick={() => setAddingStudents(false)}>
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminEvents;