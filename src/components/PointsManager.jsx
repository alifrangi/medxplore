import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getAllWorkers } from '../services/database';
import { generateProfileColor } from '../utils/crypto';
import './PointsManager.css';

const PointsManager = ({ workerId, workerName }) => {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [pointsToAward, setPointsToAward] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    passportNumber: '',
    departments: [],
    points: 0
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    filterAndSearch();
  }, [workers, searchTerm, filterDepartment]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const result = await getAllWorkers();

      if (result.success) {
        // Sort workers by points (highest to lowest)
        const sortedWorkers = result.workers.sort((a, b) => (b.points || 0) - (a.points || 0));
        setWorkers(sortedWorkers);
      } else {
        console.error('Error loading workers:', result.error);
        alert('Error loading team members. Please try again.');
      }
    } catch (error) {
      console.error('Error loading workers:', error);
      alert('Error loading team members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearch = () => {
    let filtered = [...workers];

    // Apply department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(w => w.departments?.includes(filterDepartment));
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w =>
        `${w.firstName} ${w.lastName}`.toLowerCase().includes(term)
      );
    }

    // Sort by points (highest to lowest)
    filtered.sort((a, b) => (b.points || 0) - (a.points || 0));

    setFilteredWorkers(filtered);
  };

  const handleAwardPoints = (worker) => {
    setSelectedWorker(worker);
    setPointsToAward('');
    setPointsReason('');
    setShowModal(true);
  };

  const submitPointsAward = async () => {
    if (!pointsToAward || isNaN(pointsToAward) || parseInt(pointsToAward) <= 0) {
      alert('Please enter a valid number of points (greater than 0)');
      return;
    }

    if (!pointsReason.trim()) {
      alert('Please provide a reason for awarding points');
      return;
    }

    try {
      const pointsValue = parseInt(pointsToAward);

      // Update worker's total points
      const workerRef = doc(db, 'workers', selectedWorker.id);
      const currentPoints = selectedWorker.points || 0;
      await updateDoc(workerRef, {
        points: currentPoints + pointsValue
      });

      // Create a record of this point award
      await addDoc(collection(db, 'workerPointsHistory'), {
        workerId: selectedWorker.id,
        workerName: `${selectedWorker.firstName} ${selectedWorker.lastName}`,
        points: pointsValue,
        reason: pointsReason,
        awardedBy: workerId,
        awardedByName: workerName,
        awardedAt: serverTimestamp()
      });

      alert(`Successfully awarded ${pointsValue} points to ${selectedWorker.firstName} ${selectedWorker.lastName}`);

      setShowModal(false);
      setSelectedWorker(null);
      setPointsToAward('');
      setPointsReason('');

      // Reload workers
      await loadWorkers();
    } catch (error) {
      console.error('Error awarding points:', error);
      alert('Error awarding points. Please try again.');
    }
  };

  const handleCreateMember = () => {
    setNewMember({
      firstName: '',
      lastName: '',
      passportNumber: '',
      departments: [],
      points: 0
    });
    setShowCreateModal(true);
  };

  const handleDepartmentToggle = (dept) => {
    setNewMember(prev => {
      const departments = prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept];
      return { ...prev, departments };
    });
  };

  const submitCreateMember = async () => {
    // Validation
    if (!newMember.firstName.trim()) {
      alert('Please enter a first name');
      return;
    }
    if (!newMember.lastName.trim()) {
      alert('Please enter a last name');
      return;
    }
    if (!newMember.passportNumber.trim()) {
      alert('Please enter a passport number');
      return;
    }
    if (newMember.departments.length === 0) {
      alert('Please select at least one department');
      return;
    }

    setIsCreating(true);
    try {
      // Create new worker document (for leaderboard/points tracking only)
      const workerData = {
        firstName: newMember.firstName.trim(),
        lastName: newMember.lastName.trim(),
        email: '', // No email needed for display-only entries
        departments: newMember.departments,
        points: parseInt(newMember.points) || 0,
        profileColor: generateProfileColor(),
        isActive: true,
        createdAt: serverTimestamp(),
        lastLogin: null,
        sessionToken: null,
        tokenExpiry: null,
        passwordHash: null,
        salt: null
      };

      await addDoc(collection(db, 'workers'), workerData);

      alert(`Successfully created team member: ${newMember.firstName} ${newMember.lastName}`);

      setShowCreateModal(false);
      setNewMember({
        firstName: '',
        lastName: '',
        passportNumber: '',
        departments: [],
        points: 0
      });

      // Reload workers
      await loadWorkers();
    } catch (error) {
      console.error('Error creating team member:', error);
      alert('Error creating team member. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const departments = [
    'operations-logistics',
    'academic',
    'global-outreach',
    'student-engagement',
    'media-communications'
  ];

  const getDepartmentName = (dept) => {
    const names = {
      'operations-logistics': 'Operations & Logistics',
      'academic': 'Academic',
      'global-outreach': 'Global Outreach',
      'student-engagement': 'Student Engagement',
      'media-communications': 'Media & Communications'
    };
    return names[dept] || dept;
  };

  if (loading) {
    return (
      <div className="points-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="points-manager">
      <div className="points-manager-header">
        <div>
          <h2>Team Points Manager</h2>
          <p>Recognize and reward team members for their contributions</p>
        </div>
        <button className="create-member-btn" onClick={handleCreateMember}>
          <span className="material-icons-outlined">person_add</span>
          Create New Member
        </button>
      </div>

      <div className="points-manager-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterDepartment === 'all' ? 'active' : ''}`}
            onClick={() => setFilterDepartment('all')}
          >
            All Departments ({workers.length})
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              className={`filter-btn ${filterDepartment === dept ? 'active' : ''}`}
              onClick={() => setFilterDepartment(dept)}
            >
              {getDepartmentName(dept)} ({workers.filter(w => w.departments?.includes(dept)).length})
            </button>
          ))}
        </div>
      </div>

      <div className="participations-table-container">
        {filteredWorkers.length === 0 ? (
          <div className="no-participations">
            <span className="material-icons-outlined">groups</span>
            <h3>No Team Members Found</h3>
            <p>No team members match your current filters.</p>
          </div>
        ) : (
          <table className="participations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Departments</th>
                <th>Total Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td className="worker-name">
                    <div className="worker-name-cell">
                      <div className="worker-avatar" style={{ backgroundColor: worker.profileColor || '#A9D3D8' }}>
                        {worker.firstName?.[0]}{worker.lastName?.[0]}
                      </div>
                      <span>{worker.firstName} {worker.lastName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="department-badges">
                      {worker.departments?.map((dept, idx) => (
                        <span key={idx} className="department-badge">
                          {getDepartmentName(dept)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="points-badge awarded">
                      {worker.points || 0} pts
                    </span>
                  </td>
                  <td>
                    <button
                      className="award-points-btn"
                      onClick={() => handleAwardPoints(worker)}
                    >
                      <span className="material-icons-outlined">stars</span>
                      Award Points
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Award Points Modal */}
      {showModal && selectedWorker && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Award Points to Team Member</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="participation-details">
                <div className="detail-row">
                  <label>Team Member:</label>
                  <span>{selectedWorker.firstName} {selectedWorker.lastName}</span>
                </div>
                <div className="detail-row">
                  <label>Departments:</label>
                  <span>{selectedWorker.departments?.map(d => getDepartmentName(d)).join(', ')}</span>
                </div>
                <div className="detail-row">
                  <label>Current Total Points:</label>
                  <span className="current-points">{selectedWorker.points || 0} points</span>
                </div>
              </div>

              <div className="points-input-section">
                <label htmlFor="points-input">Points to Award:</label>
                <input
                  id="points-input"
                  type="number"
                  min="1"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(e.target.value)}
                  placeholder="Enter points (minimum 1)"
                  className="points-input"
                />
              </div>

              <div className="points-input-section">
                <label htmlFor="reason-input">Reason for Award:</label>
                <textarea
                  id="reason-input"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  placeholder="E.g., Outstanding event organization, Excellent teamwork, etc."
                  className="reason-textarea"
                  rows="3"
                />
                <small>Explain why this team member is receiving points</small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={submitPointsAward}>
                <span className="material-icons-outlined">check_circle</span>
                Award Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Member Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content create-member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Team Member</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="create-form">
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      value={newMember.firstName}
                      onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                      placeholder="Enter first name"
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName"
                      type="text"
                      value={newMember.lastName}
                      onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                      placeholder="Enter last name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="passportNumber">Passport Number *</label>
                    <input
                      id="passportNumber"
                      type="text"
                      value={newMember.passportNumber}
                      onChange={(e) => setNewMember({ ...newMember, passportNumber: e.target.value })}
                      placeholder="e.g., MX031"
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="initialPoints">Initial Points</label>
                    <input
                      id="initialPoints"
                      type="number"
                      min="0"
                      value={newMember.points}
                      onChange={(e) => setNewMember({ ...newMember, points: e.target.value })}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Departments * (Select at least one)</label>
                  <div className="department-checkboxes">
                    {departments.map(dept => (
                      <label key={dept} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newMember.departments.includes(dept)}
                          onChange={() => handleDepartmentToggle(dept)}
                        />
                        <span>{getDepartmentName(dept)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={submitCreateMember}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <span className="material-icons-outlined">check_circle</span>
                    Create Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsManager;
