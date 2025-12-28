import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../shared/Toast';
import Icon from '../../shared/Icon';
import {
  getApplications,
  approveApplication,
  deleteApplication,
  getAllStudents,
  updateStudent,
  deleteStudent,
  updateStudentTier,
  addEventToStudent,
  removeEventFromStudent,
  getAllEvents,
  getStudentEvents,
  TIER_DEFINITIONS
} from '../../../services/database';
import './UnitContent.css';
import './PassportContent.css';

// University name mappings for flexible matching
const UNIVERSITY_ALIASES = {
  'JUST': ['JUST', 'Jordan University of Science and Technology (JUST)', 'Jordan University of Science and Technology'],
  'YU': ['YU', 'Yarmouk University'],
  'UJ': ['UJ', 'University of Jordan'],
  'HU': ['HU', 'Hashemite University'],
  'MEU': ['MEU', 'Middle East University']
};

// Check if a student's university matches the worker's university
const matchesUniversity = (studentUni, workerUni) => {
  if (!studentUni || !workerUni) return false;

  // Direct match
  if (studentUni === workerUni) return true;

  // Check if both belong to the same university group
  for (const [key, aliases] of Object.entries(UNIVERSITY_ALIASES)) {
    const studentMatches = aliases.some(alias =>
      studentUni.toLowerCase().includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(studentUni.toLowerCase())
    );
    const workerMatches = aliases.some(alias =>
      workerUni.toLowerCase().includes(alias.toLowerCase()) ||
      alias.toLowerCase().includes(workerUni.toLowerCase())
    );

    if (studentMatches && workerMatches) return true;
  }

  return false;
};

const PassportContent = ({
  unit,
  university,
  currentUser,
  loading: parentLoading = false
}) => {
  const toast = useToast();

  const [activeSection, setActiveSection] = useState('applications');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appFilter, setAppFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);

  // Students state
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEvents, setStudentEvents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const [selectedEventToAdd, setSelectedEventToAdd] = useState(null);
  const [participationType, setParticipationType] = useState('Attended');
  const [medxploreNotes, setMedxploreNotes] = useState('');

  useEffect(() => {
    if (university) {
      loadData();
    }
  }, [university]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, studentsData, eventsData] = await Promise.all([
        getApplications(),
        getAllStudents(),
        getAllEvents()
      ]);

      const filteredApps = appsData.filter(app => matchesUniversity(app.university, university));
      const filteredStudents = studentsData.filter(s => matchesUniversity(s.university, university));

      setApplications(filteredApps);
      setStudents(filteredStudents);
      setEvents(eventsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
    return new Date(timestamp).toLocaleDateString();
  };

  // ===================== APPLICATIONS =====================
  const getFilteredApplications = () => {
    if (appFilter === 'all') return applications;
    return applications.filter(app => app.status === appFilter);
  };

  const handleApproveApplication = async (appId, appName) => {
    if (!confirm(`Approve application from ${appName}?`)) return;

    setActionLoading(true);
    const result = await approveApplication(appId, currentUser?.id || 'worker');

    if (result.success) {
      toast.success(`Application approved! Passport: ${result.passportNumber}`);
      await loadData();
      setSelectedApp(null);
    } else {
      toast.error('Failed to approve: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleDeleteApplication = async (appId, appName) => {
    if (!confirm(`Delete application from ${appName}?`)) return;

    setActionLoading(true);
    const result = await deleteApplication(appId);

    if (result.success) {
      toast.success('Application deleted');
      await loadData();
      setSelectedApp(null);
    } else {
      toast.error('Failed to delete: ' + result.error);
    }
    setActionLoading(false);
  };

  // ===================== STUDENTS =====================
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = !searchQuery ||
        student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.passportNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTier = tierFilter === 'all' || student.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setActionLoading(true);

    try {
      const events = await getStudentEvents(student.passportNumber);
      setStudentEvents(events);
    } catch (error) {
      setStudentEvents([]);
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
      toast.success('Tier updated');
    } else {
      toast.error('Failed to update tier');
    }
    setActionLoading(false);
  };

  const handleDeleteStudent = async (passportNumber) => {
    if (!confirm('Delete this student?')) return;

    setActionLoading(true);
    const result = await deleteStudent(passportNumber);

    if (result.success) {
      await loadData();
      setSelectedStudent(null);
      toast.success('Student deleted');
    } else {
      toast.error('Failed to delete');
    }
    setActionLoading(false);
  };

  const handleSubmitAddEvent = async (e) => {
    e.preventDefault();
    if (!selectedEventToAdd) {
      toast.error('Please select an event');
      return;
    }

    setActionLoading(true);
    const result = await addEventToStudent(
      selectedStudent.passportNumber,
      selectedEventToAdd,
      participationType,
      medxploreNotes
    );

    if (result.success) {
      await loadData();
      const updatedEvents = await getStudentEvents(selectedStudent.passportNumber);
      setStudentEvents(updatedEvents);
      setAddingEvent(false);
      setSelectedEventToAdd(null);
      setParticipationType('Attended');
      setMedxploreNotes('');
      toast.success('Event added');
    } else {
      toast.error('Failed to add event');
    }
    setActionLoading(false);
  };

  const handleRemoveEvent = async (passportNumber, eventId) => {
    if (!confirm('Remove this event?')) return;

    setActionLoading(true);
    const result = await removeEventFromStudent(passportNumber, eventId);

    if (result.success) {
      const updatedEvents = await getStudentEvents(passportNumber);
      setStudentEvents(updatedEvents);
      await loadData();
      toast.success('Event removed');
    } else {
      toast.error('Failed to remove event');
    }
    setActionLoading(false);
  };

  const handleUpdateStudent = async (updates) => {
    setActionLoading(true);
    const result = await updateStudent(editingStudent.passportNumber, updates);

    if (result.success) {
      await loadData();
      setEditingStudent(null);
      toast.success('Student updated');
    } else {
      toast.error('Failed to update');
    }
    setActionLoading(false);
  };

  if (loading || parentLoading) {
    return (
      <div className="unit-content-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="unit-content passport-content" style={{ '--unit-color': unit?.color }}>
      {/* Header */}
      <div className="unit-content__header">
        <div className="unit-content__title">
          <span className="unit-content__icon">
            <Icon name={unit?.icon || 'Ticket'} size={28} />
          </span>
          <div>
            <h1>{unit?.name || 'Passport Unit'}</h1>
            <p className="unit-content__subtitle">{unit?.description}</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="passport-tabs">
        <button
          className={`passport-tab ${activeSection === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSection('applications')}
        >
          <Icon name="FileText" size={18} />
          Applications
          <span className="passport-tab__badge">
            {applications.filter(a => a.status === 'pending').length}
          </span>
        </button>
        <button
          className={`passport-tab ${activeSection === 'students' ? 'active' : ''}`}
          onClick={() => setActiveSection('students')}
        >
          <Icon name="GraduationCap" size={18} />
          Students
          <span className="passport-tab__badge">{students.length}</span>
        </button>
      </div>

      {/* Applications Section */}
      {activeSection === 'applications' && (
        <div className="passport-section">
          <div className="passport-section__header">
            <div className="filter-pills">
              {['all', 'pending', 'approved'].map((filter) => (
                <button
                  key={filter}
                  className={`filter-pill ${appFilter === filter ? 'active' : ''}`}
                  onClick={() => setAppFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span>
                    {filter === 'all'
                      ? applications.length
                      : applications.filter(a => a.status === filter).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {getFilteredApplications().length > 0 ? (
            <div className="passport-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredApplications().map((app) => (
                    <tr key={app.id}>
                      <td>{app.fullName}</td>
                      <td>{app.program}</td>
                      <td>{formatDate(app.submittedAt)}</td>
                      <td>
                        <span className={`status-chip status-chip--${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedApp(app)}
                          >
                            View
                          </button>
                          {app.status === 'pending' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApproveApplication(app.id, app.fullName)}
                              disabled={actionLoading}
                            >
                              <Icon name="Check" size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDeleteApplication(app.id, app.fullName)}
                            disabled={actionLoading}
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="FileText" size={64} />
              <h3 className="empty-state__title">No applications</h3>
              <p className="empty-state__description">No applications found for {university}</p>
            </div>
          )}
        </div>
      )}

      {/* Students Section */}
      {activeSection === 'students' && (
        <div className="passport-section">
          <div className="passport-section__header">
            <div className="passport-controls">
              <div className="search-box">
                <Icon name="Search" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="tier-select"
              >
                <option value="all">All Tiers</option>
                <option value="Explorer">Explorer</option>
                <option value="Scholar">Scholar</option>
                <option value="Mentor">Mentor</option>
                <option value="Pioneer">Pioneer</option>
              </select>
            </div>
          </div>

          <div className="passport-stats">
            <span>Total: {students.length}</span>
            <span>Showing: {getFilteredStudents().length}</span>
          </div>

          {getFilteredStudents().length > 0 ? (
            <div className="passport-table">
              <table>
                <thead>
                  <tr>
                    <th>Passport #</th>
                    <th>Name</th>
                    <th>Tier</th>
                    <th>Events</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredStudents().map((student) => (
                    <tr key={student.passportNumber}>
                      <td className="passport-num">{student.passportNumber}</td>
                      <td>{student.fullName}</td>
                      <td>
                        <span
                          className="tier-chip"
                          style={{ backgroundColor: TIER_DEFINITIONS[student.tier]?.color }}
                        >
                          {student.tier}
                        </span>
                      </td>
                      <td>{student.totalEvents || 0}</td>
                      <td>{formatDate(student.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewStudent(student)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditingStudent({ ...student })}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Icon name="GraduationCap" size={64} />
              <h3 className="empty-state__title">No students found</h3>
              <p className="empty-state__description">No students match your search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <motion.div
              className="passport-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal__header">
                <h2>Application Details</h2>
                <button className="modal__close" onClick={() => setSelectedApp(null)}>
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="modal__body">
                <div className="info-block">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <span>{selectedApp.fullName}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedApp.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{selectedApp.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="info-block">
                  <h3>Academic Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>University</label>
                      <span>{selectedApp.university}</span>
                    </div>
                    <div className="info-item">
                      <label>Program</label>
                      <span>{selectedApp.program}</span>
                    </div>
                    <div className="info-item">
                      <label>Year</label>
                      <span>{selectedApp.yearOfStudy}</span>
                    </div>
                  </div>
                </div>

                {selectedApp.motivationStatement && (
                  <div className="info-block">
                    <h3>Motivation</h3>
                    <p>{selectedApp.motivationStatement}</p>
                  </div>
                )}

                <div className="info-block">
                  <h3>Status</h3>
                  <span className={`status-chip status-chip--${selectedApp.status}`}>
                    {selectedApp.status}
                  </span>
                  {selectedApp.passportNumber && (
                    <p className="passport-highlight">
                      Passport: {selectedApp.passportNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="modal__footer">
                {selectedApp.status === 'pending' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleApproveApplication(selectedApp.id, selectedApp.fullName)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteApplication(selectedApp.id, selectedApp.fullName)}
                  disabled={actionLoading}
                >
                  Delete
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
            <motion.div
              className="passport-modal passport-modal--large"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal__header">
                <h2>{selectedStudent.fullName}</h2>
                <button className="modal__close" onClick={() => setSelectedStudent(null)}>
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="modal__body">
                <div className="info-block">
                  <h3>Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Passport Number</label>
                      <span className="passport-highlight">{selectedStudent.passportNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Program</label>
                      <span>{selectedStudent.program}</span>
                    </div>
                    <div className="info-item">
                      <label>Tier</label>
                      <span
                        className="tier-chip"
                        style={{ backgroundColor: TIER_DEFINITIONS[selectedStudent.tier]?.color }}
                      >
                        {selectedStudent.tier}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Total Events</label>
                      <span>{selectedStudent.totalEvents || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="info-block">
                  <div className="info-block__header">
                    <h3>Event Participation</h3>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setAddingEvent(true)}
                    >
                      + Add Event
                    </button>
                  </div>

                  {actionLoading ? (
                    <p>Loading events...</p>
                  ) : studentEvents.length > 0 ? (
                    <div className="events-list">
                      {studentEvents.map((participation) => (
                        <div key={participation.id} className="event-item">
                          <div className="event-item__info">
                            <h4>{participation.event?.name || 'Unknown Event'}</h4>
                            <span className="event-item__type">{participation.participationType}</span>
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveEvent(selectedStudent.passportNumber, participation.eventId)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No events attended yet</p>
                  )}
                </div>

                <div className="info-block">
                  <h3>Tier Management</h3>
                  <div className="tier-management">
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
                      className="btn btn-danger"
                      onClick={() => handleDeleteStudent(selectedStudent.passportNumber)}
                      disabled={actionLoading}
                    >
                      Delete Student
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {addingEvent && selectedStudent && (
          <div className="modal-overlay" onClick={() => setAddingEvent(false)}>
            <motion.div
              className="passport-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal__header">
                <h2>Add Event to {selectedStudent.fullName}</h2>
                <button className="modal__close" onClick={() => setAddingEvent(false)}>
                  <Icon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitAddEvent}>
                <div className="modal__body">
                  <div className="form-group">
                    <label>Select Event *</label>
                    <select
                      value={selectedEventToAdd || ''}
                      onChange={(e) => setSelectedEventToAdd(e.target.value)}
                      required
                    >
                      <option value="">Choose an event...</option>
                      {events.filter(event =>
                        !studentEvents.some(p => p.eventId === event.id)
                      ).map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEventToAdd && (
                    <>
                      <div className="form-group">
                        <label>Participation Type *</label>
                        <select
                          value={participationType}
                          onChange={(e) => setParticipationType(e.target.value)}
                        >
                          <option value="Attended">Attended</option>
                          <option value="Presented">Presented</option>
                          <option value="Organized">Organized</option>
                          <option value="Volunteered">Volunteered</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Notes</label>
                        <textarea
                          value={medxploreNotes}
                          onChange={(e) => setMedxploreNotes(e.target.value)}
                          placeholder="Optional notes..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="modal__footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAddingEvent(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading || !selectedEventToAdd}
                  >
                    {actionLoading ? 'Adding...' : 'Add Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="modal-overlay" onClick={() => setEditingStudent(null)}>
            <motion.div
              className="passport-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="modal__header">
                <h2>Edit Student</h2>
                <button className="modal__close" onClick={() => setEditingStudent(null)}>
                  <Icon name="X" size={20} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateStudent(editingStudent); }}>
                <div className="modal__body">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Program</label>
                    <input
                      type="text"
                      value={editingStudent.program}
                      onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal__footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingStudent(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassportContent;
