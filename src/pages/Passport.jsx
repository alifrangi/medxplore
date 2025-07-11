import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Passport = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the new passport login page
    navigate('/passport', { replace: true })
  }, [navigate])

  return null
}

export default Passport