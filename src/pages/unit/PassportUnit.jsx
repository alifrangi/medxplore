import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useToast } from '../../components/shared/Toast';
import Icon from '../../components/shared/Icon';
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
} from '../../services/database';
import { UNITS } from '../../data/mockData';
import './PassportUnit.css';

const PassportUnit = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, restoreSession, logoutUser } = usePipeline();

  const [activeSection, setActiveSection] = useState('applications');
  const [loading, setLoading] = useState(true);

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

  const [actionLoading, setActionLoading] = useState(false);

  const unit = UNITS.passport;
  const userUniversity = currentUser?.university;

  useEffect(() => {
    if (!currentUser) {
      const restored = restoreSession();
      if (!restored) {
        navigate('/admin');
      }
    }
  }, [currentUser, restoreSession, navigate]);

  // Access guard - redirect if user doesn't have access to passport unit
  useEffect(() => {
    if (currentUser && currentUser.units && !currentUser.units.includes('passport')) {
      navigate('/lobby');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, studentsData, eventsData] = await Promise.all([
        getApplications(),
        getAllStudents(),
        getAllEvents()
      ]);

      // Filter by university
      const filteredApps = appsData.filter(app => app.university === userUniversity);
      const filteredStudents = studentsData.filter(s => s.university === userUniversity);

      setApplications(filteredApps);
      setStudents(filteredStudents);
      setEvents(eventsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/admin');
  };

  const handleGoToLobby = () => {
    navigate('/lobby');
  };

  // ===================== APPLICATIONS =====================
  const getFilteredApplications = () => {
    if (appFilter === 'all') return applications;
    return applications.filter(app => app.status === appFilter);
  };

  const handleApproveApplication = async (appId, appName) => {
    if (!confirm(`Are you sure you want to approve the application from ${appName}?`)) {
      return;
    }

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
    if (!confirm(`Delete application from ${appName}? This cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteApplication(appId);
      if (result.success) {
        toast.success('Application deleted');
        await loadData();
        setSelectedApp(null);
      } else {
        toast.error('Failed to delete: ' + result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
    setActionLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString();
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
    document.body.style.overflow = 'hidden';

    try {
      const events = await getStudentEvents(student.passportNumber);
      setStudentEvents(events);
    } catch (error) {
      setStudentEvents([]);
    }

    setActionLoading(false);
  };

  const handleCloseStudentModal = () => {
    setSelectedStudent(null);
    document.body.style.overflow = 'unset';
  };

  const handleEditStudent = (student) => {
    setEditingStudent({ ...student });
    document.body.style.overflow = 'hidden';
  };

  const handleCloseEditModal = () => {
    setEditingStudent(null);
    document.body.style.overflow = 'unset';
  };

  const handleUpdateStudent = async (updates) => {
    setActionLoading(true);
    const result = await updateStudent(editingStudent.passportNumber, updates);

    if (result.success) {
      await loadData();
      handleCloseEditModal();
      toast.success('Student updated');
    } else {
      toast.error('Failed to update: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleDeleteStudent = async (passportNumber) => {
    if (!confirm('Delete this student? This cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    const result = await deleteStudent(passportNumber);

    if (result.success) {
      await loadData();
      handleCloseStudentModal();
      toast.success('Student deleted');
    } else {
      toast.error('Failed to delete: ' + result.error);
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
      toast.error('Failed to update tier: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleOpenAddEventModal = () => {
    setAddingEvent(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAddEventModal = () => {
    setAddingEvent(false);
    setSelectedEventToAdd(null);
    setParticipationType('Attended');
    setMedxploreNotes('');
    document.body.style.overflow = 'unset';
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
      if (selectedStudent) {
        const updatedEvents = await getStudentEvents(selectedStudent.passportNumber);
        setStudentEvents(updatedEvents);
        const updatedStudents = await getAllStudents();
        const updated = updatedStudents.find(s => s.passportNumber === selectedStudent.passportNumber);
        if (updated) setSelectedStudent(updated);
      }
      handleCloseAddEventModal();
      toast.success('Event added');
    } else {
      toast.error('Failed to add event: ' + result.error);
    }
    setActionLoading(false);
  };

  const handleRemoveEventFromStudent = async (passportNumber, eventId) => {
    if (!confirm('Remove this event from the student?')) {
      return;
    }

    setActionLoading(true);
    const result = await removeEventFromStudent(passportNumber, eventId);

    if (result.success) {
      await loadData();
      if (selectedStudent) {
        const updatedEvents = await getStudentEvents(passportNumber);
        setStudentEvents(updatedEvents);
        const updatedStudents = await getAllStudents();
        const updated = updatedStudents.find(s => s.passportNumber === passportNumber);
        if (updated) setSelectedStudent(updated);
      }
      toast.success('Event removed');
    } else {
      toast.error('Failed to remove event: ' + result.error);
    }
    setActionLoading(false);
  };

  const sections = [
    { id: 'applications', label: 'Applications', icon: 'FileText', count: applications.filter(a => a.status === 'pending').length },
    { id: 'students', label: 'Students', icon: 'GraduationCap', count: students.length }
  ];

  if (!currentUser) {
    return (
      <div className="passport-unit">
        <div className="unit-loading">
          <div className="loading-spinner" style={{ '--unit-color': unit?.color }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="passport-unit" style={{ '--unit-color': unit?.color }}>
        <div className="unit-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="passport-unit" style={{ '--unit-color': unit?.color || '#9C27B0' }}>
      {/* Header */}
      <header className="unit-header">
        <div className="unit-header__left">
          <button className="back-btn" onClick={handleGoToLobby}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="unit-header__title">
            <span className="unit-icon">
              <Icon name={unit?.icon} size={24} />
            </span>
            <h1>{unit?.name}</h1>
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
        {sections.map((section) => (
          <button
            key={section.id}
            className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <Icon name={section.icon} size={18} />
            {section.label}
            {section.count > 0 && <span className="tab-badge">{section.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="unit-content">
        {/* ========== APPLICATIONS SECTION ========== */}
        {activeSection === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2>Applications</h2>
              <div className="filter-pills">
                {['all', 'pending', 'approved'].map((filter) => (
                  <button
                    key={filter}
                    className={`filter-pill ${appFilter === filter ? 'active' : ''}`}
                    onClick={() => setAppFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <span className="pill-count">
                      {filter === 'all'
                        ? applications.length
                        : applications.filter(a => a.status === filter).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {getFilteredApplications().length > 0 ? (
              <div className="applications-table">
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
                          <span className={`status-chip ${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn-small view"
                              onClick={() => setSelectedApp(app)}
                            >
                              View
                            </button>
                            {app.status === 'pending' && (
                              <button
                                className="action-btn-small approve"
                                onClick={() => handleApproveApplication(app.id, app.fullName)}
                                disabled={actionLoading}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </button>
                            )}
                            <button
                              className="action-btn-small delete"
                              onClick={() => handleDeleteApplication(app.id, app.fullName)}
                              disabled={actionLoading}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>No applications</h3>
                <p>No applications found for {userUniversity}</p>
              </div>
            )}
          </div>
        )}

        {/* ========== STUDENTS SECTION ========== */}
        {activeSection === 'students' && (
          <div className="students-section">
            <div className="section-header">
              <h2>Students</h2>
              <div className="students-controls">
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
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

            <div className="stats-bar">
              <span>Total: {students.length}</span>
              <span>Showing: {getFilteredStudents().length}</span>
            </div>

            {getFilteredStudents().length > 0 ? (
              <div className="students-table">
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
                              className="action-btn-small view"
                              onClick={() => handleViewStudent(student)}
                            >
                              View
                            </button>
                            <button
                              className="action-btn-small edit"
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
              </div>
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3>No students found</h3>
                <p>No students match your search criteria</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========== APPLICATION DETAIL MODAL ========== */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              className="application-modal"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Application Details</h2>
                <button className="close-btn" onClick={() => setSelectedApp(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <div className="info-block">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <span>{selectedApp.fullName}</span>
                    </div>
                    {selectedApp.dateOfBirth && (
                      <div className="info-item">
                        <label>Date of Birth</label>
                        <span>{selectedApp.dateOfBirth}</span>
                      </div>
                    )}
                    {selectedApp.nationality && (
                      <div className="info-item">
                        <label>Nationality</label>
                        <span>{selectedApp.nationality}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-block">
                  <h3>Contact Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedApp.email}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{selectedApp.countryCode || ''} {selectedApp.phone}</span>
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
                    {selectedApp.studentId && (
                      <div className="info-item">
                        <label>Student ID</label>
                        <span>{selectedApp.studentId}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <label>Program</label>
                      <span>{selectedApp.program}</span>
                    </div>
                    <div className="info-item">
                      <label>Year of Study</label>
                      <span>{selectedApp.yearOfStudy}</span>
                    </div>
                  </div>
                </div>

                {selectedApp.motivationStatement && (
                  <div className="info-block">
                    <h3>Motivation</h3>
                    <p className="motivation-text">{selectedApp.motivationStatement}</p>
                  </div>
                )}

                <div className="info-block">
                  <h3>Status</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Status</label>
                      <span className={`status-chip ${selectedApp.status}`}>{selectedApp.status}</span>
                    </div>
                    <div className="info-item">
                      <label>Submitted</label>
                      <span>{formatDate(selectedApp.submittedAt)}</span>
                    </div>
                    {selectedApp.passportNumber && (
                      <div className="info-item full">
                        <label>Passport Number</label>
                        <span className="passport-highlight">{selectedApp.passportNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {selectedApp.status === 'pending' && (
                  <button
                    className="modal-btn approve"
                    onClick={() => handleApproveApplication(selectedApp.id, selectedApp.fullName)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve Application'}
                  </button>
                )}
                <button
                  className="modal-btn delete"
                  onClick={() => handleDeleteApplication(selectedApp.id, selectedApp.fullName)}
                  disabled={actionLoading}
                >
                  Delete
                </button>
                <button
                  className="modal-btn close"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== STUDENT DETAIL MODAL ========== */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseStudentModal}
          >
            <motion.div
              className="student-modal"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedStudent.fullName}</h2>
                <button className="close-btn" onClick={handleCloseStudentModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
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
                      <label>Current Tier</label>
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
                  <div className="block-header">
                    <h3>Event Participation</h3>
                    <button className="add-event-btn" onClick={handleOpenAddEventModal}>
                      + Add Event
                    </button>
                  </div>

                  {actionLoading ? (
                    <div className="loading-text">Loading events...</div>
                  ) : (
                    <div className="events-list">
                      {studentEvents.map((participation) => (
                        <div key={participation.id} className="event-item">
                          <div className="event-info">
                            <h4>{participation.event?.name || 'Unknown Event'}</h4>
                            <p>{participation.event?.description}</p>
                            <span className="participation-badge">{participation.participationType}</span>
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
      </AnimatePresence>

      {/* ========== ADD EVENT MODAL ========== */}
      <AnimatePresence>
        {addingEvent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAddEventModal}
          >
            <motion.div
              className="add-event-modal"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Add Event to {selectedStudent?.fullName}</h2>
                <button className="close-btn" onClick={handleCloseAddEventModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitAddEvent} className="add-event-form">
                <div className="form-group">
                  <label>Select Event *</label>
                  <select
                    value={selectedEventToAdd || ''}
                    onChange={(e) => setSelectedEventToAdd(e.target.value)}
                    required
                  >
                    <option value="">Choose an event...</option>
                    {events.filter(event => {
                      return !studentEvents.some(p => p.eventId === event.id);
                    }).map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEventToAdd && (
                  <>
                    <div className="selected-event-preview">
                      <h4>{events.find(e => e.id === selectedEventToAdd)?.name}</h4>
                      <p>{events.find(e => e.id === selectedEventToAdd)?.description}</p>
                    </div>

                    <div className="form-group">
                      <label>Participation Type *</label>
                      <select
                        value={participationType}
                        onChange={(e) => setParticipationType(e.target.value)}
                        required
                      >
                        <option value="Attended">Attended</option>
                        <option value="Presented">Presented</option>
                        <option value="Organized">Organized</option>
                        <option value="Volunteered">Volunteered</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>MedXplore Notes</label>
                      <textarea
                        value={medxploreNotes}
                        onChange={(e) => setMedxploreNotes(e.target.value)}
                        placeholder="Describe what the student did during this event..."
                        rows="4"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={handleCloseAddEventModal}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn" disabled={actionLoading}>
                        {actionLoading ? 'Adding...' : 'Add Event'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== EDIT STUDENT MODAL ========== */}
      <AnimatePresence>
        {editingStudent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEditModal}
          >
            <motion.div
              className="edit-student-modal"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Edit Student</h2>
                <button className="close-btn" onClick={handleCloseEditModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStudent(editingStudent);
                }}
                className="edit-form"
              >
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.fullName}
                    onChange={(e) => setEditingStudent({...editingStudent, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Program</label>
                  <input
                    type="text"
                    value={editingStudent.program}
                    onChange={(e) => setEditingStudent({...editingStudent, program: e.target.value})}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : 'Update Student'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassportUnit;
