import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllEvents } from '../services/database';
import Icon from './shared/Icon';
import './UpcomingEvents.css';

const UpcomingEvents = ({ departmentFilter = null, limit = 5 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      
      // Filter future events only
      const now = new Date();
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = event.date?.toDate?.() || new Date(event.date);
        return eventDate > now;
      });

      // Sort by date ascending (nearest first)
      upcomingEvents.sort((a, b) => {
        const dateA = a.date?.toDate?.() || new Date(a.date);
        const dateB = b.date?.toDate?.() || new Date(b.date);
        return dateA - dateB;
      });

      setEvents(upcomingEvents.slice(0, limit));
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (date) => {
    if (!date) return 'Date TBD';
    
    const eventDate = date.toDate?.() || new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: eventDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      workshop: 'Wrench',
      conference: 'Users',
      seminar: 'GraduationCap',
      networking: 'Share2',
      research: 'Microscope',
      clinical: 'Stethoscope'
    };
    return icons[category] || 'Calendar';
  };

  const getCategoryColor = (category) => {
    const colors = {
      workshop: '#4CAF50',
      conference: '#2196F3',
      seminar: '#FF9800',
      networking: '#9C27B0',
      research: '#00BCD4',
      clinical: '#F44336'
    };
    return colors[category] || '#757575';
  };

  if (loading) {
    return (
      <div className="upcoming-events-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.category === filter);

  return (
    <div className="upcoming-events-container">
      <div className="upcoming-events-header">
        <h2>Upcoming Events</h2>
        <div className="event-filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'workshop' ? 'active' : ''}
            onClick={() => setFilter('workshop')}
          >
            Workshops
          </button>
          <button 
            className={filter === 'conference' ? 'active' : ''}
            onClick={() => setFilter('conference')}
          >
            Conferences
          </button>
          <button 
            className={filter === 'seminar' ? 'active' : ''}
            onClick={() => setFilter('seminar')}
          >
            Seminars
          </button>
        </div>
      </div>

      <div className="upcoming-events-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="upcoming-event-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className="event-category-indicator"
                style={{ backgroundColor: getCategoryColor(event.category) }}
              >
                <Icon name={getCategoryIcon(event.category)} size={20} color="#fff" />
              </div>
              
              <div className="event-content">
                <div className="event-header">
                  <h3>{event.name}</h3>
                  <span className="event-date-badge">
                    {formatEventDate(event.date)}
                  </span>
                </div>
                
                <p className="event-description">{event.description}</p>
                
                <div className="event-meta">
                  <span className="event-location">
                    <Icon name="MapPin" size={14} />
                    {event.location}
                  </span>
                  <span className="event-time">
                    <Icon name="Clock" size={14} />
                    {event.time || 'Time TBD'}
                  </span>
                  {event.department && (
                    <span className="event-department">
                      <Icon name="Building2" size={14} />
                      {event.department}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-upcoming-events">
            <Icon name="CalendarX" size={48} />
            <p>No upcoming events at the moment</p>
          </div>
        )}
      </div>

      {events.length > limit && (
        <div className="view-all-events">
          <a href="/events" className="view-all-link">
            View all events
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;