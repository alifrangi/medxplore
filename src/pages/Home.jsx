import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const heroRef = useRef(null)

  useEffect(() => {
    let vantaEffect = null
    
    const initVanta = () => {
      if (window.VANTA && heroRef.current) {
        vantaEffect = window.VANTA.FOG({
          el: heroRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0xfaf8f1,
          midtoneColor: 0xa9d3d8,
          lowlightColor: 0xfaf8f1,
          baseColor: 0xfaf8f1,
          blurFactor: 0.6,
          speed: 1.10,
          zoom: 1.10
        })
      }
    }

    // Initialize Vanta after a short delay to ensure scripts are loaded
    const timer = setTimeout(initVanta, 100)

    return () => {
      clearTimeout(timer)
      if (vantaEffect) {
        vantaEffect.destroy()
      }
    }
  }, [])

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        
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
            <p>We help medical students unlock their potential, expand their knowledge, and achieve excellence in their healthcare journey</p>
          </motion.div>

          <div className="features__grid">
            {[
              {
                title: "Excellence",
                description: "Empowering medical students to excel in their studies and develop into exceptional healthcare professionals.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a9d3d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26 12,2"/>
                  </svg>
                )
              },
              {
                title: "Growth", 
                description: "Providing hands-on experiences and advanced learning opportunities to accelerate your medical education journey.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a9d3d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                )
              },
              {
                title: "Achievement",
                description: "Supporting medical students in reaching their academic goals and building successful healthcare careers.",
                icon: (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a9d3d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                )
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
            <h1 className="team__title">
              Med<span className="team__title-accent">X</span><span className="team__title-accent">plore</span>
              <span className="team__title-script">Team</span>
            </h1>
          </motion.div>

          <motion.div 
            className="team__content"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {/* Divider line like hero */}
            <div className="team__divider">
              <div className="team__divider-line"></div>
            </div>

            {/* Team Members List */}
            <div className="team__members-list">
              {[
                {
                  id: 1,
                  name: "Yazan Al Afrangi",
                  role: "FOUNDER",
                  description: "A medical student with a tendency to turn ideas into full-scale projects. I created MedXplore to bridge the gap between education and experience — and maybe also because I can't sit still when something can be done better. I don't have all the answers, but I know how to start asking the right questions.",
                  image: "/yazan.png"
                },
                {
                  id: 2,
                  name: "Ammar Ashour",
                  role: "HEAD OF ACADEMIC DEVELOPMENT",
                  description: "Designing, overseeing, and presenting educational content to ensure that the program aligns with Evidence-based worldwide medical standards.",
                  image: "/hoad.jpg"
                },
                {
                  id: 3,
                  name: "Rahma Alyabroudi",
                  role: "FOUNDATIONS & READINESS DIRECTOR",
                  description: "Strong foundations don't just support growth — they shape its direction. At MedXplore, I ensure readiness is never an afterthought, but the starting point of every journey.",
                  image: "/fard.jpg"
                },
                {
                  id: 4,
                  name: "About to come!",
                  role: "OUTREACH & PARTNERSHIPS OFFICER",
                  description: "Coming soon to help build partnerships and create opportunities for community engagement and outreach programs.",
                  image: null
                },
                {
                  id: 5,
                  name: "Shahad Samarat",
                  role: "MEDIA & COMMUNICATIONS LEAD",
                  description: "Motivated by the value of shared knowledge, I aim to guide students with care, precision, and a spirit of collaboration.",
                  image: "/macl.jpg"
                },
                {
                  id: 6,
                  name: "Yazan Jarrar",
                  role: "WEBSITE & TECH MANAGER",
                  description: "I make the website work, look cool, and break only on Mondays. German efficiency? Yes. But also German sarcasm, so beware. If the button doesn't work — it's probably your fault. Also, I don't just fix code, I judge your font choices too.",
                  image: "/watm.jpg"
                },
                {
                  id: 7,
                  name: "Sedra Jibreen",
                  role: "STUDENT ENGAGEMENT LEAD",
                  description: "A passionate dental student dedicated to volunteer work and enhancing the student experience through active listening and meaningful communication. 'Real change begins when we listen with our hearts, not just our ears.'",
                  image: "/sel.jpg"
                }
              ].map((member, index) => (
                <motion.div
                  key={member.id}
                  className="team__member"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="team__member-circle">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="team__member-image"
                      />
                    ) : (
                      <div className="team__avatar-placeholder"></div>
                    )}
                  </div>
                  <div className="team__member-info">
                    <h3 className="team__member-role">{member.role}</h3>
                    <h4 className="team__member-name">{member.name}</h4>
                    <p className="team__member-description">{member.description}</p>
                    <div className="team__member-divider"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-cta">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="contact-cta__content"
          >
            <h2>Contact Us</h2>
            <p>Have questions or ready to get started? We'd love to hear from you</p>
            <Link to="/contact" className="btn btn--primary btn--large">
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home