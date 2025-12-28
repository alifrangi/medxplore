import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PortalPage.css';

const PortalPage = () => {
  const navigate = useNavigate();

  const portalOptions = [
    {
      id: 'ideas',
      title: 'Ideas Board',
      description: 'Submit your event ideas and proposals for MedXplore programs',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="portal-icon">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/ideas',
      color: '#4CAF50',
      bgGradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Access the admin panel to manage and review submissions',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="portal-icon">
          <path d="M9 17V15M12 17V13M15 17V11M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      path: '/admin',
      color: '#2196F3',
      bgGradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
    }
  ];

  return (
    <div className="portal-page">
      <div className="portal-background">
        <div className="portal-bg-shape shape-1"></div>
        <div className="portal-bg-shape shape-2"></div>
        <div className="portal-bg-shape shape-3"></div>
      </div>

      <motion.div
        className="portal-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="portal-header">
          <motion.div
            className="portal-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="logo-text">MedXplore</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Admin Portal
          </motion.h1>
          <motion.p
            className="portal-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Choose how you would like to proceed
          </motion.p>
        </div>

        <div className="portal-cards">
          {portalOptions.map((option, index) => (
            <motion.button
              key={option.id}
              className="portal-card"
              style={{
                '--card-color': option.color,
                background: option.bgGradient
              }}
              onClick={() => navigate(option.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="card-icon-wrapper" style={{ backgroundColor: option.color }}>
                {option.icon}
              </div>
              <h2>{option.title}</h2>
              <p>{option.description}</p>
              <div className="card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="portal-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="/" className="back-home-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Home
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PortalPage;
