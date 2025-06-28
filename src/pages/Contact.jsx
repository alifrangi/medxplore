import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
    <div className="contact">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="contact__content"
        >
          <div className="contact__header">
            <h1>Get in Touch</h1>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            <div className="contact__mission">
              <p>
                Bridging the gap between medical professionals and the latest advancements 
                in healthcare technology through innovation, education, and community.
              </p>
            </div>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="contact__form">
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

              <button type="submit" className="btn btn--primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          ) : (
            <div className="contact__success">
              <h2>Thank you!</h2>
              <p>Your message has been sent successfully. We'll get back to you within 2-3 business days.</p>
              <button onClick={() => setIsSubmitted(false)} className="btn btn--secondary">
                Send Another Message
              </button>
            </div>
          )}

          <div className="contact__info">
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact