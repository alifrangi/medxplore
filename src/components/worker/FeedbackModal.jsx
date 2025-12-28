import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Icon from '../shared/Icon';
import { useToast } from '../shared/Toast';
import { submitFeedback } from '../../services/database';
import './FeedbackModal.css';

const FeedbackModal = ({ isOpen, onClose, currentUser }) => {
  const toast = useToast();
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { id: 'suggestion', label: 'Suggestion', icon: 'Lightbulb' },
    { id: 'bug', label: 'Bug Report', icon: 'Bug' },
    { id: 'feature', label: 'Feature Request', icon: 'Sparkles' },
    { id: 'other', label: 'Other', icon: 'MessageCircle' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        type: feedbackType,
        message: message.trim(),
        userName: currentUser?.name || 'Anonymous',
        userEmail: currentUser?.email || null,
        university: currentUser?.university || null,
        unit: currentUser?.units?.[0] || null
      };

      const result = await submitFeedback(feedbackData);

      if (result.success) {
        toast.success('Thank you for your feedback!');
        setMessage('');
        setFeedbackType('suggestion');
        onClose();
      } else {
        toast.error(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage('');
      setFeedbackType('suggestion');
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="feedback-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="feedback-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="feedback-modal__header">
            <h2>Send Feedback</h2>
            <button
              className="feedback-modal__close"
              onClick={handleClose}
              disabled={loading}
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="feedback-modal__form">
            <div className="feedback-modal__types">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={`feedback-type-btn ${feedbackType === type.id ? 'active' : ''}`}
                  onClick={() => setFeedbackType(type.id)}
                >
                  <Icon name={type.icon} size={18} />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            <div className="feedback-modal__field">
              <label htmlFor="feedback-message">Your Feedback</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                rows={5}
                disabled={loading}
              />
            </div>

            <div className="feedback-modal__footer">
              <button
                type="button"
                className="feedback-modal__cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="feedback-modal__submit"
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default FeedbackModal;
