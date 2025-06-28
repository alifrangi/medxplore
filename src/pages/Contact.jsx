import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('https://formspree.io/f/xpwrkbgy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      alert('Error submitting form. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>
      </div>

      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="contact-form-card"
        >
          <div className="contact__mission">
            <p>
              Bridging the gap between medical professionals and the latest advancements 
              in healthcare technology through innovation, education, and community.
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading && <span className="loading-spinner"></span>}
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <h2>Thank you!</h2>
              <p>Your message has been sent successfully. We'll get back to you within 2-3 business days.</p>
              <button onClick={() => setIsSubmitted(false)} className="new-form-btn">
                Send Another Message
              </button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="contact__info"
        >
          <div className="contact__item">
            <h3>Email</h3>
            <p>registration@medxplore.net</p>
          </div>
          <div className="contact__item">
            <h3>WhatsApp</h3>
            <p>Join our NSA WhatsApp Community</p>
          </div>
          <div className="contact__item">
            <h3>Instagram</h3>
            <p>Coming Soon!</p>
          </div>
        </motion.div>
      </div>

    </div>
  )
}

export default Contact