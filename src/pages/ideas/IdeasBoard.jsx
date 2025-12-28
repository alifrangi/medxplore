import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useToast } from '../../components/shared/Toast';
import { IDEA_TYPES, TARGET_AUDIENCES } from '../../data/mockData';
import { validateAccessCode } from '../../services/database';
import './IdeasBoard.css';

// Universities for Ideas Board - includes Other option that maps to JUST
const UNIVERSITIES_WITH_OTHER = [
  { id: 'JUST', name: 'Jordan University of Science & Technology' },
  { id: 'YU', name: 'Yarmouk University' },
  { id: 'Other', name: 'Other University', note: 'Ideas from other universities will be assigned to JUST team' }
];

const IdeasBoard = () => {
  const navigate = useNavigate();
  const { submitIdea } = usePipeline();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    targetAudience: '',
    goal: '',
    description: '',
    estimatedAttendees: '',
    requiresApproval: null,
    suggestedSpeakers: '',
    resourcesNeeded: '',
    notes: '',
    submittedBy: ''
  });

  const [errors, setErrors] = useState({});

  const handleUniversitySelect = (uniId) => {
    setSelectedUniversity(uniId);
    setAccessCode('');
    setCodeError('');
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCodeError('');

    try {
      const result = await validateAccessCode(accessCode, selectedUniversity);

      if (result.success) {
        setStep(3);
      } else {
        setCodeError(result.error || 'Invalid access code. Please try again.');
      }
    } catch (error) {
      setCodeError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleApprovalChange = (value) => {
    setFormData(prev => ({ ...prev, requiresApproval: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.submittedBy.trim()) newErrors.submittedBy = 'Your name is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.type) newErrors.type = 'Please select an event type';
    if (!formData.targetAudience) newErrors.targetAudience = 'Please select target audience';
    if (!formData.goal.trim()) newErrors.goal = 'Learning goal is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.estimatedAttendees) newErrors.estimatedAttendees = 'Estimated attendees is required';
    if (formData.requiresApproval === null) newErrors.requiresApproval = 'Please indicate if approvals are needed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const newIdea = await submitIdea({
        ...formData,
        university: selectedUniversity,
        estimatedAttendees: parseInt(formData.estimatedAttendees),
        driveLink: ''
      });

      if (newIdea && newIdea.id) {
        toast.success(`Idea submitted successfully! Your tracking ID: ${newIdea.id}`);
      } else {
        toast.success('Idea submitted successfully!');
      }
      setStep(4);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      className="ideas-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2>Select Your University</h2>
      <p className="step-description">Choose the university you're submitting from</p>

      <div className="university-grid">
        {UNIVERSITIES_WITH_OTHER.map((uni) => (
          <button
            key={uni.id}
            className={`university-card ${selectedUniversity === uni.id ? 'selected' : ''}`}
            onClick={() => handleUniversitySelect(uni.id)}
          >
            <span className="uni-abbr">{uni.id}</span>
            <span className="uni-name">{uni.name}</span>
            {uni.note && <span className="uni-note">{uni.note}</span>}
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button
          className="back-btn"
          onClick={() => navigate('/portal')}
        >
          Back to Portal
        </button>
        <button
          className="next-btn"
          disabled={!selectedUniversity}
          onClick={() => setStep(2)}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      className="ideas-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2>Enter Access Code</h2>
      <p className="step-description">
        Enter the access code provided by your university coordinator
      </p>

      <form onSubmit={handleVerifyCode} className="code-form">
        <div className="code-input-wrapper">
          <input
            type="text"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value.toUpperCase());
              setCodeError('');
            }}
            placeholder="Enter code (e.g., MEDX2025)"
            className={codeError ? 'error' : ''}
            maxLength={12}
          />
          {codeError && <span className="error-text">{codeError}</span>}
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => setStep(1)}
          >
            Back
          </button>
          <button
            type="submit"
            className="next-btn"
            disabled={!accessCode || loading}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      className="ideas-step step-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2>Submit Your Idea</h2>
      <p className="step-description">
        Fill in the details of your event proposal for {selectedUniversity}
      </p>

      <form onSubmit={handleSubmit} className="idea-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="submittedBy">Your Name *</label>
            <input
              type="text"
              id="submittedBy"
              name="submittedBy"
              value={formData.submittedBy}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={errors.submittedBy ? 'error' : ''}
            />
            {errors.submittedBy && <span className="error-text">{errors.submittedBy}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a descriptive title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Event Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Select type</option>
                {IDEA_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="targetAudience">Target Audience *</label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className={errors.targetAudience ? 'error' : ''}
              >
                <option value="">Select audience</option>
                {TARGET_AUDIENCES.map((aud) => (
                  <option key={aud} value={aud}>{aud}</option>
                ))}
              </select>
              {errors.targetAudience && <span className="error-text">{errors.targetAudience}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Event Details</h3>

          <div className="form-group">
            <label htmlFor="goal">Learning Goal / Outcome *</label>
            <textarea
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              placeholder="What will participants learn or achieve?"
              rows={3}
              className={errors.goal ? 'error' : ''}
            />
            {errors.goal && <span className="error-text">{errors.goal}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event in detail"
              rows={5}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedAttendees">Estimated Attendees *</label>
              <input
                type="number"
                id="estimatedAttendees"
                name="estimatedAttendees"
                value={formData.estimatedAttendees}
                onChange={handleInputChange}
                placeholder="e.g., 50"
                min="1"
                max="1000"
                className={errors.estimatedAttendees ? 'error' : ''}
              />
              {errors.estimatedAttendees && <span className="error-text">{errors.estimatedAttendees}</span>}
            </div>

            <div className="form-group">
              <label>Requires Official Approvals? *</label>
              <div className={`radio-group ${errors.requiresApproval ? 'error' : ''}`}>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="requiresApproval"
                    checked={formData.requiresApproval === true}
                    onChange={() => handleApprovalChange(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="requiresApproval"
                    checked={formData.requiresApproval === false}
                    onChange={() => handleApprovalChange(false)}
                  />
                  <span>No</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="requiresApproval"
                    checked={formData.requiresApproval === 'unsure'}
                    onChange={() => handleApprovalChange('unsure')}
                  />
                  <span>Not Sure</span>
                </label>
              </div>
              {errors.requiresApproval && <span className="error-text">{errors.requiresApproval}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information (Optional)</h3>

          <div className="form-group">
            <label htmlFor="suggestedSpeakers">Suggested Speakers</label>
            <input
              type="text"
              id="suggestedSpeakers"
              name="suggestedSpeakers"
              value={formData.suggestedSpeakers}
              onChange={handleInputChange}
              placeholder="Names and affiliations of potential speakers"
            />
          </div>

          <div className="form-group">
            <label htmlFor="resourcesNeeded">Resources Needed</label>
            <textarea
              id="resourcesNeeded"
              name="resourcesNeeded"
              value={formData.resourcesNeeded}
              onChange={handleInputChange}
              placeholder="Equipment, venues, materials, etc."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any other information you'd like to share"
              rows={3}
            />
          </div>
        </div>

        <div className="step-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => setStep(2)}
          >
            Back
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Idea'}
          </button>
        </div>
      </form>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      className="ideas-step success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>Idea Submitted Successfully!</h2>
      <p className="step-description">
        Your idea has been submitted and is now pending academic review.
        You can track its progress through the admin dashboard.
      </p>

      <div className="success-actions">
        <button
          className="primary-btn"
          onClick={() => {
            setStep(1);
            setSelectedUniversity('');
            setAccessCode('');
            setFormData({
              title: '',
              type: '',
              targetAudience: '',
              goal: '',
              description: '',
              estimatedAttendees: '',
              requiresApproval: null,
              suggestedSpeakers: '',
              resourcesNeeded: '',
              notes: '',
              submittedBy: ''
            });
          }}
        >
          Submit Another Idea
        </button>
        <button
          className="secondary-btn"
          onClick={() => navigate('/portal')}
        >
          Back to Portal
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="ideas-board-page">
      <div className="ideas-container">
        <div className="ideas-header">
          <span className="ideas-logo">MedXplore</span>
          <h1>Ideas Board</h1>
          {step < 4 && (
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line"></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className="step-line"></div>
              <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IdeasBoard;
