import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { submitApplication } from '../services/database';
import confetti from 'canvas-confetti';
import './PassportApply.css';

const PassportApply = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    
    // Academic Details
    university: '',
    studentId: '',
    program: '',
    yearOfStudy: '',
    
    // Contact Information
    email: '',
    phone: '',
    
    // Medical Interests
    preferredSpecialties: '',
    careerGoals: '',
    
    // Experience
    previousExperience: '',
    
    // Motivation
    motivationStatement: ''
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 5;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.nationality) newErrors.nationality = 'Nationality is required';
        break;
      case 2:
        if (!formData.university) newErrors.university = 'University is required';
        if (!formData.studentId) newErrors.studentId = 'Student ID is required';
        if (!formData.program) newErrors.program = 'Program is required';
        if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
        break;
      case 3:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        break;
      case 4:
        if (!formData.preferredSpecialties) newErrors.preferredSpecialties = 'Please specify your medical interests';
        if (!formData.careerGoals) newErrors.careerGoals = 'Please describe your career goals';
        break;
      case 5:
        if (!formData.motivationStatement) newErrors.motivationStatement = 'Motivation statement is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    try {
      const result = await submitApplication(formData);
      
      if (result.success) {
        setSubmitted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="passport-apply-page">
        <motion.div 
          className="success-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h1>Application Submitted Successfully!</h1>
            <p>Thank you for applying for the MedXperience Passport.</p>
            <p>We will review your application and send you an email with your passport number once approved.</p>
            <button onClick={() => navigate('/')} className="home-button">
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="passport-apply-page">
      <motion.div 
        className="apply-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="apply-header">
          <h1>Apply for MedXperience Passport</h1>
          <p>Join the exclusive medical education tracking program</p>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="apply-form">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <div className="form-step">
                <h2>Personal Information</h2>
                <div className="form-group">
                  <label>Full Legal Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={errors.dateOfBirth ? 'error' : ''}
                  />
                  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                </div>
                
                <div className="form-group">
                  <label>Nationality *</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className={errors.nationality ? 'error' : ''}
                  />
                  {errors.nationality && <span className="error-text">{errors.nationality}</span>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <h2>Academic Details</h2>
                <div className="form-group">
                  <label>University *</label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={errors.university ? 'error' : ''}
                  />
                  {errors.university && <span className="error-text">{errors.university}</span>}
                </div>
                
                <div className="form-group">
                  <label>Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={errors.studentId ? 'error' : ''}
                  />
                  {errors.studentId && <span className="error-text">{errors.studentId}</span>}
                </div>
                
                <div className="form-group">
                  <label>Program/Major *</label>
                  <input
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    placeholder="e.g., Medicine, Pre-Med, Biomedical Science"
                    className={errors.program ? 'error' : ''}
                  />
                  {errors.program && <span className="error-text">{errors.program}</span>}
                </div>
                
                <div className="form-group">
                  <label>Year of Study *</label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className={errors.yearOfStudy ? 'error' : ''}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                    <option value="6">6th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                  {errors.yearOfStudy && <span className="error-text">{errors.yearOfStudy}</span>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step">
                <h2>Contact Information</h2>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="form-step">
                <h2>Medical Interests</h2>
                <div className="form-group">
                  <label>Preferred Medical Specialties *</label>
                  <textarea
                    name="preferredSpecialties"
                    value={formData.preferredSpecialties}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="List your areas of interest (e.g., Cardiology, Pediatrics, Surgery)"
                    className={errors.preferredSpecialties ? 'error' : ''}
                  />
                  {errors.preferredSpecialties && <span className="error-text">{errors.preferredSpecialties}</span>}
                </div>
                
                <div className="form-group">
                  <label>Career Goals *</label>
                  <textarea
                    name="careerGoals"
                    value={formData.careerGoals}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Briefly describe your medical career aspirations"
                    className={errors.careerGoals ? 'error' : ''}
                  />
                  {errors.careerGoals && <span className="error-text">{errors.careerGoals}</span>}
                </div>
                
                <div className="form-group">
                  <label>Previous Medical/Volunteer Experience</label>
                  <textarea
                    name="previousExperience"
                    value={formData.previousExperience}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Optional: Describe any relevant experience"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="form-step">
                <h2>Motivation Statement</h2>
                <div className="form-group">
                  <label>Why do you want to join MedXplore? *</label>
                  <textarea
                    name="motivationStatement"
                    value={formData.motivationStatement}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Tell us why you're interested in joining the MedXperience Passport program and how it will help your medical journey (minimum 100 words)"
                    className={errors.motivationStatement ? 'error' : ''}
                  />
                  {errors.motivationStatement && <span className="error-text">{errors.motivationStatement}</span>}
                </div>
              </div>
            )}
          </motion.div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handlePrevious}
                className="nav-button prev-button"
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="nav-button next-button"
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="nav-button submit-button"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PassportApply;