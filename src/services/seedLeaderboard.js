import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { encryptEmail, hashPassword, generateProfileColor } from '../utils/crypto';

const TEAM_MEMBERS_DATA = [
  { firstName: 'Tareq', lastName: 'Youssef', email: 'tareq.youssef@medxplore.com', department: 'student-engagement', points: 130, passportNumber: 'MX017' },
  { firstName: 'Ammar', lastName: 'Ashour', email: 'ammar.ashour@medxplore.com', department: 'academic', points: 110, passportNumber: 'MX004' },
  { firstName: 'Ahmed', lastName: 'Aldawaghreh', email: 'ahmed.aldawaghreh@medxplore.com', department: 'academic', points: 95, passportNumber: 'MX002' },
  { firstName: 'Rola', lastName: 'Salameh', email: 'rola.salameh@medxplore.com', department: 'media-communications', points: 50, passportNumber: 'MX024' },
  { firstName: 'Jawad', lastName: 'Ibrahim', email: 'jawad.ibrahim@medxplore.com', department: 'operations-logistics', points: 45, passportNumber: 'MX007' },
  { firstName: 'Bana', lastName: 'Tawalbeh', email: 'bana.tawalbeh@medxplore.com', department: 'operations-logistics', points: 45, passportNumber: 'MX021' },
  { firstName: 'Nesma', lastName: 'Abdel Nour', email: 'nesma.abdelnour@medxplore.com', department: 'operations-logistics', points: 40, passportNumber: 'MX005' },
  { firstName: 'Khalil', lastName: 'Tayyem', email: 'khalil.tayyem@medxplore.com', department: 'student-engagement', points: 40, passportNumber: 'MX006' },
  { firstName: 'Ghena', lastName: 'Alkurdi', email: 'ghena.alkurdi@medxplore.com', department: 'student-engagement', points: 40, passportNumber: 'MX022' },
  { firstName: 'Yazan', lastName: 'Jarrar', email: 'yazan.jarrar@medxplore.com', department: 'operations-logistics', points: 30, passportNumber: 'MX012' },
  { firstName: 'Ahmad', lastName: 'AlShrif', email: 'ahmad.alshrif@medxplore.com', department: 'operations-logistics', points: 30, passportNumber: 'MX026' },
  { firstName: 'Ahmed', lastName: 'Al-Shanti', email: 'ahmed.alshanti@medxplore.com', department: 'student-engagement', points: 30, passportNumber: 'MX025' },
  { firstName: 'Ahmed', lastName: 'Husham', email: 'ahmed.husham@medxplore.com', department: 'operations-logistics', points: 30, passportNumber: 'MX018' },
  { firstName: 'Rahma', lastName: 'Alybroudi', email: 'rahma.alybroudi@medxplore.com', department: 'academic', points: 30, passportNumber: 'MX014' },
  { firstName: 'Jeda', lastName: 'Abboud', email: 'jeda.abboud@medxplore.com', department: 'global-outreach', points: 0, passportNumber: 'MX027' },
  { firstName: 'Mohamed', lastName: 'Idrees', email: 'mohamed.idrees@medxplore.com', department: 'student-engagement', points: 0, passportNumber: 'MX028' },
  { firstName: 'Hala', lastName: 'Khalid Omar', email: 'hala.omar@medxplore.com', department: 'student-engagement', points: 0, passportNumber: 'MX029' },
  { firstName: 'Abdullah', lastName: 'Shehadeh', email: 'abdullah.shehadeh@medxplore.com', department: 'student-engagement', points: 0, passportNumber: 'MX001' },
  { firstName: 'Yazan', lastName: 'Alafrangi', email: 'yazan.alafrangi@medxplore.com', department: 'operations-logistics', points: 0, passportNumber: 'MX003' },
  { firstName: 'Zaid', lastName: 'Hassan', email: 'zaid.hassan@medxplore.com', department: 'academic', points: 0, passportNumber: 'MX008' },
  { firstName: 'Deema', lastName: 'Rami', email: 'deema.rami@medxplore.com', department: 'media-communications', points: 0, passportNumber: 'MX011' },
  { firstName: 'Omar', lastName: 'Agha', email: 'omar.agha@medxplore.com', department: 'academic', points: 0, passportNumber: 'MX013' },
  { firstName: 'Noor', lastName: 'Al-Omeri', email: 'noor.alomeri@medxplore.com', department: 'academic', points: 0, passportNumber: 'MX016' },
  { firstName: 'Roaa', lastName: 'Awwad', email: 'roaa.awwad@medxplore.com', department: 'academic', points: 0, passportNumber: 'MX019' },
  { firstName: 'Rufayda', lastName: 'Bassam', email: 'rufayda.bassam@medxplore.com', department: 'academic', points: 0, passportNumber: 'MX020' },
  { firstName: 'Ahmed', lastName: 'Alsharif', email: 'ahmed.alsharif@medxplore.com', department: 'operations-logistics', points: 0, passportNumber: 'MX030' },
  { firstName: 'Omar', lastName: 'Nashwan', email: 'omar.nashwan@medxplore.com', department: 'media-communications', points: 0, passportNumber: 'MX023' },
  { firstName: 'Obada', lastName: 'Khatatbeh', email: 'obada.khatatbeh@medxplore.com', department: 'student-engagement', points: 0, passportNumber: 'MX015' },
  { firstName: 'Sedra', lastName: 'Jibreen', email: 'sedra.jibreen@medxplore.com', department: 'student-engagement', points: 0, passportNumber: 'MX010' },
  { firstName: 'Shahed', lastName: 'Alsmarat', email: 'shahed.alsmarat@medxplore.com', department: 'media-communications', points: 0, passportNumber: 'MX009' }
];

export const seedLeaderboardData = async () => {
  try {
    const results = {
      created: [],
      updated: [],
      errors: []
    };

    for (const member of TEAM_MEMBERS_DATA) {
      try {
        // Check if worker already exists by email
        const workersRef = collection(db, 'workers');
        const workersSnapshot = await getDocs(workersRef);

        let existingWorker = null;
        let existingWorkerId = null;

        // Check for existing worker with this email or passport number
        for (const workerDoc of workersSnapshot.docs) {
          const workerData = workerDoc.data();
          // Note: We can't easily check encrypted emails, so we'll check by first/last name
          if (workerData.firstName === member.firstName && workerData.lastName === member.lastName) {
            existingWorker = workerData;
            existingWorkerId = workerDoc.id;
            break;
          }
        }

        if (existingWorker) {
          // Update existing worker's points
          await updateDoc(doc(db, 'workers', existingWorkerId), {
            points: member.points,
            departments: [member.department]
          });
          results.updated.push(`${member.firstName} ${member.lastName}`);
        } else {
          // Create new worker
          const defaultPassword = import.meta.env.VITE_DEFAULT_WORKER_PASSWORD;
          if (!defaultPassword) {
            throw new Error('VITE_DEFAULT_WORKER_PASSWORD environment variable is not set');
          }
          const { hash, salt } = await hashPassword(defaultPassword);

          const newWorker = {
            firstName: member.firstName,
            lastName: member.lastName,
            email: encryptEmail(member.email.toLowerCase()),
            passwordHash: hash,
            salt: salt,
            departments: [member.department],
            points: member.points,
            profileColor: generateProfileColor(),
            isActive: true,
            createdAt: serverTimestamp(),
            lastLogin: null,
            sessionToken: null,
            tokenExpiry: null
          };

          await addDoc(collection(db, 'workers'), newWorker);
          results.created.push(`${member.firstName} ${member.lastName}`);
        }
      } catch (error) {
        console.error(`Error processing ${member.firstName} ${member.lastName}:`, error);
        results.errors.push(`${member.firstName} ${member.lastName}: ${error.message}`);
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error seeding leaderboard:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
