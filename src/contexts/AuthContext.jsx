import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFirebase, loadFirebaseAuth, loadDatabase } from '../services/firebaseLazy';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState(null); // 'student' or 'admin'

  // Student login with passport number
  const loginWithPassport = async (passportNumber) => {
    try {
      setLoading(true);
      const { getStudentByPassport } = await loadDatabase();
      const result = await getStudentByPassport(passportNumber);
      
      if (result.success) {
        setStudentData(result.data);
        setAuthType('student');
        setCurrentUser({ passportNumber });
        // Store in sessionStorage for persistence
        sessionStorage.setItem('passportNumber', passportNumber);
        sessionStorage.setItem('authType', 'student');
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Login error
      return { success: false, error: 'Failed to login' };
    } finally {
      setLoading(false);
    }
  };

  // Admin login with email/password
  const loginAdmin = async (email, password) => {
    try {
      setLoading(true);
      
      const { checkAdminAccess } = await loadDatabase();

      // First check if user is registered as admin
      const adminCheck = await checkAdminAccess(email);
      if (!adminCheck.success) {
        return { success: false, error: 'Not authorized as admin' };
      }

      // Sign in with Firebase Auth
      const [{ auth }, { signInWithEmailAndPassword }] = await Promise.all([
        loadFirebase(),
        loadFirebaseAuth(),
      ]);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      setAdminData(adminCheck.data);
      setAuthType('admin');
      setCurrentUser(userCredential.user);
      
      // Store auth type in sessionStorage
      sessionStorage.setItem('authType', 'admin');
      
      return { success: true };
    } catch (error) {
      // Admin login error
      let errorMessage = 'Failed to login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No admin account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (authType === 'admin') {
        const [{ auth }, { signOut: firebaseSignOut }] = await Promise.all([
          loadFirebase(),
          loadFirebaseAuth(),
        ]);
        if (auth.currentUser) {
          await firebaseSignOut(auth);
        }
      }
      
      setCurrentUser(null);
      setStudentData(null);
      setAdminData(null);
      setAuthType(null);
      
      // Clear session storage
      sessionStorage.removeItem('passportNumber');
      sessionStorage.removeItem('authType');
      sessionStorage.removeItem('pipelineUser'); // Also clear pipeline session

      return { success: true };
    } catch (error) {
      // Logout error
      return { success: false, error: 'Failed to logout' };
    }
  };

  // Check for existing session on mount.
  //
  // The old version of this effect called onAuthStateChanged unconditionally,
  // which is why every visitor to the homepage downloaded the whole Firebase
  // SDK before the app would render anything: this provider gates `children`
  // behind `loading`. The listener only ever did anything when sessionStorage
  // already said `authType === 'admin'`, so checking that first is behaviour
  // preserving, and a visitor with no session now never touches Firebase.
  useEffect(() => {
    const storedAuthType = sessionStorage.getItem('authType');
    const storedPassport = sessionStorage.getItem('passportNumber');

    // No session to restore. Render immediately, load nothing.
    if (storedAuthType !== 'admin' && storedAuthType !== 'student') {
      setLoading(false);
      return;
    }

    if (storedAuthType === 'student') {
      if (storedPassport) {
        // loginWithPassport owns setLoading in its finally block.
        loginWithPassport(storedPassport);
      } else {
        setLoading(false);
      }
      return;
    }

    // storedAuthType === 'admin': this is the only path that needs the SDK.
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
        const [{ auth }, { onAuthStateChanged }, { checkAdminAccess }] = await Promise.all([
          loadFirebase(),
          loadFirebaseAuth(),
          loadDatabase(),
        ]);
        if (cancelled) return;

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (cancelled) return;
          if (user && sessionStorage.getItem('authType') === 'admin') {
            const adminCheck = await checkAdminAccess(user.email);
            if (cancelled) return;
            if (adminCheck.success) {
              setCurrentUser(user);
              setAdminData(adminCheck.data);
              setAuthType('admin');
            }
          }
          setLoading(false);
        });
      } catch (error) {
        // Never leave the app stuck behind the loading gate if the chunk or
        // the Firebase init fails.
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    studentData,
    adminData,
    authType,
    loading,
    loginWithPassport,
    loginAdmin,
    logout,
    isAuthenticated: !!currentUser,
    isStudent: authType === 'student',
    isAdmin: authType === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div className="loading-spinner"></div>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};