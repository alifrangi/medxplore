// Input validation and sanitization utilities

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (international format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Passport number validation
export const isValidPassportNumber = (passportNumber) => {
  const passportRegex = /^MXP-\d{4}-\d{4}$/;
  return passportRegex.test(passportNumber);
};

// Name validation (allows letters, spaces, hyphens, apostrophes)
export const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return name.length >= 2 && name.length <= 100 && nameRegex.test(name);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers
    .trim();
};

// Sanitize HTML content (for rich text fields)
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// Validate required fields
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
  });
  
  return errors;
};

// Validate application form
export const validateApplicationForm = (formData) => {
  const errors = {};
  
  // Required fields
  const requiredFields = ['fullName', 'email', 'phone', 'university', 'yearOfStudy', 'major'];
  Object.assign(errors, validateRequiredFields(formData, requiredFields));
  
  // Specific validations
  if (formData.fullName && !isValidName(formData.fullName)) {
    errors.fullName = 'Please enter a valid name (letters only)';
  }
  
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (formData.yearOfStudy) {
    const year = parseInt(formData.yearOfStudy);
    if (isNaN(year) || year < 1 || year > 8) {
      errors.yearOfStudy = 'Please enter a valid year of study (1-8)';
    }
  }
  
  return errors;
};

// Validate event form
export const validateEventForm = (formData) => {
  const errors = {};
  
  // Required fields
  const requiredFields = ['title', 'description', 'date', 'time', 'location', 'category'];
  Object.assign(errors, validateRequiredFields(formData, requiredFields));
  
  // Date validation
  if (formData.date) {
    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      errors.date = 'Event date cannot be in the past';
    }
  }
  
  // Max participants validation
  if (formData.maxParticipants && parseInt(formData.maxParticipants) < 1) {
    errors.maxParticipants = 'Maximum participants must be at least 1';
  }
  
  return errors;
};

// Sanitize all form data
export const sanitizeFormData = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitized[key] = sanitizeInput(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });
  
  return sanitized;
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  const strength = {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    score: 0,
    feedback: []
  };
  
  if (password.length < minLength) {
    strength.feedback.push(`Password must be at least ${minLength} characters`);
  } else {
    strength.score += 1;
  }
  
  if (!hasUpperCase) {
    strength.feedback.push('Include at least one uppercase letter');
  } else {
    strength.score += 1;
  }
  
  if (!hasLowerCase) {
    strength.feedback.push('Include at least one lowercase letter');
  } else {
    strength.score += 1;
  }
  
  if (!hasNumbers) {
    strength.feedback.push('Include at least one number');
  } else {
    strength.score += 1;
  }
  
  if (hasSpecialChar) {
    strength.score += 1;
  }
  
  return strength;
};