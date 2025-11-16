import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllStudents, 
  updateStudent, 
  deleteStudent, 
  updateStudentTier,
  addEventToStudent,
  removeEventFromStudent,
  getAllEvents,
  getStudentEvents,
  TIER_DEFINITIONS 
} from '../services/database';
import './AdminStudents.css';

const AdminStudents = () => {
  const { adminData } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEvents, setStudentEvents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [selectedEventToAdd, setSelectedEventToAdd] = useState(null);
  const [participationType, setParticipationType] = useState('Attended');
  const [medxploreNotes, setMedxploreNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();

    // Cleanup: Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, tierFilter]);

  const loadData = async () => {
    try {
      const [studentsData, eventsData] = await Promise.all([
        getAllStudents(),
        getAllEvents()
      ]);
      setStudents(studentsData);
      setEvents(eventsData);
    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    const filtered = students.filter(student => {
      const matchesSearch = !searchQuery || 
        student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.passportNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTier = tierFilter === 'all' || student.tier === tierFilter;
      
      return matchesSearch && matchesTier;
    });
    setFilteredStudents(filtered);
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setActionLoading(true);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    try {
      // Always load fresh student events data
      const events = await getStudentEvents(student.passportNumber);
      // Loaded student events
      setStudentEvents(events);
    } catch (error) {
      // Error loading student events
      setStudentEvents([]);
    }

    setActionLoading(false);
  };

  const handleCloseStudentModal = () => {
    setSelectedStudent(null);
    // Re-enable background scrolling
    document.body.style.overflow = 'unset';
  };

  const handleEditStudent = (student) => {
    setEditingStudent({ ...student });
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleCloseEditModal = () => {
    setEditingStudent(null);
    // Re-enable background scrolling
    document.body.style.overflow = 'unset';
  };

  const handleOpenAddEventModal = () => {
    setAddingEvent(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAddEventModal = () => {
    setAddingEvent(false);
    setSelectedEventToAdd(null);
    setParticipationType('Attended');
    setMedxploreNotes('');
    // Re-enable background scrolling
    document.body.style.overflow = 'unset';
  };

  const handleSubmitAddEvent = async (e) => {
    e.preventDefault();
    if (!selectedEventToAdd) {
      alert('Please select an event');
      return;
    }
    await handleAddEventToStudent(
      selectedStudent.passportNumber,
      selectedEventToAdd,
      participationType,
      medxploreNotes
    );
  };

  const handleUpdateStudent = async (updates) => {
    setActionLoading(true);
    const result = await updateStudent(editingStudent.passportNumber, updates);

    if (result.success) {
      await loadData();
      handleCloseEditModal();
      alert('Student updated successfully!');
    } else {
      alert('Failed to update student: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleDeleteStudent = async (passportNumber) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    const result = await deleteStudent(passportNumber);
    
    if (result.success) {
      await loadData();
      handleCloseStudentModal();
      alert('Student deleted successfully!');
    } else {
      alert('Failed to delete student: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleUpdateTier = async (passportNumber, newTier) => {
    setActionLoading(true);
    const result = await updateStudentTier(passportNumber, newTier);
    
    if (result.success) {
      await loadData();
      if (selectedStudent) {
        setSelectedStudent({ ...selectedStudent, tier: newTier });
      }
      alert('Tier updated successfully!');
    } else {
      alert('Failed to update tier: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleAddEventToStudent = async (passportNumber, eventId, participationType, adminNotes = '') => {
    setActionLoading(true);
    const result = await addEventToStudent(passportNumber, eventId, participationType, adminNotes);

    if (result.success) {
      // Reload all data to ensure consistency
      await loadData();

      // Refresh the selected student's events
      if (selectedStudent && selectedStudent.passportNumber === passportNumber) {
        const updatedEvents = await getStudentEvents(passportNumber);
        setStudentEvents(updatedEvents);

        // Update the selected student's total events count
        const updatedStudents = await getAllStudents();
        const updatedStudent = updatedStudents.find(s => s.passportNumber === passportNumber);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      }

      handleCloseAddEventModal();
      alert('Event added successfully!');
    } else {
      alert('Failed to add event: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleRemoveEventFromStudent = async (passportNumber, eventId) => {
    if (!confirm('Are you sure you want to remove this event from the student?')) {
      return;
    }
    
    setActionLoading(true);
    const result = await removeEventFromStudent(passportNumber, eventId);
    
    if (result.success) {
      // Reload all data to ensure consistency
      await loadData();
      
      // Refresh the selected student's events
      if (selectedStudent && selectedStudent.passportNumber === passportNumber) {
        const updatedEvents = await getStudentEvents(passportNumber);
        setStudentEvents(updatedEvents);
        
        // Update the selected student's total events count
        const updatedStudents = await getAllStudents();
        const updatedStudent = updatedStudents.find(s => s.passportNumber === passportNumber);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        }
      }
      
      alert('Event removed successfully!');
    } else {
      alert('Failed to remove event: ' + result.error);
    }
    setActionLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-students">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>Student Management</h1>
          </div>
        </div>
      </div>

      <div className="students-container">
        <div className="controls-section">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="tier-filter"
            >
              <option value="all">All Tiers</option>
              <option value="Explorer">Explorer</option>
              <option value="Scholar">Scholar</option>
              <option value="Mentor">Mentor</option>
              <option value="Pioneer">Pioneer</option>
            </select>
          </div>
          <div className="stats-info">
            <span className="stat-item">Total Students: {students.length}</span>
            <span className="stat-item">Showing: {filteredStudents.length}</span>
          </div>
        </div>

        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Passport #</th>
                <th>Name</th>
                <th>University</th>
                <th>Tier</th>
                <th>Events</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.passportNumber}>
                  <td className="passport-number">{student.passportNumber}</td>
                  <td>{student.fullName}</td>
                  <td>{student.university}</td>
                  <td>
                    <span 
                      className="tier-badge"
                      style={{ backgroundColor: TIER_DEFINITIONS[student.tier]?.color }}
                    >
                      {student.tier}
                    </span>
                  </td>
                  <td>{student.totalEvents || 0}</td>
                  <td>{formatDate(student.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewStudent(student)}
                      >
                        View
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditStudent(student)}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="no-students">
              <p>No students found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <motion.div
          className="student-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleCloseStudentModal}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedStudent.fullName}</h2>
              <button
                className="close-btn"
                onClick={handleCloseStudentModal}
              >
                ×
              </button>
            </div>

            <div className="student-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Passport Number:</label>
                    <span>{selectedStudent.passportNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>University:</label>
                    <span>{selectedStudent.university}</span>
                  </div>
                  <div className="detail-item">
                    <label>Program:</label>
                    <span>{selectedStudent.program}</span>
                  </div>
                  <div className="detail-item">
                    <label>Current Tier:</label>
                    <span 
                      className="tier-badge"
                      style={{ backgroundColor: TIER_DEFINITIONS[selectedStudent.tier]?.color }}
                    >
                      {selectedStudent.tier}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Total Events:</label>
                    <span>{selectedStudent.totalEvents || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <h3>Event Participation</h3>
                  <button
                    className="add-event-btn"
                    onClick={handleOpenAddEventModal}
                  >
                    Add Event
                  </button>
                </div>
                
                {actionLoading ? (
                  <div className="loading">Loading events...</div>
                ) : (
                  <div className="events-list">
                    {studentEvents.map((participation) => (
                      <div key={participation.id} className="event-item">
                        <div className="event-info">
                          <h4>{participation.event?.name || 'Unknown Event'}</h4>
                          <p>{participation.event?.description}</p>
                          <span className="participation-type">{participation.participationType}</span>
                        </div>
                        <button 
                          className="remove-event-btn"
                          onClick={() => handleRemoveEventFromStudent(selectedStudent.passportNumber, participation.eventId)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {studentEvents.length === 0 && (
                      <p className="no-events">No events attended yet</p>
                    )}
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Tier Management</h3>
                <div className="tier-controls">
                  <select 
                    value={selectedStudent.tier}
                    onChange={(e) => handleUpdateTier(selectedStudent.passportNumber, e.target.value)}
                    disabled={actionLoading}
                  >
                    <option value="Explorer">Explorer</option>
                    <option value="Scholar">Scholar</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Pioneer">Pioneer</option>
                  </select>
                  <button 
                    className="delete-student-btn"
                    onClick={() => handleDeleteStudent(selectedStudent.passportNumber)}
                    disabled={actionLoading}
                  >
                    Delete Student
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Event Modal */}
      {addingEvent && (
        <motion.div
          className="add-event-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleCloseAddEventModal}
        >
          <motion.div
            className="modal-content add-event-modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Add Event to {selectedStudent?.fullName}</h2>
              <button className="close-btn" onClick={handleCloseAddEventModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitAddEvent} className="add-event-form-content">
              <div className="form-section">
                <label htmlFor="event-select">Select Event *</label>
                <select
                  id="event-select"
                  value={selectedEventToAdd || ''}
                  onChange={(e) => setSelectedEventToAdd(e.target.value)}
                  required
                  className="event-select-dropdown"
                >
                  <option value="">Choose an event...</option>
                  {events.filter(event => {
                    return !studentEvents.some(participation => participation.eventId === event.id);
                  }).map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
                {events.filter(event => {
                  return !studentEvents.some(participation => participation.eventId === event.id);
                }).length === 0 && (
                  <p className="no-events-message">No available events. The student has participated in all existing events.</p>
                )}
              </div>

              {selectedEventToAdd && (
                <>
                  <div className="selected-event-preview">
                    <h4>{events.find(e => e.id === selectedEventToAdd)?.name}</h4>
                    <p>{events.find(e => e.id === selectedEventToAdd)?.description}</p>
                  </div>

                  <div className="form-section">
                    <label htmlFor="participation-type">Participation Type *</label>
                    <select
                      id="participation-type"
                      value={participationType}
                      onChange={(e) => setParticipationType(e.target.value)}
                      required
                      className="participation-type-select"
                    >
                      <option value="Attended">Attended</option>
                      <option value="Presented">Presented</option>
                      <option value="Organized">Organized</option>
                      <option value="Volunteered">Volunteered</option>
                    </select>
                  </div>

                  <div className="form-section">
                    <label htmlFor="medxplore-notes">MedXplore Notes</label>
                    <textarea
                      id="medxplore-notes"
                      value={medxploreNotes}
                      onChange={(e) => setMedxploreNotes(e.target.value)}
                      placeholder="Describe what the student did during this event, their contributions, achievements, etc. This will be visible to the student on their passport."
                      rows="5"
                      className="medxplore-notes-textarea"
                    />
                    <small className="field-hint">Optional - Add personalized feedback or notes about the student's participation</small>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleCloseAddEventModal} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" disabled={actionLoading} className="submit-btn">
                      {actionLoading ? 'Adding Event...' : 'Add Event to Student'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <motion.div
          className="edit-student-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleCloseEditModal}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Student</h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStudent(editingStudent);
              }}
              className="edit-form"
            >
              <div className="form-group">
                <label>Full Name:</label>
                <input 
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({...editingStudent, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>University:</label>
                <input 
                  type="text"
                  value={editingStudent.university}
                  onChange={(e) => setEditingStudent({...editingStudent, university: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Program:</label>
                <input 
                  type="text"
                  value={editingStudent.program}
                  onChange={(e) => setEditingStudent({...editingStudent, program: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Student'}
                </button>
                <button type="button" onClick={handleCloseEditModal}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminStudents;