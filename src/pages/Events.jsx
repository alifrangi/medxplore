import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Events.css'

const Events = () => {
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
            Swipe through our events and stay updated with everything from immersive simulations to national workshops.
          </p>
        </motion.header>

        <motion.section 
          className="events-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="events-card">
            <h2>No Upcoming Events</h2>
            <p>
              We're currently brewing something exciting!<br />
              Follow our socials and stay tuned for amazing healthcare innovation events.
            </p>
            <div className="events-socials">
              <h3>Stay Connected</h3>
              <span>WhatsApp: Medxplore_nsa</span>
              <span>Instagram: Coming Soon!</span>
            </div>
          </div>
        </motion.section>
      </div>


      <footer className="events-footer">
        2025 MedXplore | Founder Yazan Alafrangi
      </footer>
    </div>
  )
}

export default Events