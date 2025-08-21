import React from 'react'
import { motion } from 'framer-motion'
import './Contact.css'

const Contact = () => {

  return (
    <div className="contact-page">
      <div className="contact-page__background">
        <div className="contact-page__gradient"></div>
        <div className="contact-page__pattern"></div>
      </div>

      <div className="contact-header">
        <motion.h1 
          className="contact-title"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Get in Touch
        </motion.h1>
        <motion.p 
          className="contact-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Connect with us through our social media channels
        </motion.p>
      </div>

      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="contact-form-card"
        >
          

          <div className="contact__info" style={{ marginTop: '2rem' }}>
            <div className="contact__item">
              <h3>Instagram</h3>
              <p>@eduxplore_official</p>
            </div>
            <div className="contact__item">
              <h3>WhatsApp</h3>
              <p>Coming Soon</p>
            </div>
            <div className="contact__item">
              <h3>Email</h3>
              <p>Coming Soon</p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default Contact