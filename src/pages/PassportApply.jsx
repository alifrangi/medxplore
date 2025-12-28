import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { submitApplication } from '../services/database';
import confetti from 'canvas-confetti';
import useForceLightMode from '../hooks/useForceLightMode';
import './PassportApply.css';

const PassportApply = () => {
  useForceLightMode();
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
    otherUniversity: '', // For "Other" option
    studentId: '',
    program: '',
    yearOfStudy: '',

    // Contact Information
    email: '',
    countryCode: '+962',
    phone: '',

    // Medical Interests
    preferredSpecialties: '',
    careerGoals: ''
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 4;

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
        if (formData.university === 'Other' && !formData.otherUniversity) {
          newErrors.otherUniversity = 'Please specify your university';
        }
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
                    <option value="JUST">Jordan University of Science and Technology (JUST)</option>
                    <option value="YU">Yarmouk University (YU)</option>
                    <option value="HU">Hashemite University (HU)</option>
                    <option value="Other">Other University</option>
                  </select>
                  {errors.university && <span className="error-text">{errors.university}</span>}
                </div>

                {formData.university === 'Other' && (
                  <div className="form-group">
                    <label>Specify University *</label>
                    <input
                      type="text"
                      name="otherUniversity"
                      value={formData.otherUniversity}
                      onChange={handleInputChange}
                      className={errors.otherUniversity ? 'error' : ''}
                      placeholder="Enter your university name"
                    />
                    {errors.otherUniversity && <span className="error-text">{errors.otherUniversity}</span>}
                    <p className="field-hint">Applications from other universities will be reviewed by the admin team.</p>
                  </div>
                )}
                
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
                    
                    {/* Medical & Health Sciences */}
                    <optgroup label="Medical & Health Sciences">
                      <option value="Medicine">Medicine</option>
                      <option value="Dentistry">Dentistry</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Veterinary">Veterinary Medicine</option>
                      <option value="Other Health Sciences">Other Health Sciences</option>                    
                    </optgroup>
                    
                    {/* Engineering */}
                    <optgroup label="Engineering">
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Industrial Engineering">Industrial Engineering</option>
                      <option value="Biomedical Engineering">Biomedical Engineering</option>
                      <option value="Aerospace Engineering">Aerospace Engineering</option>
                      <option value="Environmental Engineering">Environmental Engineering</option>
                    </optgroup>
                    
                    {/* Computer Science & IT */}
                    <optgroup label="Computer Science & IT">
                      <option value="Computer Science">Computer Science</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                    </optgroup>
                    
                    {/* Natural Sciences */}
                    <optgroup label="Natural Sciences">
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                    </optgroup>
                    
                    {/* Business & Economics */}
                    <optgroup label="Business & Economics">
                      <option value="Business Administration">Business Administration</option>
                      <option value="Accounting">Accounting</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Economics">Economics</option>
                      <option value="Management">Management</option>
                    </optgroup>
                    
                    {/* Arts & Humanities */}
                    <optgroup label="Arts & Humanities">
                      <option value="Psychology">Psychology</option>
                      <option value="English Literature">English Literature</option>
                      <option value="History">History</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="Graphic Design">Graphic Design</option>
                      <option value="Architecture">Architecture</option>
                    </optgroup>

                    {/* Other */}
                    <optgroup label="Other">
                      <option value="Agriculture">Agriculture</option>
                      <option value="Nutrition and Dietetics">Nutrition and Dietetics</option>
                      <option value="Law">Law</option>
                    </optgroup>
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      style={{ width: '150px' }}
                      className={errors.phone ? 'error' : ''}
                    >
                      <option value="+962">🇯🇴 +962 (Jordan)</option>
                      <option value="+93">🇦🇫 +93 (Afghanistan)</option>
                      <option value="+355">🇦🇱 +355 (Albania)</option>
                      <option value="+213">🇩🇿 +213 (Algeria)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+376">🇦🇩 +376 (Andorra)</option>
                      <option value="+244">🇦🇴 +244 (Angola)</option>
                      <option value="+54">🇦🇷 +54 (Argentina)</option>
                      <option value="+374">🇦🇲 +374 (Armenia)</option>
                      <option value="+61">🇦🇺 +61 (Australia)</option>
                      <option value="+43">🇦🇹 +43 (Austria)</option>
                      <option value="+994">🇦🇿 +994 (Azerbaijan)</option>
                      <option value="+973">🇧🇭 +973 (Bahrain)</option>
                      <option value="+880">🇧🇩 +880 (Bangladesh)</option>
                      <option value="+375">🇧🇾 +375 (Belarus)</option>
                      <option value="+32">🇧🇪 +32 (Belgium)</option>
                      <option value="+501">🇧🇿 +501 (Belize)</option>
                      <option value="+229">🇧🇯 +229 (Benin)</option>
                      <option value="+975">🇧🇹 +975 (Bhutan)</option>
                      <option value="+591">🇧🇴 +591 (Bolivia)</option>
                      <option value="+387">🇧🇦 +387 (Bosnia)</option>
                      <option value="+267">🇧🇼 +267 (Botswana)</option>
                      <option value="+55">🇧🇷 +55 (Brazil)</option>
                      <option value="+673">🇧🇳 +673 (Brunei)</option>
                      <option value="+359">🇧🇬 +359 (Bulgaria)</option>
                      <option value="+226">🇧🇫 +226 (Burkina Faso)</option>
                      <option value="+257">🇧🇮 +257 (Burundi)</option>
                      <option value="+855">🇰🇭 +855 (Cambodia)</option>
                      <option value="+237">🇨🇲 +237 (Cameroon)</option>
                      <option value="+1">🇨🇦 +1 (Canada)</option>
                      <option value="+238">🇨🇻 +238 (Cape Verde)</option>
                      <option value="+236">🇨🇫 +236 (Central African Republic)</option>
                      <option value="+235">🇹🇩 +235 (Chad)</option>
                      <option value="+56">🇨🇱 +56 (Chile)</option>
                      <option value="+86">🇨🇳 +86 (China)</option>
                      <option value="+57">🇨🇴 +57 (Colombia)</option>
                      <option value="+269">🇰🇲 +269 (Comoros)</option>
                      <option value="+242">🇨🇬 +242 (Congo)</option>
                      <option value="+506">🇨🇷 +506 (Costa Rica)</option>
                      <option value="+385">🇭🇷 +385 (Croatia)</option>
                      <option value="+53">🇨🇺 +53 (Cuba)</option>
                      <option value="+357">🇨🇾 +357 (Cyprus)</option>
                      <option value="+420">🇨🇿 +420 (Czech Republic)</option>
                      <option value="+45">🇩🇰 +45 (Denmark)</option>
                      <option value="+253">🇩🇯 +253 (Djibouti)</option>
                      <option value="+593">🇪🇨 +593 (Ecuador)</option>
                      <option value="+20">🇪🇬 +20 (Egypt)</option>
                      <option value="+503">🇸🇻 +503 (El Salvador)</option>
                      <option value="+240">🇬🇶 +240 (Equatorial Guinea)</option>
                      <option value="+291">🇪🇷 +291 (Eritrea)</option>
                      <option value="+372">🇪🇪 +372 (Estonia)</option>
                      <option value="+251">🇪🇹 +251 (Ethiopia)</option>
                      <option value="+679">🇫🇯 +679 (Fiji)</option>
                      <option value="+358">🇫🇮 +358 (Finland)</option>
                      <option value="+33">🇫🇷 +33 (France)</option>
                      <option value="+241">🇬🇦 +241 (Gabon)</option>
                      <option value="+220">🇬🇲 +220 (Gambia)</option>
                      <option value="+995">🇬🇪 +995 (Georgia)</option>
                      <option value="+49">🇩🇪 +49 (Germany)</option>
                      <option value="+233">🇬🇭 +233 (Ghana)</option>
                      <option value="+30">🇬🇷 +30 (Greece)</option>
                      <option value="+502">🇬🇹 +502 (Guatemala)</option>
                      <option value="+224">🇬🇳 +224 (Guinea)</option>
                      <option value="+245">🇬🇼 +245 (Guinea-Bissau)</option>
                      <option value="+592">🇬🇾 +592 (Guyana)</option>
                      <option value="+509">🇭🇹 +509 (Haiti)</option>
                      <option value="+504">🇭🇳 +504 (Honduras)</option>
                      <option value="+36">🇭🇺 +36 (Hungary)</option>
                      <option value="+354">🇮🇸 +354 (Iceland)</option>
                      <option value="+91">🇮🇳 +91 (India)</option>
                      <option value="+62">🇮🇩 +62 (Indonesia)</option>
                      <option value="+98">🇮🇷 +98 (Iran)</option>
                      <option value="+964">🇮🇶 +964 (Iraq)</option>
                      <option value="+353">🇮🇪 +353 (Ireland)</option>
                      <option value="+39">🇮🇹 +39 (Italy)</option>
                      <option value="+81">🇯🇵 +81 (Japan)</option>
                      <option value="+7">🇰🇿 +7 (Kazakhstan)</option>
                      <option value="+254">🇰🇪 +254 (Kenya)</option>
                      <option value="+965">🇰🇼 +965 (Kuwait)</option>
                      <option value="+996">🇰🇬 +996 (Kyrgyzstan)</option>
                      <option value="+856">🇱🇦 +856 (Laos)</option>
                      <option value="+371">🇱🇻 +371 (Latvia)</option>
                      <option value="+961">🇱🇧 +961 (Lebanon)</option>
                      <option value="+266">🇱🇸 +266 (Lesotho)</option>
                      <option value="+231">🇱🇷 +231 (Liberia)</option>
                      <option value="+218">🇱🇾 +218 (Libya)</option>
                      <option value="+423">🇱🇮 +423 (Liechtenstein)</option>
                      <option value="+370">🇱🇹 +370 (Lithuania)</option>
                      <option value="+352">🇱🇺 +352 (Luxembourg)</option>
                      <option value="+389">🇲🇰 +389 (Macedonia)</option>
                      <option value="+261">🇲🇬 +261 (Madagascar)</option>
                      <option value="+265">🇲🇼 +265 (Malawi)</option>
                      <option value="+60">🇲🇾 +60 (Malaysia)</option>
                      <option value="+960">🇲🇻 +960 (Maldives)</option>
                      <option value="+223">🇲🇱 +223 (Mali)</option>
                      <option value="+356">🇲🇹 +356 (Malta)</option>
                      <option value="+222">🇲🇷 +222 (Mauritania)</option>
                      <option value="+230">🇲🇺 +230 (Mauritius)</option>
                      <option value="+52">🇲🇽 +52 (Mexico)</option>
                      <option value="+373">🇲🇩 +373 (Moldova)</option>
                      <option value="+377">🇲🇨 +377 (Monaco)</option>
                      <option value="+976">🇲🇳 +976 (Mongolia)</option>
                      <option value="+382">🇲🇪 +382 (Montenegro)</option>
                      <option value="+212">🇲🇦 +212 (Morocco)</option>
                      <option value="+258">🇲🇿 +258 (Mozambique)</option>
                      <option value="+95">🇲🇲 +95 (Myanmar)</option>
                      <option value="+264">🇳🇦 +264 (Namibia)</option>
                      <option value="+977">🇳🇵 +977 (Nepal)</option>
                      <option value="+31">🇳🇱 +31 (Netherlands)</option>
                      <option value="+64">🇳🇿 +64 (New Zealand)</option>
                      <option value="+505">🇳🇮 +505 (Nicaragua)</option>
                      <option value="+227">🇳🇪 +227 (Niger)</option>
                      <option value="+234">🇳🇬 +234 (Nigeria)</option>
                      <option value="+850">🇰🇵 +850 (North Korea)</option>
                      <option value="+47">🇳🇴 +47 (Norway)</option>
                      <option value="+968">🇴🇲 +968 (Oman)</option>
                      <option value="+92">🇵🇰 +92 (Pakistan)</option>
                      <option value="+970">🇵🇸 +970 (Palestine)</option>
                      <option value="+507">🇵🇦 +507 (Panama)</option>
                      <option value="+595">🇵🇾 +595 (Paraguay)</option>
                      <option value="+51">🇵🇪 +51 (Peru)</option>
                      <option value="+63">🇵🇭 +63 (Philippines)</option>
                      <option value="+48">🇵🇱 +48 (Poland)</option>
                      <option value="+351">🇵🇹 +351 (Portugal)</option>
                      <option value="+974">🇶🇦 +974 (Qatar)</option>
                      <option value="+40">🇷🇴 +40 (Romania)</option>
                      <option value="+7">🇷🇺 +7 (Russia)</option>
                      <option value="+250">🇷🇼 +250 (Rwanda)</option>
                      <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
                      <option value="+221">🇸🇳 +221 (Senegal)</option>
                      <option value="+381">🇷🇸 +381 (Serbia)</option>
                      <option value="+248">🇸🇨 +248 (Seychelles)</option>
                      <option value="+232">🇸🇱 +232 (Sierra Leone)</option>
                      <option value="+65">🇸🇬 +65 (Singapore)</option>
                      <option value="+421">🇸🇰 +421 (Slovakia)</option>
                      <option value="+386">🇸🇮 +386 (Slovenia)</option>
                      <option value="+252">🇸🇴 +252 (Somalia)</option>
                      <option value="+27">🇿🇦 +27 (South Africa)</option>
                      <option value="+82">🇰🇷 +82 (South Korea)</option>
                      <option value="+211">🇸🇸 +211 (South Sudan)</option>
                      <option value="+34">🇪🇸 +34 (Spain)</option>
                      <option value="+94">🇱🇰 +94 (Sri Lanka)</option>
                      <option value="+249">🇸🇩 +249 (Sudan)</option>
                      <option value="+597">🇸🇷 +597 (Suriname)</option>
                      <option value="+268">🇸🇿 +268 (Eswatini)</option>
                      <option value="+46">🇸🇪 +46 (Sweden)</option>
                      <option value="+41">🇨🇭 +41 (Switzerland)</option>
                      <option value="+963">🇸🇾 +963 (Syria)</option>
                      <option value="+886">🇹🇼 +886 (Taiwan)</option>
                      <option value="+992">🇹🇯 +992 (Tajikistan)</option>
                      <option value="+255">🇹🇿 +255 (Tanzania)</option>
                      <option value="+66">🇹🇭 +66 (Thailand)</option>
                      <option value="+228">🇹🇬 +228 (Togo)</option>
                      <option value="+216">🇹🇳 +216 (Tunisia)</option>
                      <option value="+90">🇹🇷 +90 (Turkey)</option>
                      <option value="+993">🇹🇲 +993 (Turkmenistan)</option>
                      <option value="+256">🇺🇬 +256 (Uganda)</option>
                      <option value="+380">🇺🇦 +380 (Ukraine)</option>
                      <option value="+971">🇦🇪 +971 (UAE)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+598">🇺🇾 +598 (Uruguay)</option>
                      <option value="+998">🇺🇿 +998 (Uzbekistan)</option>
                      <option value="+58">🇻🇪 +58 (Venezuela)</option>
                      <option value="+84">🇻🇳 +84 (Vietnam)</option>
                      <option value="+967">🇾🇪 +967 (Yemen)</option>
                      <option value="+260">🇿🇲 +260 (Zambia)</option>
                      <option value="+263">🇿🇼 +263 (Zimbabwe)</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="7XXXXXXXX"
                      className={errors.phone ? 'error' : ''}
                      style={{ flex: 1 }}
                    />
                  </div>
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