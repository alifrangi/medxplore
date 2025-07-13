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

            {/* Teams List */}
            <div className="team__teams-list">
{[
                {
                  teamName: "Executive Leadership",
                  members: [
                    {
                      id: 1,
                      name: "Yazan Al Afrangi",
                      role: "FOUNDER & EXECUTIVE DIRECTOR",
                      description: "Leads MedXplore's vision, strategic direction, and long-term growth. Focused on bridging medical education with real-world experience.",
                      image: "/yazan.png",
                      isHead: true
                    },
                    {
                      id: 2,
                      name: "Dr. Wafa'a Ta'an",
                      role: "MEDICAL AFFAIRS DIRECTOR",
                      description: "Senior healthcare professional with a PhD in Nursing, offering mentorship, strategic guidance, and a strong professional network.",
                      image: "/wafaa-taan.jpg",
                      isHead: true
                    }
                  ]
                },
                {
                  teamName: "Academic Development",
                  members: [
                    {
                      id: 3,
                      name: "Ammar Ashour",
                      role: "ACADEMIC DEVELOPMENT LEAD",
                      description: "Oversees educational strategy, academic partnerships, and content creation.",
                      image: "/hoad.jpg",
                      isHead: true
                    },
                    {
                      id: 4,
                      name: "Coming Soon",
                      role: "ACADEMIC SPECIALIST",
                      description: "Supports academic development initiatives and educational content review.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 5,
                      name: "Coming Soon",
                      role: "CONTENT COORDINATOR",
                      description: "Coordinates content creation and ensures quality standards across educational materials.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 6,
                      name: "Rahma Alyabroudi",
                      role: "FOUNDATION AND READINESS OFFICER",
                      description: "Strong foundations don't just support growth — they shape its direction. At MedXplore, I ensure readiness is never an afterthought, but the starting point of every journey.",
                      image: "/fard.jpg",
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Research & Innovation",
                  members: [
                    {
                      id: 7,
                      name: "Coming Soon",
                      role: "RESEARCH & INNOVATION LEAD",
                      description: "Drives student-led research projects, fosters collaboration, and explores innovative approaches in medical science and education.",
                      image: null,
                      isHead: true
                    },
                    {
                      id: 8,
                      name: "Coming Soon",
                      role: "RESEARCH COORDINATOR",
                      description: "Coordinates research initiatives and manages collaboration between research teams.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 9,
                      name: "Coming Soon",
                      role: "RESEARCH REVIEWER",
                      description: "Reviews research proposals and ensures methodological rigor in all research projects.",
                      image: null,
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Global Outreach",
                  members: [
                    {
                      id: 10,
                      name: "Coming Soon",
                      role: "GLOBAL OUTREACH LEAD",
                      description: "Builds international collaborations and connects with universities worldwide.",
                      image: null,
                      isHead: true
                    },
                    {
                      id: 11,
                      name: "Coming Soon",
                      role: "INTERNATIONAL RELATIONS SPECIALIST",
                      description: "Manages international partnerships and cross-cultural collaboration initiatives.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 12,
                      name: "Coming Soon",
                      role: "UNIVERSITY PARTNERSHIP COORDINATOR",
                      description: "Develops and maintains strategic partnerships with educational institutions globally.",
                      image: null,
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Student Experience",
                  members: [
                    {
                      id: 13,
                      name: "Sedra Jibreen",
                      role: "STUDENT EXPERIENCE LEAD",
                      description: "Focuses on building an engaging student journey and a strong global community.",
                      image: "/sel.jpg",
                      isHead: true
                    },
                    {
                      id: 14,
                      name: "Coming Soon",
                      role: "STUDENT ENGAGEMENT SPECIALIST",
                      description: "Develops engagement strategies and manages student interaction initiatives.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 15,
                      name: "Coming Soon",
                      role: "COMMUNITY COORDINATOR",
                      description: "Builds and maintains strong connections within the global student community.",
                      image: null,
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Website and Tech",
                  members: [
                    {
                      id: 16,
                      name: "Yazan Jarrar",
                      role: "WEBSITE AND TECH LEAD",
                      description: "Develops and manages digital platforms and future-forward learning tools.",
                      image: "/watm.jpg",
                      isHead: true
                    },
                    {
                      id: 17,
                      name: "Coming Soon",
                      role: "TECHNOLOGY SPECIALIST",
                      description: "Provides technical expertise and supports platform development initiatives.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 18,
                      name: "Coming Soon",
                      role: "PLATFORM COORDINATOR",
                      description: "Coordinates platform updates and ensures optimal user experience across all digital tools.",
                      image: null,
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Marketing & Communications",
                  members: [
                    {
                      id: 19,
                      name: "Shahad Samarat",
                      role: "MARKETING & COMMUNICATIONS LEAD",
                      description: "Shapes MedXplore's brand identity and outreach across platforms.",
                      image: "/macl.jpg",
                      isHead: true
                    },
                    {
                      id: 20,
                      name: "Coming Soon",
                      role: "COMMUNICATIONS SPECIALIST",
                      description: "Manages internal and external communications strategies and content creation.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 21,
                      name: "Coming Soon",
                      role: "BRAND COORDINATOR",
                      description: "Ensures consistent brand messaging and visual identity across all platforms.",
                      image: null,
                      isHead: false
                    }
                  ]
                },
                {
                  teamName: "Operations & Logistics",
                  members: [
                    {
                      id: 22,
                      name: "Coming Soon",
                      role: "OPERATIONS & LOGISTICS LEAD",
                      description: "Ensures smooth execution of projects, workflows, and internal systems.",
                      image: null,
                      isHead: true
                    },
                    {
                      id: 23,
                      name: "Coming Soon",
                      role: "OPERATIONS SPECIALIST",
                      description: "Manages day-to-day operations and optimizes organizational workflows.",
                      image: null,
                      isHead: false
                    },
                    {
                      id: 24,
                      name: "Coming Soon",
                      role: "PROJECT COORDINATOR",
                      description: "Coordinates project timelines and ensures deliverables meet quality standards.",
                      image: null,
                      isHead: false
                    }
                  ]
                }
              ].map((team, teamIndex) => (
                <motion.div
                  key={team.teamName}
                  className="team__team-group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: teamIndex * 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="team__team-title">{team.teamName}</h2>
                  <div className="team__members-list">
                    {team.members.map((member, memberIndex) => (
                      <motion.div
                        key={member.id}
                        className="team__member"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: (teamIndex * team.members.length + memberIndex) * 0.1 }}
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