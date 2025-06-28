import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './News.css';

const News = () => {
  const [showOAPOForm, setShowOAPOForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    yearOfStudy: '',
    whyPosition: '',
    experience: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://formspree.io/f/xkgbkewp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          subject: `OAPO Application - ${formData.name}`,
          applicationType: 'OAPO Position'
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          yearOfStudy: '',
          whyPosition: '',
          experience: ''
        });
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      alert('Error submitting application. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const newsItems = [
    {
      id: 3,
      title: "Join Our Team: Outreach & Partnerships Officer Position Available",
      content: "MedXplore is seeking a passionate and dedicated Outreach & Partnerships Officer (OAPO) to join our growing team. We're looking for someone who can help us build meaningful connections and expand our impact in the medical education community. This is an excellent opportunity for students passionate about outreach, partnerships, and making a meaningful impact in medical education. Join us in shaping the future of medical education!",
      date: "June 29, 2025",
      category: "Career Opportunity",
      hasForm: true,
    },
    {
      id: 2,
      title: "MedXplore Joins Forces with NSA",
      content: "We're proud to announce our official collaboration with the NSA. MedXplore is now part of the NSA team, working together to bring more opportunities to students. NSA will also start posting updates about MedXplore events and initiatives across their platforms.",
      date: "June 26, 2025",
      category: "Partnership",
    },
    {
      id: 1,
      title: "Launch of MedXperience Passport",
      content: "We're excited to introduce the MedXperience Passport — your personalized tracker for activities and milestones!",
      date: "June 20, 2025",
      category: "Product Launch",
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
            
            {news.hasForm && (
              <div style={{ marginTop: '1.5rem' }}>
                {!showOAPOForm ? (
                  <button 
                    onClick={() => setShowOAPOForm(true)}
                    className="apply-btn"
                  >
                    Apply Now
                  </button>
                ) : !isSubmitted ? (
                  <div className="oapo-form">
                    <h4>OAPO Application Form</h4>
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="yearOfStudy">Current Year of Study *</label>
                        <select
                          id="yearOfStudy"
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select your year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="5th Year">5th Year</option>
                          <option value="6th Year">6th Year</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="whyPosition">Why do you think this position suits you? *</label>
                        <textarea
                          id="whyPosition"
                          name="whyPosition"
                          rows="4"
                          value={formData.whyPosition}
                          onChange={handleInputChange}
                          placeholder="Tell us about your passion for outreach and partnerships..."
                          required
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label htmlFor="experience">Previous Experience (Optional)</label>
                        <textarea
                          id="experience"
                          name="experience"
                          rows="3"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="Any relevant experience in outreach, partnerships, or similar roles..."
                        ></textarea>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                          {isLoading && <span className="loading-spinner"></span>}
                          {isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowOAPOForm(false)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="success-message">
                    <h4>Application Submitted!</h4>
                    <p>Thank you for your interest in the OAPO position. We will review your application and get in contact with you within 1-3 days.</p>
                    <button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setShowOAPOForm(false);
                      }}
                      className="new-application-btn"
                    >
                      Submit Another Application
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="news-date">
              {news.date}
            </div>
          </motion.article>
        ))}
      </div>

    </div>
  );
};

export default News;