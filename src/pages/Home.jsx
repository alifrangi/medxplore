import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__background">
          <div className="hero__gradient"></div>
          <div className="hero__pattern"></div>
        </div>
        
        <div className="container">
          <div className="hero__content">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hero__text"
            >
              <h1 className="hero__title">
                Med<span className="hero__title-accent">Xplore</span>
              </h1>
              <motion.p 
                className="hero__subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Explore - Experience - Excel
              </motion.p>
            </motion.div>

            <motion.div 
              className="hero__actions"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link to="/events" className="btn btn--primary">
                Explore Events
              </Link>
              <Link to="/passport" className="btn btn--secondary">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="features__header"
          >
            <h2>What We Offer</h2>
            <p>Comprehensive solutions for modern healthcare challenges</p>
          </motion.div>

          <div className="features__grid">
            {[
              {
                title: "Innovation",
                description: "Pioneering the future of medical technology and healthcare solutions.",
                icon: "🚀"
              },
              {
                title: "Education", 
                description: "Providing comprehensive resources and training for medical professionals.",
                icon: "📚"
              },
              {
                title: "Community",
                description: "Building a global network of healthcare innovators and practitioners.",
                icon: "🤝"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="feature-card__icon">{feature.icon}</div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="team__header"
          >
            <h2>Meet the Team</h2>
            <p>Passionate individuals driving innovation in healthcare</p>
          </motion.div>

          <motion.div 
            className="team__content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="team-member">
              <div className="team-member__info">
                <h3>Yazan Al Afrangi</h3>
                <p className="team-member__role">Founder & Medical Technology Innovator</p>
                <p className="team-member__description">
                  Passionate about revolutionizing healthcare through technology and innovation. 
                  Leading the charge in bridging medical expertise with cutting-edge solutions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="cta__content"
          >
            <h2>Ready to Explore?</h2>
            <p>Join us in revolutionizing the future of healthcare</p>
            <Link to="/contact" className="btn btn--primary btn--large">
              Get Started Today
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home