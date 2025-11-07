import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllEvents } from '../services/database'
import './Events.css'

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await getAllEvents();
      // Filter for upcoming and current events
      const currentDate = new Date();
      const upcomingEvents = eventsData.filter(event => {
        const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date);
        return eventDate >= currentDate;
      });
      setEvents(upcomingEvents);
    } catch (error) {
      // Error loading events
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBD';
    
    try {
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Handle Firestore timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Date TBD';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date TBD';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      // Error formatting date
      return 'Date TBD';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      workshop: '#4CAF50',
      seminar: '#2196F3', 
      conference: '#FF9800',
      webinar: '#9C27B0',
      networking: '#F44336',
      other: '#607D8B'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="events-page">
      <div className="events-page__background">
        <div className="events-page__gradient"></div>
        <div className="events-page__pattern"></div>
      </div>
      
      <div className="container">
        <motion.header 
          className="events-header"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="events-title">MedXplore Events</h1>
          <p className="events-subtitle">
            Join our upcoming events and expand your medical knowledge through immersive workshops, seminars, and networking opportunities.
          </p>
        </motion.header>

        <motion.section 
          className="events-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {loading ? (
            <div className="events-loading">
              <div className="loading-spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="event-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="event-header">
                    <span 
                      className="event-category"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    >
                      {event.category}
                    </span>
                    <h3 className="event-title">{event.name}</h3>
                  </div>

                  <div className="event-content">
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <div className="event-detail">
                        <span className="detail-icon">📅</span>
                        <div className="detail-content">
                          <span className="detail-label">Date</span>
                          <span className="detail-value">{formatDate(event.date)}</span>
                        </div>
                      </div>

                      <div className="event-detail">
                        <span className="detail-icon">📍</span>
                        <div className="detail-content">
                          <span className="detail-label">Location</span>
                          <span className="detail-value">{event.location}</span>
                        </div>
                      </div>

                      {event.maxParticipants && (
                        <div className="event-detail">
                          <span className="detail-icon">👥</span>
                          <div className="detail-content">
                            <span className="detail-label">Max Participants</span>
                            <span className="detail-value">{event.maxParticipants}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="event-footer">
                    {event.googleFormsLink ? (
                      <a 
                        href={event.googleFormsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="register-button"
                      >
                        Register via Google Form
                      </a>
                    ) : (
                      <Link to="/passport/apply" className="register-button">
                        Apply for Passport to Join
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="no-events-card">
              <h2>No Upcoming Events</h2>
              <p>
                We're currently planning exciting new events!<br />
                Follow our socials and stay tuned for amazing healthcare innovation events.
              </p>
              <div className="events-socials">
                <h3>Stay Connected</h3>
                <span>WhatsApp: Coming Soon!</span>
                <span>Instagram: @medxorg</span>
              </div>
              <Link to="/passport/apply" className="passport-cta">
                Apply for Your MedXperience Passport
              </Link>
            </div>
          )}
        </motion.section>
      </div>

      <footer className="events-footer">
        2025 MedXplore | Founder Yazan Alafrangi
      </footer>
    </div>
  )
}

export default Events