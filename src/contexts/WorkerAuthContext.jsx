import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { verifyPassword, generateSecureToken, generateTokenExpiry, isTokenExpired, decryptEmail } from '../utils/crypto';

const WorkerAuthContext = createContext();

export const useWorkerAuth = () => {
  const context = useContext(WorkerAuthContext);
  if (!context) {
    throw new Error('useWorkerAuth must be used within WorkerAuthProvider');
  }
  return context;
};

export const WorkerAuthProvider = ({ children }) => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load worker from localStorage on mount
  useEffect(() => {
    const loadWorker = async () => {
      try {
        const storedWorker = localStorage.getItem('workerSession');
        if (storedWorker) {
          const workerData = JSON.parse(storedWorker);
          
          // Check if token is expired
          if (isTokenExpired(workerData.tokenExpiry)) {
            localStorage.removeItem('workerSession');
            setWorker(null);
          } else {
            // Verify token with database
            const workerDoc = await getDocs(
              query(collection(db, 'workers'), where('sessionToken', '==', workerData.sessionToken))
            );
            
            if (!workerDoc.empty) {
              setWorker(workerData);
            } else {
              localStorage.removeItem('workerSession');
              setWorker(null);
            }
          }
        }
      } catch (error) {
        console.error('Error loading worker session:', error);
        localStorage.removeItem('workerSession');
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, []);

  const login = async (email, password) => {
    try {
      // Query workers by email (encrypted)
      const workersRef = collection(db, 'workers');
      const workersSnapshot = await getDocs(workersRef);
      
      let foundWorker = null;
      let workerId = null;
      let decryptedEmail = null;

      // Check each worker's email
      for (const workerDoc of workersSnapshot.docs) {
        const workerData = workerDoc.data();
        const currentDecryptedEmail = decryptEmail(workerData.email);
        
        if (currentDecryptedEmail === email.toLowerCase()) {
          foundWorker = workerData;
          workerId = workerDoc.id;
          decryptedEmail = currentDecryptedEmail;
          break;
        }
      }

      if (!foundWorker) {
        throw new Error('Invalid email or password');
      }

      // Check if account is active
      if (!foundWorker.isActive) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Verify password
      const isValid = await verifyPassword(password, foundWorker.passwordHash, foundWorker.salt);
      
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Generate new session
      const sessionToken = generateSecureToken();
      const tokenExpiry = generateTokenExpiry();

      // Update worker in database
      await updateDoc(doc(db, 'workers', workerId), {
        sessionToken,
        tokenExpiry,
        lastLogin: Date.now()
      });

      // Prepare worker data for context
      const workerSession = {
        id: workerId,
        email: decryptedEmail,
        firstName: foundWorker.firstName,
        lastName: foundWorker.lastName,
        profileColor: foundWorker.profileColor,
        departments: foundWorker.departments,
        sessionToken,
        tokenExpiry
      };

      // Store in localStorage
      localStorage.setItem('workerSession', JSON.stringify(workerSession));
      
      setWorker(workerSession);
      return workerSession;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (worker) {
        // Clear session token in database
        await updateDoc(doc(db, 'workers', worker.id), {
          sessionToken: null,
          tokenExpiry: null
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('workerSession');
      setWorker(null);
    }
  };

  const hasAccessToDepartment = (department) => {
    if (!worker) return false;
    return worker.departments.includes('all') || worker.departments.includes(department);
  };

  const value = {
    worker,
    loading,
    login,
    logout,
    hasAccessToDepartment
  };

  return (
    <WorkerAuthContext.Provider value={value}>
      {children}
    </WorkerAuthContext.Provider>
  );
};