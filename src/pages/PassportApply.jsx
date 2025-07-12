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
      // Submission error
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
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className={errors.nationality ? 'error' : ''}
                  >
                    <option value="">Select nationality</option>
                    <option value="Afghan">Afghan</option>
                    <option value="Albanian">Albanian</option>
                    <option value="Algerian">Algerian</option>
                    <option value="American">American</option>
                    <option value="Andorran">Andorran</option>
                    <option value="Angolan">Angolan</option>
                    <option value="Antiguans">Antiguans</option>
                    <option value="Argentinean">Argentinean</option>
                    <option value="Armenian">Armenian</option>
                    <option value="Australian">Australian</option>
                    <option value="Austrian">Austrian</option>
                    <option value="Azerbaijani">Azerbaijani</option>
                    <option value="Bahamian">Bahamian</option>
                    <option value="Bahraini">Bahraini</option>
                    <option value="Bangladeshi">Bangladeshi</option>
                    <option value="Barbadian">Barbadian</option>
                    <option value="Barbudans">Barbudans</option>
                    <option value="Batswana">Batswana</option>
                    <option value="Belarusian">Belarusian</option>
                    <option value="Belgian">Belgian</option>
                    <option value="Belizean">Belizean</option>
                    <option value="Beninese">Beninese</option>
                    <option value="Bhutanese">Bhutanese</option>
                    <option value="Bolivian">Bolivian</option>
                    <option value="Bosnian">Bosnian</option>
                    <option value="Brazilian">Brazilian</option>
                    <option value="British">British</option>
                    <option value="Bruneian">Bruneian</option>
                    <option value="Bulgarian">Bulgarian</option>
                    <option value="Burkinabe">Burkinabe</option>
                    <option value="Burmese">Burmese</option>
                    <option value="Burundian">Burundian</option>
                    <option value="Cambodian">Cambodian</option>
                    <option value="Cameroonian">Cameroonian</option>
                    <option value="Canadian">Canadian</option>
                    <option value="Cape Verdean">Cape Verdean</option>
                    <option value="Central African">Central African</option>
                    <option value="Chadian">Chadian</option>
                    <option value="Chilean">Chilean</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Colombian">Colombian</option>
                    <option value="Comoran">Comoran</option>
                    <option value="Congolese">Congolese</option>
                    <option value="Costa Rican">Costa Rican</option>
                    <option value="Croatian">Croatian</option>
                    <option value="Cuban">Cuban</option>
                    <option value="Cypriot">Cypriot</option>
                    <option value="Czech">Czech</option>
                    <option value="Danish">Danish</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominican">Dominican</option>
                    <option value="Dutch">Dutch</option>
                    <option value="East Timorese">East Timorese</option>
                    <option value="Ecuadorean">Ecuadorean</option>
                    <option value="Egyptian">Egyptian</option>
                    <option value="Emirian">Emirian</option>
                    <option value="Equatorial Guinean">Equatorial Guinean</option>
                    <option value="Eritrean">Eritrean</option>
                    <option value="Estonian">Estonian</option>
                    <option value="Ethiopian">Ethiopian</option>
                    <option value="Fijian">Fijian</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Finnish">Finnish</option>
                    <option value="French">French</option>
                    <option value="Gabonese">Gabonese</option>
                    <option value="Gambian">Gambian</option>
                    <option value="Georgian">Georgian</option>
                    <option value="German">German</option>
                    <option value="Ghanaian">Ghanaian</option>
                    <option value="Greek">Greek</option>
                    <option value="Grenadian">Grenadian</option>
                    <option value="Guatemalan">Guatemalan</option>
                    <option value="Guinea-Bissauan">Guinea-Bissauan</option>
                    <option value="Guinean">Guinean</option>
                    <option value="Guyanese">Guyanese</option>
                    <option value="Haitian">Haitian</option>
                    <option value="Herzegovinian">Herzegovinian</option>
                    <option value="Honduran">Honduran</option>
                    <option value="Hungarian">Hungarian</option>
                    <option value="Icelander">Icelander</option>
                    <option value="Indian">Indian</option>
                    <option value="Indonesian">Indonesian</option>
                    <option value="Iranian">Iranian</option>
                    <option value="Iraqi">Iraqi</option>
                    <option value="Irish">Irish</option>
                    <option value="Israeli">Israeli</option>
                    <option value="Italian">Italian</option>
                    <option value="Ivorian">Ivorian</option>
                    <option value="Jamaican">Jamaican</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Jordanian">Jordanian</option>
                    <option value="Kazakhstani">Kazakhstani</option>
                    <option value="Kenyan">Kenyan</option>
                    <option value="Kittian and Nevisian">Kittian and Nevisian</option>
                    <option value="Kuwaiti">Kuwaiti</option>
                    <option value="Kyrgyz">Kyrgyz</option>
                    <option value="Laotian">Laotian</option>
                    <option value="Latvian">Latvian</option>
                    <option value="Lebanese">Lebanese</option>
                    <option value="Liberian">Liberian</option>
                    <option value="Libyan">Libyan</option>
                    <option value="Liechtensteiner">Liechtensteiner</option>
                    <option value="Lithuanian">Lithuanian</option>
                    <option value="Luxembourger">Luxembourger</option>
                    <option value="Macedonian">Macedonian</option>
                    <option value="Malagasy">Malagasy</option>
                    <option value="Malawian">Malawian</option>
                    <option value="Malaysian">Malaysian</option>
                    <option value="Maldivan">Maldivan</option>
                    <option value="Malian">Malian</option>
                    <option value="Maltese">Maltese</option>
                    <option value="Marshallese">Marshallese</option>
                    <option value="Mauritanian">Mauritanian</option>
                    <option value="Mauritian">Mauritian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Micronesian">Micronesian</option>
                    <option value="Moldovan">Moldovan</option>
                    <option value="Monacan">Monacan</option>
                    <option value="Mongolian">Mongolian</option>
                    <option value="Moroccan">Moroccan</option>
                    <option value="Mosotho">Mosotho</option>
                    <option value="Motswana">Motswana</option>
                    <option value="Mozambican">Mozambican</option>
                    <option value="Namibian">Namibian</option>
                    <option value="Nauruan">Nauruan</option>
                    <option value="Nepalese">Nepalese</option>
                    <option value="New Zealander">New Zealander</option>
                    <option value="Ni-Vanuatu">Ni-Vanuatu</option>
                    <option value="Nicaraguan">Nicaraguan</option>
                    <option value="Nigerian">Nigerian</option>
                    <option value="Nigerien">Nigerien</option>
                    <option value="North Korean">North Korean</option>
                    <option value="Northern Irish">Northern Irish</option>
                    <option value="Norwegian">Norwegian</option>
                    <option value="Omani">Omani</option>
                    <option value="Pakistani">Pakistani</option>
                    <option value="Palauan">Palauan</option>
                    <option value="Palestinian">Palestinian</option>
                    <option value="Panamanian">Panamanian</option>
                    <option value="Papua New Guinean">Papua New Guinean</option>
                    <option value="Paraguayan">Paraguayan</option>
                    <option value="Peruvian">Peruvian</option>
                    <option value="Polish">Polish</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Qatari">Qatari</option>
                    <option value="Romanian">Romanian</option>
                    <option value="Russian">Russian</option>
                    <option value="Rwandan">Rwandan</option>
                    <option value="Saint Lucian">Saint Lucian</option>
                    <option value="Salvadoran">Salvadoran</option>
                    <option value="Samoan">Samoan</option>
                    <option value="San Marinese">San Marinese</option>
                    <option value="Sao Tomean">Sao Tomean</option>
                    <option value="Saudi">Saudi</option>
                    <option value="Scottish">Scottish</option>
                    <option value="Senegalese">Senegalese</option>
                    <option value="Serbian">Serbian</option>
                    <option value="Seychellois">Seychellois</option>
                    <option value="Sierra Leonean">Sierra Leonean</option>
                    <option value="Singaporean">Singaporean</option>
                    <option value="Slovakian">Slovakian</option>
                    <option value="Slovenian">Slovenian</option>
                    <option value="Solomon Islander">Solomon Islander</option>
                    <option value="Somali">Somali</option>
                    <option value="South African">South African</option>
                    <option value="South Korean">South Korean</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Sri Lankan">Sri Lankan</option>
                    <option value="Sudanese">Sudanese</option>
                    <option value="Surinamer">Surinamer</option>
                    <option value="Swazi">Swazi</option>
                    <option value="Swedish">Swedish</option>
                    <option value="Swiss">Swiss</option>
                    <option value="Syrian">Syrian</option>
                    <option value="Taiwanese">Taiwanese</option>
                    <option value="Tajik">Tajik</option>
                    <option value="Tanzanian">Tanzanian</option>
                    <option value="Thai">Thai</option>
                    <option value="Togolese">Togolese</option>
                    <option value="Tongan">Tongan</option>
                    <option value="Trinidadian or Tobagonian">Trinidadian or Tobagonian</option>
                    <option value="Tunisian">Tunisian</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Tuvaluan">Tuvaluan</option>
                    <option value="Ugandan">Ugandan</option>
                    <option value="Ukrainian">Ukrainian</option>
                    <option value="Uruguayan">Uruguayan</option>
                    <option value="Uzbekistani">Uzbekistani</option>
                    <option value="Venezuelan">Venezuelan</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Welsh">Welsh</option>
                    <option value="Yemenite">Yemenite</option>
                    <option value="Zambian">Zambian</option>
                    <option value="Zimbabwean">Zimbabwean</option>
                  </select>
                  {errors.nationality && <span className="error-text">{errors.nationality}</span>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <h2>Academic Details</h2>
                <div className="form-group">
                  <label>University *</label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={errors.university ? 'error' : ''}
                  >
                    <option value="">Select university</option>
                    <option value="JUST">JUST (Jordan University of Science and Technology)</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.university && <span className="error-text">{errors.university}</span>}
                </div>
                
                <div className="form-group">
                  <label>Student ID *</label>
                  <input
                    type="number"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={errors.studentId ? 'error' : ''}
                    placeholder="Enter your student ID (numbers only)"
                  />
                  {errors.studentId && <span className="error-text">{errors.studentId}</span>}
                </div>
                
                <div className="form-group">
                  <label>Program/Major *</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    className={errors.program ? 'error' : ''}
                  >
                    <option value="">Select program</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Other">Other</option>
                  </select>
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