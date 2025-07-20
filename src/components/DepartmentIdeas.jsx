import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkerAuth } from '../contexts/WorkerAuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import './DepartmentIdeas.css';

const DepartmentIdeas = ({ departmentId, departmentName }) => {
  const { worker } = useWorkerAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: 'general' });
  const [editingId, setEditingId] = useState(null);
  const [editingIdea, setEditingIdea] = useState({ title: '', description: '', category: 'general' });

  useEffect(() => {
    // Subscribe to ideas
    const ideasQuery = query(
      collection(db, `departments/${departmentId}/ideas`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setIdeas(ideasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [departmentId]);

  const getUserInfo = () => {
    if (worker) {
      return {
        name: `${worker.firstName} ${worker.lastName}`,
        role: 'Worker',
        id: worker.id
      };
    }
    return null;
  };

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    
    if (!newIdea.title.trim() || !newIdea.description.trim()) return;
    
    const userInfo = getUserInfo();
    if (!userInfo) return;

    try {
      await addDoc(collection(db, `departments/${departmentId}/ideas`), {
        ...newIdea,
        status: 'pending',
        userId: userInfo.id,
        userName: userInfo.name,
        userRole: userInfo.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        comments: []
      });

      setNewIdea({ title: '', description: '', category: 'general' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding idea:', error);
    }
  };

  const handleUpdateIdea = async (ideaId) => {
    if (!editingIdea.title.trim() || !editingIdea.description.trim()) return;

    try {
      await updateDoc(doc(db, `departments/${departmentId}/ideas`, ideaId), {
        title: editingIdea.title,
        description: editingIdea.description,
        category: editingIdea.category,
        updatedAt: serverTimestamp()
      });

      setEditingId(null);
      setEditingIdea({ title: '', description: '', category: 'general' });
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;

    try {
      await deleteDoc(doc(db, `departments/${departmentId}/ideas`, ideaId));
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleToggleLike = async (ideaId, currentLikes) => {
    const userInfo = getUserInfo();
    if (!userInfo) return;

    const isLiked = currentLikes.includes(userInfo.id);
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== userInfo.id)
      : [...currentLikes, userInfo.id];

    try {
      await updateDoc(doc(db, `departments/${departmentId}/ideas`, ideaId), {
        likes: newLikes
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleStatusChange = async (ideaId, newStatus) => {
    try {
      await updateDoc(doc(db, `departments/${departmentId}/ideas`, ideaId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: 'lightbulb',
      event: 'event',
      improvement: 'trending_up',
      research: 'science',
      collaboration: 'group_work'
    };
    return icons[category] || 'lightbulb';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA726',
      approved: '#66BB6A',
      'in-progress': '#42A5F5',
      completed: '#AB47BC',
      rejected: '#EF5350'
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return (
      <div className="department-ideas-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const userInfo = getUserInfo();
  const isAdmin = false; // Workers are not admins

  return (
    <div className="department-ideas-container">
      <div className="ideas-header">
        <h3>{departmentName} Ideas Board</h3>
        <button 
          className="add-idea-button"
          onClick={() => setShowAddForm(true)}
        >
          <span className="material-icons-outlined">add</span>
          New Idea
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="add-idea-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={handleSubmitIdea}>
              <input
                type="text"
                placeholder="Idea title..."
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="idea-input"
                maxLength={100}
                required
              />
              <textarea
                placeholder="Describe your idea..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="idea-textarea"
                rows={4}
                maxLength={500}
                required
              />
              <div className="form-actions">
                <select
                  value={newIdea.category}
                  onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                  className="category-select"
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="improvement">Improvement</option>
                  <option value="research">Research</option>
                  <option value="collaboration">Collaboration</option>
                </select>
                <div className="form-buttons">
                  <button type="button" onClick={() => setShowAddForm(false)} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Submit Idea
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ideas-list">
        {ideas.length === 0 ? (
          <div className="no-ideas">
            <span className="material-icons-outlined">emoji_objects</span>
            <p>No ideas yet. Be the first to share!</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <motion.div
              key={idea.id}
              className="idea-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
            >
              <div className="idea-header">
                <div className="idea-meta">
                  <span className="material-icons-outlined category-icon">
                    {getCategoryIcon(idea.category)}
                  </span>
                  <span className="idea-author">{idea.userName}</span>
                  <span className="idea-role">{idea.userRole}</span>
                  <span 
                    className="idea-status"
                    style={{ backgroundColor: getStatusColor(idea.status) }}
                  >
                    {idea.status}
                  </span>
                </div>
                {(isAdmin || idea.userId === userInfo?.id) && (
                  <div className="idea-actions">
                    {isAdmin && (
                      <select
                        value={idea.status}
                        onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                    <button
                      onClick={() => {
                        setEditingId(idea.id);
                        setEditingIdea({
                          title: idea.title,
                          description: idea.description,
                          category: idea.category
                        });
                      }}
                      className="icon-button"
                    >
                      <span className="material-icons-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="icon-button delete"
                    >
                      <span className="material-icons-outlined">delete</span>
                    </button>
                  </div>
                )}
              </div>

              {editingId === idea.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingIdea.title}
                    onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                    className="idea-input"
                  />
                  <textarea
                    value={editingIdea.description}
                    onChange={(e) => setEditingIdea({ ...editingIdea, description: e.target.value })}
                    className="idea-textarea"
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button onClick={() => setEditingId(null)} className="cancel-button">
                      Cancel
                    </button>
                    <button onClick={() => handleUpdateIdea(idea.id)} className="submit-button">
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="idea-title">{idea.title}</h4>
                  <p className="idea-description">{idea.description}</p>
                </>
              )}

              <div className="idea-footer">
                <button
                  onClick={() => handleToggleLike(idea.id, idea.likes || [])}
                  className={`like-button ${idea.likes?.includes(userInfo?.id) ? 'liked' : ''}`}
                >
                  <span className="material-icons-outlined">
                    {idea.likes?.includes(userInfo?.id) ? 'favorite' : 'favorite_border'}
                  </span>
                  <span>{idea.likes?.length || 0}</span>
                </button>
                <span className="idea-date">
                  {idea.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentIdeas;