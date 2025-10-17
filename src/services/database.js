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
import { hashPassword, encryptEmail, decryptEmail, generateProfileColor } from '../utils/crypto';

// Collection names
const COLLECTIONS = {
  STUDENTS: 'students',
  APPLICATIONS: 'applications',
  EVENTS: 'events',
  PARTICIPATIONS: 'participations',
  ADMINS: 'admins',
  ACHIEVEMENTS: 'achievements',
  TIERS: 'tiers',
  DEPARTMENTS: 'departments',
  NEWS: 'news',
  WORKERS: 'workers'
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
    // Error submitting application
    return { success: false, error: error.message };
  }
};

export const getApplications = async (status = null) => {
  try {
    let q = collection(db, COLLECTIONS.APPLICATIONS);
    if (status) {
      q = query(q, where('status', '==', status));
    }
    const snapshot = await getDocs(q);
    let applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually by submittedAt
    applications.sort((a, b) => {
      const dateA = a.submittedAt?.toDate?.() || new Date(0);
      const dateB = b.submittedAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return applications;
  } catch (error) {
    // Error getting applications
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
      tier: 'Explorer',
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
    // Error approving application
    return { success: false, error: error.message };
  }
};

export const deleteApplication = async (applicationId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.APPLICATIONS, applicationId));
    return { success: true };
  } catch (error) {
    // Error deleting application
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
    // Error getting student
    return { success: false, error: error.message };
  }
};

export const getStudentEvents = async (passportNumber) => {
  try {
    // Getting events for student
    
    // Use simple query without orderBy to avoid index issues
    const q = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('studentId', '==', passportNumber)
    );
    const snapshot = await getDocs(q);
    
    // Found participations
    
    const participations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually by addedAt
    participations.sort((a, b) => {
      const dateA = a.addedAt?.toDate?.() || new Date(0);
      const dateB = b.addedAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    // Get event details for each participation
    const eventPromises = participations.map(async (participation) => {
      try {
        const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, participation.eventId));
        const eventData = eventDoc.exists() ? eventDoc.data() : null;
        // Event data found
        return {
          ...participation,
          event: eventData
        };
      } catch (error) {
        // Error getting event details
        return {
          ...participation,
          event: null
        };
      }
    });
    
    const result = await Promise.all(eventPromises);
    // Student events retrieved
    return result;
  } catch (error) {
    // Error getting student events
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
    // Error creating event
    return { success: false, error: error.message };
  }
};

export const getAllEvents = async () => {
  try {
    const q = collection(db, COLLECTIONS.EVENTS);
    const snapshot = await getDocs(q);
    let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually by date
    events.sort((a, b) => {
      const dateA = a.date?.toDate?.() || new Date(a.date) || new Date(0);
      const dateB = b.date?.toDate?.() || new Date(b.date) || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return events;
  } catch (error) {
    // Error getting events
    return [];
  }
};

export const updateEvent = async (eventId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    // Error updating event
    return { success: false, error: error.message };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    // Delete event record
    await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId));
    
    // Delete associated participations
    const participationsQuery = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('eventId', '==', eventId)
    );
    const participationsSnapshot = await getDocs(participationsQuery);
    
    // Update student event counts for each participation
    const studentUpdates = {};
    participationsSnapshot.docs.forEach(doc => {
      const participation = doc.data();
      if (participation.studentId) {
        studentUpdates[participation.studentId] = (studentUpdates[participation.studentId] || 0) + 1;
      }
    });
    
    // Delete participations
    const deletePromises = participationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Update student event counts and tiers
    const updatePromises = Object.entries(studentUpdates).map(async ([studentId, eventsToSubtract]) => {
      const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
      if (studentDoc.exists()) {
        const currentTotal = studentDoc.data().totalEvents || 0;
        const newTotal = Math.max(0, currentTotal - eventsToSubtract);
        
        // Calculate new tier
        let newTier = 'Explorer';
        if (newTotal >= 30) newTier = 'Pioneer';
        else if (newTotal >= 20) newTier = 'Mentor';
        else if (newTotal >= 5) newTier = 'Scholar';

        await updateDoc(doc(db, COLLECTIONS.STUDENTS, studentId), {
          totalEvents: newTotal,
          tier: newTier,
          updatedAt: serverTimestamp()
        });
      }
    });
    
    await Promise.all(updatePromises);
    
    return { success: true };
  } catch (error) {
    // Error deleting event
    return { success: false, error: error.message };
  }
};

export const getEventParticipants = async (eventId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('eventId', '==', eventId)
    );
    const snapshot = await getDocs(q);
    
    const participations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get student details for each participation
    const participantPromises = participations.map(async (participation) => {
      const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, participation.studentId));
      return {
        ...participation,
        student: studentDoc.exists() ? studentDoc.data() : null
      };
    });
    
    return await Promise.all(participantPromises);
  } catch (error) {
    // Error getting event participants
    return [];
  }
};

export const bulkAddStudentsToEvent = async (eventId, studentIds, participationType = 'Attended') => {
  try {
    const results = await Promise.all(
      studentIds.map(studentId => addStudentToEvent(studentId, eventId, participationType))
    );
    
    const successCount = results.filter(result => result.success).length;
    const failCount = results.length - successCount;
    
    return { 
      success: true, 
      message: `Added ${successCount} students successfully${failCount > 0 ? `, ${failCount} failed` : ''}` 
    };
  } catch (error) {
    // Error bulk adding students to event
    return { success: false, error: error.message };
  }
};

export const getEventStats = async (eventId) => {
  try {
    const participants = await getEventParticipants(eventId);
    
    const stats = {
      totalParticipants: participants.length,
      byType: {},
      byTier: {}
    };
    
    participants.forEach(participant => {
      // Count by participation type
      const type = participant.participationType || 'Attended';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Count by tier
      const tier = participant.student?.tier || 'Bronze';
      stats.byTier[tier] = (stats.byTier[tier] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    // Error getting event stats
    return { totalParticipants: 0, byType: {}, byTier: {} };
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
      let newTier = 'Explorer';
      if (newTotal >= 30) newTier = 'Pioneer';
      else if (newTotal >= 20) newTier = 'Mentor';
      else if (newTotal >= 5) newTier = 'Scholar';

      await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
        totalEvents: newTotal,
        tier: newTier
      });
    }

    return { success: true };
  } catch (error) {
    // Error adding student to event
    return { success: false, error: error.message };
  }
};

// Student management functions
export const getAllStudents = async (searchQuery = '', tierFilter = 'all') => {
  try {
    let q = collection(db, COLLECTIONS.STUDENTS);
    const snapshot = await getDocs(q);
    
    let students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually by createdAt
    students.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      students = students.filter(student => 
        student.fullName?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.university?.toLowerCase().includes(query) ||
        student.passportNumber?.toLowerCase().includes(query)
      );
    }
    
    // Apply tier filter
    if (tierFilter !== 'all') {
      students = students.filter(student => student.tier === tierFilter);
    }
    
    return students;
  } catch (error) {
    // Error getting students
    return [];
  }
};

export const updateStudent = async (passportNumber, updates) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    // Error updating student
    return { success: false, error: error.message };
  }
};

export const deleteStudent = async (passportNumber) => {
  try {
    // Delete student record
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber));
    
    // Delete associated participations
    const participationsQuery = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('studentId', '==', passportNumber)
    );
    const participationsSnapshot = await getDocs(participationsQuery);
    
    const deletePromises = participationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error) {
    // Error deleting student
    return { success: false, error: error.message };
  }
};

export const updateStudentTier = async (passportNumber, newTier) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
      tier: newTier,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    // Error updating student tier
    return { success: false, error: error.message };
  }
};

export const addEventToStudent = async (passportNumber, eventId, participationType = 'Attended', certificateUrl = null) => {
  try {
    // Adding event to student
    
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
    const participationData = {
      studentId: passportNumber,
      eventId,
      participationType,
      certificateUrl,
      addedAt: serverTimestamp()
    };
    
    // Adding participation
    await addDoc(collection(db, COLLECTIONS.PARTICIPATIONS), participationData);
    // Participation added

    // Update student's event count and tier
    const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber));
    if (studentDoc.exists()) {
      const currentTotal = studentDoc.data().totalEvents || 0;
      const newTotal = currentTotal + 1;
      
      // Calculate new tier
      let newTier = 'Explorer';
      if (newTotal >= 30) newTier = 'Pioneer';
      else if (newTotal >= 20) newTier = 'Mentor';
      else if (newTotal >= 5) newTier = 'Scholar';

      // Updating student tier
      await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
        totalEvents: newTotal,
        tier: newTier,
        updatedAt: serverTimestamp()
      });
    }

    return { success: true };
  } catch (error) {
    // Error adding event to student
    return { success: false, error: error.message };
  }
};

export const removeEventFromStudent = async (passportNumber, eventId) => {
  try {
    // Find and delete participation record
    const q = query(
      collection(db, COLLECTIONS.PARTICIPATIONS),
      where('studentId', '==', passportNumber),
      where('eventId', '==', eventId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);
      
      // Update student's event count and tier
      const studentDoc = await getDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber));
      if (studentDoc.exists()) {
        const currentTotal = studentDoc.data().totalEvents || 0;
        const newTotal = Math.max(0, currentTotal - 1);
        
        // Calculate new tier
        let newTier = 'Explorer';
        if (newTotal >= 30) newTier = 'Pioneer';
        else if (newTotal >= 20) newTier = 'Mentor';
        else if (newTotal >= 5) newTier = 'Scholar';

        await updateDoc(doc(db, COLLECTIONS.STUDENTS, passportNumber), {
          totalEvents: newTotal,
          tier: newTier,
          updatedAt: serverTimestamp()
        });
      }
    }

    return { success: true };
  } catch (error) {
    // Error removing event from student
    return { success: false, error: error.message };
  }
};

// Admin functions
export const checkAdminAccess = async (email) => {
  try {
    // Checking admin access
    const q = query(collection(db, COLLECTIONS.ADMINS), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    // Admin query completed
    
    if (!snapshot.empty) {
      const adminData = snapshot.docs[0].data();
      // Admin data found
      return { success: true, data: { id: snapshot.docs[0].id, ...adminData } };
    } else {
      // No admin record found
      return { success: false, error: 'Not authorized as admin' };
    }
  } catch (error) {
    // Error checking admin access
    return { success: false, error: error.message };
  }
};

// Tier definitions
export const TIER_DEFINITIONS = {
  Explorer: { 
    min: 0, 
    max: 4, 
    color: '#A9D3D8', // MedXplore light blue
    emoji: '🔵',
    icon: 'explore', // Material icon for exploring/compass
    description: "You've taken your first step.",
    benefits: [
      'Personalized MedXplore Passport issued',
      'Digital Certificate of Engagement (Explorer Level)',
      'Access to MedXplore\'s digital magazine & resource hub',
      'Recognition as an active participant'
    ]
  },
  Scholar: { 
    min: 5, 
    max: 19, 
    color: '#C0C0C0', // Silver/warm gray
    emoji: '⚪',
    icon: 'school', // Material icon for education/scholar
    description: "You're consistently involved and growing your experience.",
    benefits: [
      'Scholar-level certificate of achievement',
      'Featured on the MedXplore Scholars Wall (website/app section)',
      'Access to selected exclusive academic sessions and closed Q&As',
      'Invited to contribute to MedXplore\'s Student Voice Corner (quotes, opinions, article ideas)'
    ]
  },
  Mentor: { 
    min: 20, 
    max: 29, 
    color: '#9CAF88', // Sage green
    emoji: '🟢',
    icon: 'psychology', // Material icon for mentorship/guidance
    description: "You've gone beyond participation — you're becoming a guide.",
    benefits: [
      'Mentor-level certificate with official verification',
      'Early access to registration for premium workshops',
      'Invitation to internal MedXplore leadership prep sessions',
      'Invitation to join focus groups on student development needs'
    ]
  },
  Pioneer: { 
    min: 30, 
    max: null, 
    color: '#1a1a1a', // Black
    emoji: '⚫',
    icon: 'military_tech', // Material icon for achievement/pioneer
    description: "You're setting the standard. You've earned recognition.",
    benefits: [
      'Pioneer-tier digital certificate of excellence',
      'Option to apply as a Student Ambassador',
      'Featured profile on MedXplore website or app',
      'Access to beta features / pilot programs (when launched)',
      'Eligibility to request MedXplore endorsement letter for your CV'
    ]
  }
};

// Department functions
export const getDepartmentAccess = async (userId, departmentId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DEPARTMENTS),
      where('id', '==', departmentId)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { success: false, error: 'Department not found' };
    }
    
    const department = snapshot.docs[0].data();
    
    // Check if user has access (admins have access to all departments)
    const hasAccess = department.members?.includes(userId) || 
                     department.admins?.includes(userId);
    
    return { success: hasAccess, data: department };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const createDepartment = async (departmentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DEPARTMENTS), {
      ...departmentData,
      createdAt: serverTimestamp(),
      members: [],
      admins: []
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// News functions
export const createNews = async (newsData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NEWS), {
      ...newsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllNews = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.NEWS), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
};

export const updateNews = async (newsId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.NEWS, newsId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteNews = async (newsId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NEWS, newsId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Worker management functions
export const createWorker = async (workerData) => {
  try {
    // Check if email already exists
    const workersRef = collection(db, COLLECTIONS.WORKERS);
    const workersSnapshot = await getDocs(workersRef);
    
    for (const workerDoc of workersSnapshot.docs) {
      const existingWorker = workerDoc.data();
      if (decryptEmail(existingWorker.email) === workerData.email.toLowerCase()) {
        return { success: false, error: 'Email already exists' };
      }
    }

    // Hash password
    const { hash, salt } = await hashPassword(workerData.password);
    
    // Create worker document
    const newWorker = {
      firstName: workerData.firstName,
      lastName: workerData.lastName,
      email: encryptEmail(workerData.email.toLowerCase()),
      passwordHash: hash,
      salt: salt,
      departments: workerData.departments,
      profileColor: generateProfileColor(),
      isActive: true,
      createdAt: serverTimestamp(),
      lastLogin: null,
      sessionToken: null,
      tokenExpiry: null
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.WORKERS), newWorker);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating worker:', error);
    return { success: false, error: error.message };
  }
};

export const getAllWorkers = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.WORKERS));
    const workers = [];
    
    snapshot.docs.forEach(doc => {
      const workerData = doc.data();
      workers.push({
        id: doc.id,
        firstName: workerData.firstName,
        lastName: workerData.lastName,
        email: decryptEmail(workerData.email),
        departments: workerData.departments,
        profileColor: workerData.profileColor,
        isActive: workerData.isActive,
        createdAt: workerData.createdAt,
        lastLogin: workerData.lastLogin
      });
    });
    
    // Sort by creation date
    workers.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    return { success: true, workers };
  } catch (error) {
    console.error('Error getting workers:', error);
    return { success: false, error: error.message, workers: [] };
  }
};

export const updateWorker = async (workerId, updates) => {
  try {
    const updateData = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      departments: updates.departments,
      updatedAt: serverTimestamp()
    };

    // Update email if changed
    if (updates.email) {
      updateData.email = encryptEmail(updates.email.toLowerCase());
    }

    // Update password if provided
    if (updates.password) {
      const { hash, salt } = await hashPassword(updates.password);
      updateData.passwordHash = hash;
      updateData.salt = salt;
    }

    // Update active status if provided
    if (typeof updates.isActive !== 'undefined') {
      updateData.isActive = updates.isActive;
      // Clear session if deactivating
      if (!updates.isActive) {
        updateData.sessionToken = null;
        updateData.tokenExpiry = null;
      }
    }

    await updateDoc(doc(db, COLLECTIONS.WORKERS, workerId), updateData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating worker:', error);
    return { success: false, error: error.message };
  }
};

export const deleteWorker = async (workerId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.WORKERS, workerId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting worker:', error);
    return { success: false, error: error.message };
  }
};

export default {
  submitApplication,
  getApplications,
  approveApplication,
  deleteApplication,
  getStudentByPassport,
  getStudentEvents,
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  bulkAddStudentsToEvent,
  getEventStats,
  addStudentToEvent,
  checkAdminAccess,
  generatePassportNumber,
  getAllStudents,
  updateStudent,
  deleteStudent,
  updateStudentTier,
  addEventToStudent,
  removeEventFromStudent,
  getDepartmentAccess,
  createDepartment,
  createNews,
  getAllNews,
  updateNews,
  deleteNews,
  createWorker,
  getAllWorkers,
  updateWorker,
  deleteWorker
};