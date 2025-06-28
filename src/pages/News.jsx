import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './News.css';

const News = () => {
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

  return (
    <div className="news-page">
      <div className="news-page__background">
        <div className="news-page__gradient"></div>
        <div className="news-page__pattern"></div>
      </div>

      <div className="news-header">
        <motion.h1 
          className="news-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          MedXplore News
        </motion.h1>
        <motion.p 
          className="news-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Stay updated with the latest happenings, achievements, and opportunities from the MedXplore community.
        </motion.p>
      </div>

      <div className="news-container">
        {newsItems.map((news, index) => (
          <motion.article
            key={news.id}
            className="news-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="news-category">
              {news.category}
            </div>
            
            <h3 className="news-card-title">
              {news.title}
            </h3>
            
            <p className="news-card-content">
              {news.content}
            </p>
            
            <div className="news-date">
              <span>📅</span>
              {news.date}
            </div>
          </motion.article>
        ))}
      </div>

      <Link to="/" className="back-home-btn">
        ← Back to Home
      </Link>
    </div>
  );
};

export default News;