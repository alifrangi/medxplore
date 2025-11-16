import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllNews, createNews, updateNews, deleteNews } from '../services/database';
import './NewsManager.css';

const NewsManager = ({ workerId, workerName }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    published: true
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const newsData = await getAllNews();
      setNews(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingNews) {
        // Update existing news
        const result = await updateNews(editingNews.id, formData);
        if (result.success) {
          alert('News updated successfully!');
        } else {
          alert('Failed to update news: ' + result.error);
        }
      } else {
        // Create new news
        const result = await createNews({
          ...formData,
          authorId: workerId || 'worker',
          authorName: workerName || 'Worker'
        });
        if (result.success) {
          alert('News created successfully!');
        } else {
          alert('Failed to create news: ' + result.error);
        }
      }

      setFormData({
        title: '',
        content: '',
        category: 'general',
        published: true
      });
      setShowForm(false);
      setEditingNews(null);
      await loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error saving news. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category || 'general',
      published: newsItem.published !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (newsId) => {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await deleteNews(newsId);
      if (result.success) {
        await loadNews();
        alert('News deleted successfully!');
      } else {
        alert('Failed to delete news: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Error deleting news. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="news-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
    );
  }

  return (
    <div className="news-manager">
      <div className="manager-header">
        <h2>News Management</h2>
        <button
          className="create-btn"
          onClick={() => {
            setFormData({
              title: '',
              content: '',
              category: 'general',
              published: true
            });
            setEditingNews(null);
            setShowForm(true);
          }}
        >
          + Create News
        </button>
      </div>

      <div className="news-grid">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-card-header">
              <div>
                <h3>{item.title}</h3>
                {item.category && (
                  <span className={`category-badge category-${item.category}`}>
                    {item.category}
                  </span>
                )}
              </div>
              <div className="news-status">
                <span className={`status-badge ${item.published ? 'published' : 'draft'}`}>
                  {item.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            <p className="news-content">{item.content}</p>

            <div className="news-meta">
              <span className="news-date">
                Created: {formatDate(item.createdAt)}
              </span>
              {item.updatedAt && item.createdAt !== item.updatedAt && (
                <span className="news-date">
                  Updated: {formatDate(item.updatedAt)}
                </span>
              )}
            </div>

            <div className="news-actions">
              <button
                className="edit-btn"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(item.id)}
                disabled={actionLoading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="no-news">
            <p>No news articles yet</p>
            <button
              className="create-first-btn"
              onClick={() => setShowForm(true)}
            >
              Create Your First News Article
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit News Modal */}
      {showForm && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setShowForm(false);
            setEditingNews(null);
          }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingNews ? 'Edit News' : 'Create News'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingNews(null);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter news title"
                  />
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows="8"
                    required
                    placeholder="Write your news content here..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="event">Event</option>
                      <option value="achievement">Achievement</option>
                      <option value="update">Update</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.published ? 'published' : 'draft'}
                      onChange={(e) => setFormData({ ...formData, published: e.target.value === 'published' })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : (editingNews ? 'Update News' : 'Create News')}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNews(null);
                  }}
                >
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

export default NewsManager;
