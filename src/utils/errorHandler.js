// Production-ready error handler utility

export const handleError = (error, context = '') => {
  // In production, we don't log to console
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context}:`, error);
  }

  // Determine error message
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        userMessage = 'No account found with these credentials.';
        break;
      case 'auth/wrong-password':
        userMessage = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        userMessage = 'Invalid email address.';
        break;
      case 'auth/too-many-requests':
        userMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'permission-denied':
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 'unavailable':
        userMessage = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        if (error.message) {
          userMessage = error.message;
        }
    }
  } else if (error.message) {
    userMessage = error.message;
  }

  return userMessage;
};

// Toast notification system
export const showToast = (message, type = 'error') => {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
  } text-white`;
  toast.textContent = message;
  
  // Add to DOM
  document.body.appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
};

// Network error handler
export const isNetworkError = (error) => {
  return !navigator.onLine || 
         error.code === 'unavailable' || 
         error.message?.includes('network') ||
         error.message?.includes('fetch');
};

// Retry logic for network errors
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1 && isNetworkError(error)) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};