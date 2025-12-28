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
  WORKERS: 'workers',
  IDEAS: 'ideas',
  ACCESS_CODES: 'accessCodes',
  FEEDBACK: 'feedback'
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

export const bulkAddStudentsToEvent = async (eventId, studentIds, participationType = 'Attended', adminNotes = '') => {
  try {
    const results = await Promise.all(
      studentIds.map(studentId => addStudentToEvent(studentId, eventId, participationType, adminNotes))
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

export const addStudentToEvent = async (passportNumber, eventId, participationType = 'Attended', adminNotes = '') => {
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
      adminNotes: adminNotes || '',
      pointsAwarded: 0,
      awardedBy: null,
      awardedAt: null,
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

export const addEventToStudent = async (passportNumber, eventId, participationType = 'Attended', adminNotes = '', certificateUrl = null) => {
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
      adminNotes: adminNotes || '',
      pointsAwarded: 0,
      awardedBy: null,
      awardedAt: null,
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
    icon: 'Compass', // Lucide icon for exploring
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
    icon: 'BookMarked', // Lucide icon for education/scholar
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
    icon: 'Brain', // Lucide icon for mentorship/guidance
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
    icon: 'Award', // Lucide icon for achievement/pioneer
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

    // Create worker document with new units/university schema
    const newWorker = {
      firstName: workerData.firstName,
      lastName: workerData.lastName,
      email: encryptEmail(workerData.email.toLowerCase()),
      passwordHash: hash,
      salt: salt,
      // New schema: units and university
      units: workerData.units || [],
      university: workerData.university || 'JUST',
      // Keep departments for backward compatibility during migration
      departments: workerData.departments || [],
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
        university: workerData.university || 'JUST',
        // New schema: units (preferred) with departments fallback
        units: workerData.units || [],
        departments: workerData.departments || [],
        profileColor: workerData.profileColor,
        isActive: workerData.isActive,
        points: workerData.points || 0,
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
      updatedAt: serverTimestamp()
    };

    // Update units if provided (new schema)
    if (updates.units !== undefined) {
      updateData.units = updates.units;
    }

    // Update university if provided
    if (updates.university !== undefined) {
      updateData.university = updates.university;
    }

    // Keep departments for backward compatibility
    if (updates.departments !== undefined) {
      updateData.departments = updates.departments;
    }

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

// Department to Unit migration mapping
const DEPARTMENT_TO_UNIT_MAP = {
  'operations-logistics': 'operations',
  'academic': 'academic',
  'global-outreach': 'external',
  'student-engagement': 'programs',
  'media-communications': 'systems'
};

// Migrate existing workers from departments to units
export const migrateWorkersToUnits = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.WORKERS));
    const results = { migrated: 0, skipped: 0, errors: [] };

    for (const workerDoc of snapshot.docs) {
      const workerData = workerDoc.data();

      // Skip if already migrated (has units array with content)
      if (workerData.units && workerData.units.length > 0) {
        results.skipped++;
        continue;
      }

      try {
        // Map departments to units
        const departments = workerData.departments || [];
        const units = departments
          .map(dept => DEPARTMENT_TO_UNIT_MAP[dept])
          .filter(Boolean);

        // Update worker with units and university
        await updateDoc(doc(db, COLLECTIONS.WORKERS, workerDoc.id), {
          units: units,
          university: workerData.university || 'JUST',
          migratedAt: serverTimestamp()
        });

        results.migrated++;
      } catch (error) {
        results.errors.push({ id: workerDoc.id, error: error.message });
      }
    }

    console.log('Worker migration complete:', results);
    return { success: true, results };
  } catch (error) {
    console.error('Error migrating workers:', error);
    return { success: false, error: error.message };
  }
};

// Authenticate a worker (for unified login)
export const authenticateWorker = async (email, password) => {
  try {
    const workersRef = collection(db, COLLECTIONS.WORKERS);
    const workersSnapshot = await getDocs(workersRef);

    for (const workerDoc of workersSnapshot.docs) {
      const workerData = workerDoc.data();
      const decryptedEmail = decryptEmail(workerData.email);

      if (decryptedEmail === email.toLowerCase()) {
        // Found the worker by email
        if (!workerData.isActive) {
          return { success: false, error: 'Account is inactive' };
        }

        // Verify password
        const { hash } = await hashPassword(password, workerData.salt);

        if (hash === workerData.passwordHash) {
          // Password matches - generate session
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

          await updateDoc(doc(db, COLLECTIONS.WORKERS, workerDoc.id), {
            sessionToken,
            tokenExpiry,
            lastLogin: Date.now()
          });

          return {
            success: true,
            worker: {
              id: workerDoc.id,
              email: decryptedEmail,
              firstName: workerData.firstName,
              lastName: workerData.lastName,
              name: `${workerData.firstName} ${workerData.lastName}`,
              units: workerData.units || [],
              university: workerData.university || 'JUST',
              profileColor: workerData.profileColor,
              isAdmin: false,
              isWorker: true,
              sessionToken,
              tokenExpiry
            }
          };
        } else {
          return { success: false, error: 'Invalid password' };
        }
      }
    }

    return { success: false, error: 'Worker not found' };
  } catch (error) {
    console.error('Error authenticating worker:', error);
    return { success: false, error: error.message };
  }
};

// Update participation notes
export const updateParticipationNotes = async (participationId, adminNotes, adminId) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.PARTICIPATIONS, participationId), {
      adminNotes,
      updatedBy: adminId,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating participation notes:', error);
    return { success: false, error: error.message };
  }
};

// Award points to participation (Operations & Logistics only)
export const awardPointsToParticipation = async (participationId, points, workerId) => {
  try {
    const participationRef = doc(db, COLLECTIONS.PARTICIPATIONS, participationId);
    const participationDoc = await getDoc(participationRef);

    if (!participationDoc.exists()) {
      return { success: false, error: 'Participation not found' };
    }

    const participation = participationDoc.data();

    await updateDoc(participationRef, {
      pointsAwarded: points,
      awardedBy: workerId,
      awardedAt: serverTimestamp()
    });

    // Update student's leaderboard points
    const studentRef = doc(db, COLLECTIONS.STUDENTS, participation.studentId);
    const studentDoc = await getDoc(studentRef);

    if (studentDoc.exists()) {
      const currentPoints = studentDoc.data().leaderboardPoints || 0;
      await updateDoc(studentRef, {
        leaderboardPoints: currentPoints + points
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, error: error.message };
  }
};

// Worker permissions configuration
export const WORKER_PERMISSIONS = {
  // All departments have these base permissions
  BASE: [
    'view_applications',
    'review_applications',
    'approve_applications',
    'reject_applications',
    'manage_events',
    'create_events',
    'edit_events',
    'delete_events',
    'manage_news',
    'create_news',
    'edit_news',
    'delete_news',
    'view_students',
    'view_analytics'
  ],

  // Only Operations & Logistics
  OPERATIONS_LOGISTICS: [
    'award_points',
    'manage_leaderboard',
    'bulk_point_operations'
  ]
};

// Check if worker has permission
export const hasPermission = (workerData, permission) => {
  const basePermissions = WORKER_PERMISSIONS.BASE;
  const opsPermissions = WORKER_PERMISSIONS.OPERATIONS_LOGISTICS;

  // All workers have base permissions
  if (basePermissions.includes(permission)) {
    return true;
  }

  // Only ops & logistics have special permissions
  if (opsPermissions.includes(permission)) {
    return workerData?.department === 'Operations and Logistics';
  }

  return false;
};

// ==========================================
// IDEAS COLLECTION FUNCTIONS (Pipeline System)
// ==========================================

// Pipeline stages (imported from mockData.js structure)
export const PIPELINE_STAGES = {
  SUBMITTED: 'submitted',
  ACADEMIC_REVIEW: 'academic-review',
  PROGRAMS_PACKAGE: 'programs-package',
  OPERATIONS: 'operations',
  EXTERNAL_APPROVALS: 'external-approvals',
  SYSTEMS: 'systems',
  PUBLISHED: 'published',
  PASSPORT_VERIFICATION: 'passport-verification',
  COMPLETED: 'completed',
  RETURNED: 'returned',
  REJECTED: 'rejected'
};

// Pipeline flow order
const PIPELINE_ORDER = [
  PIPELINE_STAGES.SUBMITTED,
  PIPELINE_STAGES.ACADEMIC_REVIEW,
  PIPELINE_STAGES.PROGRAMS_PACKAGE,
  PIPELINE_STAGES.OPERATIONS,
  PIPELINE_STAGES.EXTERNAL_APPROVALS,
  PIPELINE_STAGES.SYSTEMS,
  PIPELINE_STAGES.PUBLISHED,
  PIPELINE_STAGES.PASSPORT_VERIFICATION,
  PIPELINE_STAGES.COMPLETED
];

// Stage to Unit mapping
const STAGE_TO_UNIT = {
  [PIPELINE_STAGES.ACADEMIC_REVIEW]: 'academic',
  [PIPELINE_STAGES.PROGRAMS_PACKAGE]: 'programs',
  [PIPELINE_STAGES.OPERATIONS]: 'operations',
  [PIPELINE_STAGES.EXTERNAL_APPROVALS]: 'external',
  [PIPELINE_STAGES.SYSTEMS]: 'systems',
  [PIPELINE_STAGES.PASSPORT_VERIFICATION]: 'passport'
};

// Get next stage in pipeline
export const getNextStage = (currentStage, requiresExternalApproval = true) => {
  const currentIndex = PIPELINE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= PIPELINE_ORDER.length - 1) return null;

  let nextStage = PIPELINE_ORDER[currentIndex + 1];

  // Skip external approvals if not required
  if (nextStage === PIPELINE_STAGES.EXTERNAL_APPROVALS && !requiresExternalApproval) {
    nextStage = PIPELINE_ORDER[currentIndex + 2];
  }

  return nextStage;
};

// Get previous stage in pipeline
export const getPreviousStage = (currentStage) => {
  const currentIndex = PIPELINE_ORDER.indexOf(currentStage);
  if (currentIndex <= 1) return null;
  return PIPELINE_ORDER[currentIndex - 1];
};

// Get unit ID for a stage
export const getUnitIdForStage = (stage) => {
  return STAGE_TO_UNIT[stage] || null;
};

// Generate unique idea ID
export const generateIdeaId = async (university) => {
  const prefix = `IDEA-${university}-`;
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Submit a new idea
export const submitIdea = async (ideaData) => {
  try {
    // Handle "Other" university - assign to JUST
    const university = ideaData.university === 'Other' ? 'JUST' : ideaData.university;

    const ideaId = await generateIdeaId(university);
    const now = serverTimestamp();

    const newIdea = {
      id: ideaId,
      title: ideaData.title,
      type: ideaData.type,
      university: university,
      originalUniversity: ideaData.university, // Keep track if it was "Other"
      submittedBy: ideaData.submittedBy,
      submittedAt: now,
      targetAudience: ideaData.targetAudience || '',
      goal: ideaData.goal || '',
      description: ideaData.description || '',
      estimatedAttendees: ideaData.estimatedAttendees || 0,
      requiresApproval: ideaData.requiresApproval ?? true,
      suggestedSpeakers: ideaData.suggestedSpeakers || '',
      resourcesNeeded: ideaData.resourcesNeeded || '',
      notes: ideaData.notes || '',
      driveLink: '',
      currentStatus: PIPELINE_STAGES.ACADEMIC_REVIEW,
      currentUnit: 'academic',
      isPublished: false,
      publishedAt: null,
      eventId: null,
      returnReason: null,
      rejectionReason: null,
      statusHistory: [
        {
          status: PIPELINE_STAGES.SUBMITTED,
          timestamp: new Date().toISOString(),
          unit: null,
          actor: ideaData.submittedBy,
          notes: 'Initial submission'
        },
        {
          status: PIPELINE_STAGES.ACADEMIC_REVIEW,
          timestamp: new Date().toISOString(),
          unit: 'academic',
          actor: 'System',
          notes: 'Forwarded for academic review'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(db, COLLECTIONS.IDEAS, ideaId), newIdea);

    return { success: true, id: ideaId, idea: newIdea };
  } catch (error) {
    console.error('Error submitting idea:', error);
    return { success: false, error: error.message };
  }
};

// Get all ideas for a university
export const getIdeasByUniversity = async (university) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.IDEAS),
      where('university', '==', university)
    );
    const snapshot = await getDocs(q);

    let ideas = snapshot.docs.map(doc => ({
      ...doc.data(),
      // Convert Firestore timestamps to JS dates for compatibility
      submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }));

    // Sort by submission date (newest first)
    ideas.sort((a, b) => {
      const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt || 0);
      const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt || 0);
      return dateB - dateA;
    });

    return { success: true, ideas };
  } catch (error) {
    console.error('Error getting ideas by university:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get ideas for a specific unit (optionally filtered by university)
export const getIdeasByUnit = async (unitId, university = null) => {
  try {
    let q;
    if (university) {
      q = query(
        collection(db, COLLECTIONS.IDEAS),
        where('currentUnit', '==', unitId),
        where('university', '==', university)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.IDEAS),
        where('currentUnit', '==', unitId)
      );
    }

    const snapshot = await getDocs(q);

    let ideas = snapshot.docs.map(doc => ({
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }));

    return { success: true, ideas };
  } catch (error) {
    console.error('Error getting ideas by unit:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get ideas by status
export const getIdeasByStatus = async (status, university = null) => {
  try {
    let q;
    if (university) {
      q = query(
        collection(db, COLLECTIONS.IDEAS),
        where('currentStatus', '==', status),
        where('university', '==', university)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.IDEAS),
        where('currentStatus', '==', status)
      );
    }

    const snapshot = await getDocs(q);

    let ideas = snapshot.docs.map(doc => ({
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }));

    return { success: true, ideas };
  } catch (error) {
    console.error('Error getting ideas by status:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get a single idea by ID
export const getIdeaById = async (ideaId) => {
  try {
    const ideaDoc = await getDoc(doc(db, COLLECTIONS.IDEAS, ideaId));

    if (!ideaDoc.exists()) {
      return { success: false, error: 'Idea not found' };
    }

    const data = ideaDoc.data();
    return {
      success: true,
      idea: {
        ...data,
        submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt
      }
    };
  } catch (error) {
    console.error('Error getting idea:', error);
    return { success: false, error: error.message };
  }
};

// Approve an idea (move to next stage)
export const approveIdea = async (ideaId, notes = '', actorName) => {
  try {
    const ideaRef = doc(db, COLLECTIONS.IDEAS, ideaId);
    const ideaDoc = await getDoc(ideaRef);

    if (!ideaDoc.exists()) {
      return { success: false, error: 'Idea not found' };
    }

    const idea = ideaDoc.data();
    const nextStage = getNextStage(idea.currentStatus, idea.requiresApproval);

    if (!nextStage) {
      return { success: false, error: 'Cannot approve - no next stage available' };
    }

    const nextUnit = getUnitIdForStage(nextStage);

    const historyEntry = {
      status: nextStage,
      timestamp: new Date().toISOString(),
      unit: nextUnit,
      actor: actorName || 'System',
      notes: notes || `Approved by ${actorName || 'System'}`
    };

    await updateDoc(ideaRef, {
      currentStatus: nextStage,
      currentUnit: nextUnit,
      statusHistory: [...(idea.statusHistory || []), historyEntry],
      updatedAt: serverTimestamp()
    });

    return { success: true, nextStage, nextUnit };
  } catch (error) {
    console.error('Error approving idea:', error);
    return { success: false, error: error.message };
  }
};

// Return an idea to previous stage
export const returnIdea = async (ideaId, reason, actorName) => {
  try {
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Return reason is required' };
    }

    const ideaRef = doc(db, COLLECTIONS.IDEAS, ideaId);
    const ideaDoc = await getDoc(ideaRef);

    if (!ideaDoc.exists()) {
      return { success: false, error: 'Idea not found' };
    }

    const idea = ideaDoc.data();
    const previousStage = getPreviousStage(idea.currentStatus);

    if (!previousStage) {
      return { success: false, error: 'Cannot return - no previous stage' };
    }

    const previousUnit = getUnitIdForStage(previousStage);

    // Add RETURNED status entry
    const returnedEntry = {
      status: PIPELINE_STAGES.RETURNED,
      timestamp: new Date().toISOString(),
      unit: idea.currentUnit,
      actor: actorName || 'System',
      notes: reason,
      returnedTo: previousUnit
    };

    // Add entry for the stage it's returned to
    const resumeEntry = {
      status: previousStage,
      timestamp: new Date().toISOString(),
      unit: previousUnit,
      actor: 'System',
      notes: `Returned for revision: ${reason}`
    };

    await updateDoc(ideaRef, {
      currentStatus: previousStage,
      currentUnit: previousUnit,
      returnReason: reason,
      statusHistory: [...(idea.statusHistory || []), returnedEntry, resumeEntry],
      updatedAt: serverTimestamp()
    });

    return { success: true, previousStage, previousUnit };
  } catch (error) {
    console.error('Error returning idea:', error);
    return { success: false, error: error.message };
  }
};

// Reject an idea
export const rejectIdea = async (ideaId, reason, actorName) => {
  try {
    if (!reason || reason.trim() === '') {
      return { success: false, error: 'Rejection reason is required' };
    }

    const ideaRef = doc(db, COLLECTIONS.IDEAS, ideaId);
    const ideaDoc = await getDoc(ideaRef);

    if (!ideaDoc.exists()) {
      return { success: false, error: 'Idea not found' };
    }

    const idea = ideaDoc.data();

    const historyEntry = {
      status: PIPELINE_STAGES.REJECTED,
      timestamp: new Date().toISOString(),
      unit: idea.currentUnit,
      actor: actorName || 'System',
      notes: reason
    };

    await updateDoc(ideaRef, {
      currentStatus: PIPELINE_STAGES.REJECTED,
      currentUnit: null,
      rejectionReason: reason,
      statusHistory: [...(idea.statusHistory || []), historyEntry],
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting idea:', error);
    return { success: false, error: error.message };
  }
};

// Update drive link for an idea
export const updateIdeaDriveLink = async (ideaId, driveLink) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.IDEAS, ideaId), {
      driveLink,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating drive link:', error);
    return { success: false, error: error.message };
  }
};

// Publish an idea as an event (Systems unit only)
export const publishIdea = async (ideaId, eventData, actorName) => {
  try {
    const ideaRef = doc(db, COLLECTIONS.IDEAS, ideaId);
    const ideaDoc = await getDoc(ideaRef);

    if (!ideaDoc.exists()) {
      return { success: false, error: 'Idea not found' };
    }

    const idea = ideaDoc.data();

    // Verify idea is in Systems stage
    if (idea.currentStatus !== PIPELINE_STAGES.SYSTEMS) {
      return { success: false, error: 'Idea must be in Systems stage to publish' };
    }

    // Create event in events collection
    const eventId = idea.id.replace('IDEA-', 'EVENT-');

    const newEvent = {
      name: eventData.name || idea.title,
      description: eventData.description || idea.description,
      date: eventData.date,
      location: eventData.location || '',
      maxParticipants: eventData.maxParticipants || idea.estimatedAttendees,
      category: idea.type,
      googleFormsLink: eventData.googleFormsLink || '',
      linkedIdeaId: idea.id,
      university: idea.university,
      createdBy: actorName || 'Systems Unit',
      createdAt: serverTimestamp(),
      participantCount: 0
    };

    // Create the event
    await setDoc(doc(db, COLLECTIONS.EVENTS, eventId), newEvent);

    // Update the idea
    const historyEntry = {
      status: PIPELINE_STAGES.PUBLISHED,
      timestamp: new Date().toISOString(),
      unit: 'systems',
      actor: actorName || 'System',
      notes: `Event published as ${eventId}`
    };

    await updateDoc(ideaRef, {
      currentStatus: PIPELINE_STAGES.PUBLISHED,
      currentUnit: null,
      isPublished: true,
      publishedAt: serverTimestamp(),
      eventId: eventId,
      eventData: {
        name: newEvent.name,
        date: eventData.date,
        location: newEvent.location,
        maxParticipants: newEvent.maxParticipants,
        googleFormsLink: newEvent.googleFormsLink
      },
      statusHistory: [...(idea.statusHistory || []), historyEntry],
      updatedAt: serverTimestamp()
    });

    return { success: true, eventId, event: newEvent };
  } catch (error) {
    console.error('Error publishing idea:', error);
    return { success: false, error: error.message };
  }
};

// Get pending count for a unit
export const getPendingCountForUnit = async (unitId, university = null) => {
  try {
    const result = await getIdeasByUnit(unitId, university);
    if (!result.success) return 0;

    // Filter out rejected ideas
    const pendingIdeas = result.ideas.filter(
      idea => idea.currentStatus !== PIPELINE_STAGES.REJECTED
    );

    return pendingIdeas.length;
  } catch (error) {
    console.error('Error getting pending count:', error);
    return 0;
  }
};

// Get all active ideas (not rejected/published/completed)
export const getActiveIdeas = async (university = null) => {
  try {
    let q;
    if (university) {
      q = query(
        collection(db, COLLECTIONS.IDEAS),
        where('university', '==', university)
      );
    } else {
      q = collection(db, COLLECTIONS.IDEAS);
    }

    const snapshot = await getDocs(q);

    let ideas = snapshot.docs
      .map(doc => ({
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
      }))
      .filter(idea =>
        idea.currentStatus !== PIPELINE_STAGES.REJECTED &&
        idea.currentStatus !== PIPELINE_STAGES.PUBLISHED &&
        idea.currentStatus !== PIPELINE_STAGES.COMPLETED
      );

    return { success: true, ideas };
  } catch (error) {
    console.error('Error getting active ideas:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get published ideas/events
export const getPublishedIdeas = async (university = null) => {
  try {
    return await getIdeasByStatus(PIPELINE_STAGES.PUBLISHED, university);
  } catch (error) {
    console.error('Error getting published ideas:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get rejected ideas
export const getRejectedIdeas = async (university = null) => {
  try {
    return await getIdeasByStatus(PIPELINE_STAGES.REJECTED, university);
  } catch (error) {
    console.error('Error getting rejected ideas:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// Get all ideas (for admin overview)
export const getAllIdeas = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.IDEAS));

    let ideas = snapshot.docs.map(doc => ({
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || doc.data().submittedAt,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }));

    // Sort by submission date (newest first)
    ideas.sort((a, b) => {
      const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt || 0);
      const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt || 0);
      return dateB - dateA;
    });

    return { success: true, ideas };
  } catch (error) {
    console.error('Error getting all ideas:', error);
    return { success: false, error: error.message, ideas: [] };
  }
};

// ===== Feedback Functions =====

export const submitFeedback = async (feedbackData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACK), {
      ...feedbackData,
      status: 'new',
      createdAt: serverTimestamp(),
      resolvedAt: null,
      resolvedBy: null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

export const getAllFeedback = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FEEDBACK));
    const feedback = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      resolvedAt: doc.data().resolvedAt?.toDate?.() || doc.data().resolvedAt
    }));

    // Sort by creation date (newest first)
    feedback.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return { success: true, feedback };
  } catch (error) {
    console.error('Error getting feedback:', error);
    return { success: false, error: error.message, feedback: [] };
  }
};

export const updateFeedbackStatus = async (feedbackId, status, resolvedBy = null) => {
  try {
    const updates = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'resolved') {
      updates.resolvedAt = serverTimestamp();
      updates.resolvedBy = resolvedBy;
    }

    await updateDoc(doc(db, COLLECTIONS.FEEDBACK, feedbackId), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return { success: false, error: error.message };
  }
};

export const deleteFeedback = async (feedbackId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FEEDBACK, feedbackId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return { success: false, error: error.message };
  }
};

// ========== ACCESS CODE FUNCTIONS ==========

// Create a new access code
export const createAccessCode = async (codeData) => {
  try {
    const code = codeData.code.toUpperCase();

    // Check if code already exists
    const existingDoc = await getDoc(doc(db, COLLECTIONS.ACCESS_CODES, code));
    if (existingDoc.exists()) {
      return { success: false, error: 'Access code already exists' };
    }

    await setDoc(doc(db, COLLECTIONS.ACCESS_CODES, code), {
      code: code,
      university: codeData.university || 'ALL',
      description: codeData.description || '',
      isActive: true,
      usageCount: 0,
      createdAt: serverTimestamp(),
      expiresAt: codeData.expiresAt || null
    });

    return { success: true, code };
  } catch (error) {
    console.error('Error creating access code:', error);
    return { success: false, error: error.message };
  }
};

// Get all access codes
export const getAllAccessCodes = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ACCESS_CODES));
    const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt descending
    codes.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    return { success: true, codes };
  } catch (error) {
    console.error('Error getting access codes:', error);
    return { success: false, error: error.message, codes: [] };
  }
};

// Validate an access code
export const validateAccessCode = async (code, university = null) => {
  try {
    const codeUpper = code.toUpperCase();
    const codeDoc = await getDoc(doc(db, COLLECTIONS.ACCESS_CODES, codeUpper));

    if (!codeDoc.exists()) {
      return { success: false, error: 'Invalid access code' };
    }

    const codeData = codeDoc.data();

    // Check if code is active
    if (!codeData.isActive) {
      return { success: false, error: 'This access code has been deactivated' };
    }

    // Check if code has expired
    if (codeData.expiresAt) {
      const expiryDate = codeData.expiresAt.toDate?.() || new Date(codeData.expiresAt);
      if (expiryDate < new Date()) {
        return { success: false, error: 'This access code has expired' };
      }
    }

    // Check if code is for a specific university
    if (codeData.university !== 'ALL' && university && codeData.university !== university) {
      return { success: false, error: 'This access code is not valid for your university' };
    }

    // Increment usage count
    await updateDoc(doc(db, COLLECTIONS.ACCESS_CODES, codeUpper), {
      usageCount: (codeData.usageCount || 0) + 1,
      lastUsedAt: serverTimestamp()
    });

    return { success: true, codeData };
  } catch (error) {
    console.error('Error validating access code:', error);
    return { success: false, error: error.message };
  }
};

// Update an access code
export const updateAccessCode = async (codeId, updates) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.ACCESS_CODES, codeId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating access code:', error);
    return { success: false, error: error.message };
  }
};

// Delete an access code
export const deleteAccessCode = async (codeId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ACCESS_CODES, codeId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting access code:', error);
    return { success: false, error: error.message };
  }
};

export default {
  // Application functions
  submitApplication,
  getApplications,
  approveApplication,
  deleteApplication,
  // Student functions
  getStudentByPassport,
  getStudentEvents,
  getAllStudents,
  updateStudent,
  deleteStudent,
  updateStudentTier,
  addEventToStudent,
  removeEventFromStudent,
  generatePassportNumber,
  // Event functions
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  bulkAddStudentsToEvent,
  getEventStats,
  addStudentToEvent,
  // Admin functions
  checkAdminAccess,
  // Department functions
  getDepartmentAccess,
  createDepartment,
  // News functions
  createNews,
  getAllNews,
  updateNews,
  deleteNews,
  // Worker functions
  createWorker,
  getAllWorkers,
  updateWorker,
  deleteWorker,
  migrateWorkersToUnits,
  authenticateWorker,
  updateParticipationNotes,
  awardPointsToParticipation,
  WORKER_PERMISSIONS,
  hasPermission,
  // Ideas/Pipeline functions
  PIPELINE_STAGES,
  getNextStage,
  getPreviousStage,
  getUnitIdForStage,
  generateIdeaId,
  submitIdea,
  getIdeasByUniversity,
  getIdeasByUnit,
  getIdeasByStatus,
  getIdeaById,
  approveIdea,
  returnIdea,
  rejectIdea,
  updateIdeaDriveLink,
  publishIdea,
  getPendingCountForUnit,
  getActiveIdeas,
  getPublishedIdeas,
  getRejectedIdeas,
  getAllIdeas,
  // Feedback functions
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  // Access Code functions
  createAccessCode,
  getAllAccessCodes,
  validateAccessCode,
  updateAccessCode,
  deleteAccessCode
};