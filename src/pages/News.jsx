import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './News.css';

const News = () => {
  const navigate = useNavigate();

  const newsItems = [
    {
      id: 1,
      title: "Launch of MedXperience Passport",
      content: "We're excited to introduce the MedXperience Passport — your personalized tracker for activities and milestones!",
      date: "June 20, 2025",
      category: "Product Launch",
    },
    {
      id: 2,
      title: "MedXplore Joins Forces with NSA",
      content: "We're proud to announce our official collaboration with the NSA. MedXplore is now part of the NSA team, working together to bring more opportunities to students. NSA will also start posting updates about MedXplore events and initiatives across their platforms.",
      date: "June 26, 2025",
      category: "Partnership",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 2,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div 
      className="news-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Pattern */}
      <div className="background-pattern">
        <motion.div 
          className="pattern-grid"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="news-header"
        variants={itemVariants}
      >
        <motion.h1 
          className="news-title"
          animate={{
            textShadow: [
              "0 0 5px rgba(169, 211, 216, 0.5)",
              "0 0 20px rgba(169, 211, 216, 0.9)",
              "0 0 5px rgba(169, 211, 216, 0.5)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          MedXplore News
        </motion.h1>
        <motion.p 
          className="news-subtitle"
          variants={itemVariants}
        >
          Stay updated with the latest happenings, achievements, and opportunities from the MedXplore community.
        </motion.p>
      </motion.header>

      {/* News Container */}
      <motion.section 
        className="news-container"
        variants={itemVariants}
      >
        {newsItems.map((news, index) => (
          <motion.article
            key={news.id}
            className="news-card"
            variants={cardVariants}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            custom={index}
          >
            <motion.div 
              className="card-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <motion.div 
                className="news-category"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {news.category}
              </motion.div>
              
              <motion.h3 
                className="news-card-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {news.title}
              </motion.h3>
              
              <motion.p 
                className="news-card-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {news.content}
              </motion.p>
              
              <motion.div 
                className="news-date"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <span className="date-icon">📅</span>
                {news.date}
              </motion.div>
            </motion.div>
            
            {/* Card Hover Effect */}
            <motion.div 
              className="card-glow"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.article>
        ))}
      </motion.section>

      {/* Back to Home Button */}
      <motion.button
        className="back-home-btn"
        onClick={() => navigate('/')}
        whileHover={{ 
          scale: 1.05, 
          y: -2,
          boxShadow: "0 5px 20px rgba(169, 211, 216, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        ← Back to Home
      </motion.button>

      {/* Footer */}
      <motion.footer 
        className="news-footer"
        variants={itemVariants}
      >
        <p>2025 MedXplore | Founder Yazan Alafrangi</p>
      </motion.footer>
    </motion.div>
  );
};

export default News;