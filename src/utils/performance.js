// Performance optimization utilities

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function executedFunction(...args) {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Memoization utility
export const memoize = (func, getKey = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  return (...args) => {
    const key = getKey(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

// Image lazy loading utility
export const lazyLoadImage = (img, src, placeholder = '/placeholder.jpg') => {
  img.src = placeholder;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.onload = () => {
          image.classList.add('loaded');
        };
        observer.unobserve(image);
      }
    });
  });
  
  observer.observe(img);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Service worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      // Silent fail in production
      return null;
    }
  }
  return null;
};

// Memory cleanup utility
export const cleanupListeners = (listeners) => {
  listeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
};

// Prefetch data utility
export const prefetchData = async (url) => {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    return null;
  }
};

// Virtual scrolling helper
export const calculateVisibleItems = (containerHeight, itemHeight, scrollTop, buffer = 5) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
  
  return {
    start: Math.max(0, visibleStart - buffer),
    end: visibleEnd + buffer
  };
};

// Bundle size analysis helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    // Only log in development
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const totalSize = scripts.length + styles.length;
    return { scripts: scripts.length, styles: styles.length, total: totalSize };
  }
  return null;
};

// Performance metrics
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    // Only log in development
    const duration = end - start;
    return { result, duration };
  }
  
  return { result, duration: 0 };
};

// Web Vitals measurement
export const measureWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      // In production, send to analytics
      if (process.env.NODE_ENV === 'development') {
        // Only log in development
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        // In production, send to analytics
        if (process.env.NODE_ENV === 'development') {
          // Only log in development
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  }
};