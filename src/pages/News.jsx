import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import './News.css';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const q = query(
        collection(db, 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) || 'Recent'
      }));
      setNewsItems(newsData);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="news-page__background">
          <div className="news-page__gradient"></div>
          <div className="news-page__pattern"></div>
        </div>
        <div className="news-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-page__background">
        <div className="news-page__gradient"></div>
        <div className="news-page__pattern"></div>
      </div>
      
      <div className="container">
        <motion.header 
          className="news-header"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="news-title">MedXplore News</h1>
          <p className="news-subtitle">
            Stay updated with the latest happenings, achievements, and opportunities from the MedXplore community.
          </p>
        </motion.header>

        <motion.section 
          className="news-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
        {newsItems.length === 0 ? (
          <div className="no-news">
            <p>No news items available at the moment.</p>
          </div>
        ) : (
          newsItems.map((news, index) => (
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
                {news.date}
              </div>
            </motion.article>
          ))
        )}
        </motion.section>
      </div>
    </div>
  );
};

export default News;