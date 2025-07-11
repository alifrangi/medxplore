import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  addDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  APPLICATIONS: 'applications',
  EVENTS: 'events',
  PARTICIPATIONS: 'participations',
  ADMINS: 'admins',
  ACHIEVEMENTS: 'achievements',
  TIERS: 'tiers'
};

// Helper function to generate passport numbers
export const generatePassportNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MXP-${year}-${random}`;
};

// Student/Application functions
export const submitApplication = async (applicationData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.APPLICATIONS), {
      ...applicationData,
      status: 'pending',
      submittedAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, error: error.message };
  }
};

export const getApplications = async (status = null) => {
  try {
    let q = collection(db, COLLECTIONS.APPLICATIONS);
    if (status) {
      q = query(q, where('status', '==', status), orderBy('submittedAt', 'desc'));
    } else {
      q = query(q, orderBy('submittedAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting applications:', error);
    return [];
  }
};

export const approveApplication = async (applicationId, adminId) => {
  try {
    const appDoc = await getDoc(doc(db, COLLECTIONS.APPLICATIONS, applicationId));
    if (!appDoc.exists()) {
      throw new Error('Application not found');
    }

    const appData = appDoc.data();
    const passportNumber = generatePassportNumber();

    // Create student record
    await setDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
      ...appData,
      passportNumber,
      tier: 'Bronze',
      totalEvents: 0,
      createdAt: serverTimestamp(),
      approvedBy: adminId,
      achievements: [],
      status: 'active'
    });

    // Update application status
    await updateDoc(doc(db, COLLECTIONS.APPLICATIONS, applicationId), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
      passportNumber
    });

    return { success: true, passportNumber };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, error: error.message };
  }
};

// Student passport functions
export const getStudentByPassport = async (passportNumber) => {
  try {
    const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber));
    if (studentDoc.exists()) {
      return { success: true, data: studentDoc.data() };
    } else {
      return { success: false, error: 'Invalid passport number' };
    }
  } catch (error) {
    console.error('Error getting student:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentEvents = async (passportNumber) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('studentId', '==', passportNumber),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const participations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get event details for each participation
    const eventPromises = participations.map(async (participation) => {
      const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, participation.eventId));
      return {
        ...participation,
        event: eventDoc.exists() ? eventDoc.data() : null
      };
    });
    
    return await Promise.all(eventPromises);
  } catch (error) {
    console.error('Error getting student events:', error);
    return [];
  }
};

// Event management functions
export const createEvent = async (eventData, adminId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      ...eventData,
      createdBy: adminId,
      createdAt: serverTimestamp(),
      participantCount: 0
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }
};

export const getAllEvents = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.EVENTS), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
};

export const addStudentToEvent = async (passportNumber, eventId, participationType = 'Attended') => {
  try {
    // Check if participation already exists
    const q = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('studentId', '==', passportNumber),
      where('eventId', '==', eventId)
    );
    const existing = await getDocs(q);
    
    if (!existing.empty) {
      return { success: false, error: 'Student already registered for this event' };
    }

    // Add participation record
    await addDoc(collection(db, COLLECTIONS.PARTICIPATIONS), {
      studentId: passportNumber,
      eventId,
      participationType,
      addedAt: serverTimestamp(),
      certificateUrl: null
    });

    // Update student's event count
    const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber));
    if (studentDoc.exists()) {
      const currentTotal = studentDoc.data().totalEvents || 0;
      const newTotal = currentTotal + 1;
      
      // Calculate new tier
      let newTier = 'Bronze';
      if (newTotal >= 20) newTier = 'Platinum';
      else if (newTotal >= 10) newTier = 'Gold';
      else if (newTotal >= 5) newTier = 'Silver';

      await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
        totalEvents: newTotal,
        tier: newTier
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding student to event:', error);
    return { success: false, error: error.message };
  }
};

// Admin functions
export const checkAdminAccess = async (email) => {
  try {
    console.log('Checking admin access for email:', email);
    const q = query(collection(db, COLLECTIONS.ADMINS), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    console.log('Admin query result:', snapshot.size, 'documents found');
    
    if (!snapshot.empty) {
      const adminData = snapshot.docs[0].data();
      console.log('Admin data found:', adminData);
      return { success: true, data: { id: snapshot.docs[0].id, ...adminData } };
    } else {
      console.log('No admin record found for email:', email);
      return { success: false, error: 'Not authorized as admin' };
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { success: false, error: error.message };
  }
};

// Tier definitions
export const TIER_DEFINITIONS = {
  Bronze: { min: 0, max: 4, color: '#CD7F32', benefits: ['Basic certificate', 'Event participation tracking'] },
  Silver: { min: 5, max: 9, color: '#C0C0C0', benefits: ['Silver certificate', 'Priority event registration', 'LinkedIn badge'] },
  Gold: { min: 10, max: 19, color: '#FFD700', benefits: ['Gold certificate', 'Recommendation letter eligibility', 'Exclusive workshops'] },
  Platinum: { min: 20, max: null, color: '#E5E4E2', benefits: ['Platinum certificate', 'Direct mentorship', 'Research opportunities', 'Conference speaking slots'] }
};

export default {
  submitApplication,
  getApplications,
  approveApplication,
  getStudentByPassport,
  getStudentEvents,
  createEvent,
  getAllEvents,
  addStudentToEvent,
  checkAdminAccess,
  generatePassportNumber
};