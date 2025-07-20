import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  getAllWorkers, 
  createWorker, 
  updateWorker, 
  deleteWorker 
} from '../services/database';
import './DepartmentWorkerManager.css';

const DepartmentWorkerManager = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    departments: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const departments = [
    { id: 'research', name: 'Research', emoji: '🧬' },
    { id: 'academic', name: 'Academic', emoji: '📚' },
    { id: 'global-outreach', name: 'Global Outreach', emoji: '🌍' },
    { id: 'student-engagement', name: 'Student Engagement', emoji: '🤝' },
    { id: 'media-communications', name: 'Media & Communications', emoji: '📢' }
  ];

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const result = await getAllWorkers();
      if (result.success) {
        setWorkers(result.workers);
      }
    } catch (error) {
      setError('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (!editingWorker && !formData.password) {
      setError('Password is required for new workers');
      return;
    }

    if (formData.departments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    try {
      if (editingWorker) {
        const result = await updateWorker(editingWorker.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          departments: formData.departments,
          ...(formData.password ? { password: formData.password } : {})
        });

        if (result.success) {
          setSuccess('Worker updated successfully');
          resetForm();
          loadWorkers();
        } else {
          setError(result.error || 'Failed to update worker');
        }
      } else {
        const result = await createWorker({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          departments: formData.departments
        });

        if (result.success) {
          setSuccess('Worker created successfully');
          resetForm();
          loadWorkers();
        } else {
          setError(result.error || 'Failed to create worker');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      password: '',
      departments: worker.departments
    });
    setShowAddForm(true);
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) {
      return;
    }

    try {
      const result = await deleteWorker(workerId);
      if (result.success) {
        setSuccess('Worker deleted successfully');
        loadWorkers();
      } else {
        setError(result.error || 'Failed to delete worker');
      }
    } catch (error) {
      setError('An error occurred while deleting the worker');
    }
  };

  const handleDepartmentToggle = (deptId) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(deptId)
        ? prev.departments.filter(d => d !== deptId)
        : [...prev.departments, deptId]
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      departments: []
    });
    setEditingWorker(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="worker-manager"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="manager-header">
        <h2>Department Workers</h2>
        <button 
          className="add-worker-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add New Worker
        </button>
      </div>

      {error && (
        <motion.div 
          className="alert alert-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="alert alert-success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}

      {showAddForm && (
        <motion.div 
          className="worker-form-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => e.target.className === 'worker-form-overlay' && resetForm()}
        >
          <motion.div 
            className="worker-form"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john.doe@example.com"
                  required
                />
                <small>This will be used for login (not a real email)</small>
              </div>

              <div className="form-group">
                <label>Password {editingWorker ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  required={!editingWorker}
                />
              </div>

              <div className="form-group">
                <label>Assigned Departments *</label>
                <div className="departments-grid">
                  {departments.map(dept => (
                    <label key={dept.id} className="department-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.departments.includes(dept.id)}
                        onChange={() => handleDepartmentToggle(dept.id)}
                      />
                      <span className="checkbox-label">
                        <span className="dept-emoji">{dept.emoji}</span>
                        {dept.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingWorker ? 'Update Worker' : 'Create Worker'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      <div className="workers-list">
        {workers.length === 0 ? (
          <div className="empty-state">
            <p>No workers found. Click "Add New Worker" to create one.</p>
          </div>
        ) : (
          <div className="workers-grid">
            {workers.map(worker => (
              <motion.div 
                key={worker.id} 
                className="worker-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="worker-header">
                  <div 
                    className="worker-avatar"
                    style={{ backgroundColor: worker.profileColor }}
                  >
                    {worker.firstName[0]}{worker.lastName[0]}
                  </div>
                  <div className="worker-info">
                    <h4>{worker.firstName} {worker.lastName}</h4>
                    <p>{worker.email}</p>
                  </div>
                </div>

                <div className="worker-departments">
                  {worker.departments.map(deptId => {
                    const dept = departments.find(d => d.id === deptId);
                    return dept ? (
                      <span key={deptId} className="department-tag">
                        {dept.emoji} {dept.name}
                      </span>
                    ) : null;
                  })}
                </div>

                <div className="worker-meta">
                  <p className="status">
                    Status: <span className={worker.isActive ? 'active' : 'inactive'}>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  {worker.lastLogin && (
                    <p className="last-login">
                      Last login: {new Date(worker.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="worker-actions">
                  <button 
                    onClick={() => handleEdit(worker)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={async () => {
                      const result = await updateWorker(worker.id, { isActive: !worker.isActive });
                      if (result.success) {
                        setSuccess(`Worker ${worker.isActive ? 'deactivated' : 'activated'} successfully`);
                        loadWorkers();
                      } else {
                        setError('Failed to update worker status');
                      }
                    }}
                    className={worker.isActive ? 'deactivate-btn' : 'activate-btn'}
                  >
                    {worker.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    onClick={() => handleDelete(worker.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DepartmentWorkerManager;