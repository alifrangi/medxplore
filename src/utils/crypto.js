// Crypto utilities for password hashing and encryption
// Using Web Crypto API for secure operations

// Generate random salt
export const generateSalt = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hash password using PBKDF2
export const hashPassword = async (password, salt = null) => {
  const encoder = new TextEncoder();
  const saltToUse = salt || generateSalt();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(saltToUse),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return {
    hash: hashHex,
    salt: saltToUse
  };
};

// Verify password against hash
export const verifyPassword = async (password, storedHash, salt) => {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
};

// Generate secure random token
export const generateSecureToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Simple encryption for email addresses (using a fixed key for demo)
// In production, this should use a proper key management system
const ENCRYPTION_KEY = 'MedExplore2024SecureKey';

export const encryptEmail = (email) => {
  // Simple XOR encryption for demonstration
  // In production, use proper AES encryption
  let encrypted = '';
  for (let i = 0; i < email.length; i++) {
    const charCode = email.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
};

export const decryptEmail = (encryptedEmail) => {
  try {
    const decoded = atob(encryptedEmail); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Generate random color for profile
export const generateProfileColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#48DBFB', '#1DD1A1', '#00D2D3',
    '#5F27CD', '#EE5A24', '#10AC84', '#006BA6', '#F368E0'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Session token validation
export const isTokenExpired = (expiryTimestamp) => {
  return Date.now() > expiryTimestamp;
};

// Generate token expiry (24 hours from now)
export const generateTokenExpiry = () => {
  return Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
};