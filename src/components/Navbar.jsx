import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Events', path: '/events' },
    { name: 'News', path: '/news' },
    { name: 'Departments', path: '#', isDepartments: true },
    { name: 'Contact', path: '/contact' },
    { name: 'Portal', path: '/passport', isPortal: true }
  ]

  const departments = [
    { name: 'Research', path: '/departments/research', icon: '🧬' },
    { name: 'Academic', path: '/departments/academic', icon: '📚' },
    { name: 'Global Outreach', path: '/departments/global-outreach', icon: '🌍' }
  ]

  return (
    <motion.nav 
      className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="navbar__content">
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-container">
              <img 
                src="/logo.png" 
                alt="MedXplore Logo" 
                className="navbar__logo-image"
              />
              <span className="navbar__logo-text">MedXplore</span>
            </div>
          </Link>

          <div className="navbar__desktop">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {item.isDepartments ? (
                  <div className="navbar__dropdown">
                    <button 
                      className={`navbar__link navbar__link--dropdown ${isDepartmentsOpen ? 'navbar__link--active' : ''}`}
                      onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
                    >
                      {item.name}
                      <span className="material-icons-outlined dropdown-icon">
                        {isDepartmentsOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {isDepartmentsOpen && (
                      <motion.div 
                        className="navbar__dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {departments.map(dept => (
                          <Link 
                            key={dept.path}
                            to={dept.path} 
                            className="navbar__dropdown-item"
                            onClick={() => setIsDepartmentsOpen(false)}
                          >
                            <span className="dept-icon">{dept.icon}</span>
                            {dept.name}
                          </Link>
                        ))}
                        <div className="navbar__dropdown-divider"></div>
                        <Link 
                          to="/worker-login" 
                          className="navbar__dropdown-item navbar__dropdown-item--worker"
                          onClick={() => setIsDepartmentsOpen(false)}
                        >
                          <span className="material-icons-outlined">badge</span>
                          Worker Login
                        </Link>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link 
                    to={item.path}
                    className={`navbar__link ${location.pathname === item.path ? 'navbar__link--active' : ''} ${item.isPortal ? 'navbar__link--portal' : ''}`}
                  >
                    {item.name}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          <button 
            className={`navbar__mobile-toggle ${isMobileMenuOpen ? 'navbar__mobile-toggle--active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            className="navbar__mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        <motion.div 
          className={`navbar__mobile ${isMobileMenuOpen ? 'navbar__mobile--open' : ''}`}
          initial={false}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="navbar__mobile-content">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isMobileMenuOpen ? 1 : 0, 
                  x: isMobileMenuOpen ? 0 : -20 
                }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={item.path}
                  className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''} ${item.isPortal ? 'navbar__mobile-link--portal' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default Navbar