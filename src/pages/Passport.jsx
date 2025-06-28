import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Passport.css'

const Passport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    year: '',
    interests: '',
    experience: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('https://formspree.io/f/xblyqdjg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          university: '',
          year: '',
          interests: '',
          experience: ''
        })
        // Trigger confetti
        if (window.confetti) {
          window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
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

  const handleNewForm = () => {
    setIsSubmitted(false)
  }

  return (
    <div className="passport-page">
      <div className="passport-page__background">
        <div className="passport-page__gradient"></div>
        <div className="passport-page__pattern"></div>
      </div>
      
      <div className="container">
        <motion.header 
          className="passport-header"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="passport-title">The Passport</h1>
          <p className="passport-subtitle">
            Join the MedXplore community and unlock exclusive access to events, resources, and networking opportunities in healthcare innovation.
          </p>
        </motion.header>

        <motion.section 
          className="passport-container"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="passport-form-card">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
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
                  <label htmlFor="email">Email Address *</label>
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
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="university">University/Institution *</label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year of Study *</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
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
                    <option value="Resident">Resident</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="interests">Areas of Interest</label>
                  <textarea
                    id="interests"
                    name="interests"
                    rows="3"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g., Surgery, Research, Technology, Public Health..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Previous Experience (Optional)</label>
                  <textarea
                    id="experience"
                    name="experience"
                    rows="3"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Any relevant medical or research experience..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading && <div className="loading-spinner"></div>}
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            ) : (
              <div className="success-message">
                <h2>Welcome to MedXplore!</h2>
                <p>
                  Your passport application has been submitted successfully. 
                  You'll receive a confirmation email shortly with next steps and exclusive access information.
                </p>
                <button onClick={handleNewForm} className="new-form-btn">
                  Submit Another Application
                </button>
              </div>
            )}
          </div>
        </motion.section>
      </div>

    </div>
  )
}

export default Passport