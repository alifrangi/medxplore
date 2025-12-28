import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import Icon from '../components/shared/Icon';
import './AdminNews.css';

const AdminNews = () => {
  const navigate = useNavigate();
  const { adminData } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    published: true
  });

  useEffect(() => {
    if (!adminData) {
      navigate('/admin');
    } else {
      loadNews();
    }
  }, [adminData, navigate]);

  const loadNews = async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingNews) {
        // Update existing news
        await updateDoc(doc(db, 'news', editingNews.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new news
        await addDoc(collection(db, 'news'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setFormData({
        title: '',
        content: '',
        category: '',
        published: true
      });
      setShowForm(false);
      setEditingNews(null);
      await loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error saving news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category,
      published: newsItem.published
    });
    setShowForm(true);
  };

  const handleDelete = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteDoc(doc(db, 'news', newsId));
        await loadNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error deleting news. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      category: '',
      published: true
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-news">
      <div className="admin-header">
        <div className="header-content">
          <div>
            <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
            <h1>News Management</h1>
          </div>
          <button 
            className="create-news-btn"
            onClick={() => setShowForm(true)}
          >
            Create New Post
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <motion.div 
            className="news-form-modal"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={handleCancel}>
              <Icon name="X" size={20} />
            </button>
            <h2 className={editingNews ? 'form-title edit-title' : 'form-title add-title'}>
              {editingNews ? 'Edit News' : 'Add News Post'}
            </h2>
            <form onSubmit={handleSubmit} className="news-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Event">Event</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Career Opportunity">Career Opportunity</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Update">Update</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="6"
                  required
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  Publish immediately
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingNews ? 'Update News' : 'Create News'}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="news-container">
        {news.length > 0 && (
          <div className="news-grid">
            {news.map((newsItem) => (
                <motion.div 
                  key={newsItem.id} 
                  className="news-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="news-header">
                    <span className={`news-category ${newsItem.category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {newsItem.category}
                    </span>
                    <span className={`news-status ${newsItem.published ? 'published' : 'draft'}`}>
                      {newsItem.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  <h3>{newsItem.title}</h3>
                  <p className="news-content">{newsItem.content}</p>
                  
                  <div className="news-meta">
                    <span className="news-date">
                      {newsItem.createdAt ? newsItem.createdAt.toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="news-actions">
                    <button onClick={() => handleEdit(newsItem)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(newsItem.id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {news.length === 0 && (
          <div className="no-news">
            <h3>No News Posts Yet</h3>
            <p>Create your first news post to get started!</p>
            <button 
              className="create-news-btn"
              onClick={() => setShowForm(true)}
            >
              Create New Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNews;