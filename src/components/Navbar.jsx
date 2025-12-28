import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    { name: 'Contact', path: '/contact' },
    { name: 'Portal', path: '/passport', isPortal: true }
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
                src="/logo-trans.png" 
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
                <Link 
                  to={item.path}
                  className={`navbar__link ${location.pathname === item.path ? 'navbar__link--active' : ''} ${item.isPortal ? 'navbar__link--portal' : ''}`}
                >
                  {item.name}
                </Link>
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
      </div>

      {/* Mobile Menu - Rendered via Portal */}
      {createPortal(
        <>
          {/* Mobile Menu Backdrop */}
          {isMobileMenuOpen && (
            <div 
              className="navbar__mobile-backdrop"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          
          {/* Mobile Menu */}
          <div 
            className={`navbar__mobile ${isMobileMenuOpen ? 'navbar__mobile--open' : ''}`}
          >
            <button 
              className="navbar__mobile-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="navbar__mobile-content">
              <div className="navbar__mobile-main">
                {navItems.filter(item => !item.isPortal).map((item, index) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    className={`navbar__mobile-link ${location.pathname === item.path ? 'navbar__mobile-link--active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      transitionDelay: isMobileMenuOpen ? `${index * 0.1}s` : '0s'
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="navbar__mobile-footer">
                {navItems.filter(item => item.isPortal).map((item, index) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    className="navbar__mobile-link navbar__mobile-link--portal"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      transitionDelay: isMobileMenuOpen ? `${(navItems.length - 1 + index) * 0.1}s` : '0s'
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </motion.nav>
  )
}

export default Navbar