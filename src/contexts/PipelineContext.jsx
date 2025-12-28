import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  submitIdea as dbSubmitIdea,
  approveIdea as dbApproveIdea,
  returnIdea as dbReturnIdea,
  rejectIdea as dbRejectIdea,
  publishIdea as dbPublishIdea,
  updateIdeaDriveLink as dbUpdateDriveLink,
  getIdeasByUnit as dbGetIdeasByUnit,
  getIdeasByStatus as dbGetIdeasByStatus,
  getIdeasByUniversity as dbGetIdeasByUniversity,
  getIdeaById as dbGetIdeaById,
  getPendingCountForUnit as dbGetPendingCountForUnit,
  getActiveIdeas as dbGetActiveIdeas,
  getPublishedIdeas as dbGetPublishedIdeas,
  getRejectedIdeas as dbGetRejectedIdeas,
  PIPELINE_STAGES as DB_PIPELINE_STAGES
} from '../services/database';
import {
  initialMockAnnouncements,
  PIPELINE_STAGES,
  UNITS,
  UNIT_PERMISSIONS,
  STATUS_CONFIG,
  getNextStage,
  getPreviousStage,
  getUnitForStage,
  getUnitIdForStage
} from '../data/mockData';

const PipelineContext = createContext(null);

export const usePipeline = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipeline must be used within a PipelineProvider');
  }
  return context;
};

// Helper to load user from sessionStorage
const loadUserFromStorage = () => {
  try {
    const stored = sessionStorage.getItem('pipelineUser');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    sessionStorage.removeItem('pipelineUser');
  }
  return null;
};

export const PipelineProvider = ({ children }) => {
  // User state - initialize from sessionStorage to avoid race conditions
  const [currentUser, setCurrentUser] = useState(loadUserFromStorage);

  // Ideas state - fetched from Firebase with real-time updates
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(true);

  // Announcements state (still mock for now)
  const [announcements] = useState(initialMockAnnouncements);

  // Set up real-time listener for ideas from Firebase
  useEffect(() => {
    setIdeasLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'ideas'),
      (snapshot) => {
        const fetchedIdeas = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            // Convert Firestore timestamps to JS dates
            submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            publishedAt: data.publishedAt?.toDate?.() || data.publishedAt
          };
        });

        // Sort by submission date (newest first)
        fetchedIdeas.sort((a, b) => {
          const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt || 0);
          const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt || 0);
          return dateB - dateA;
        });

        setIdeas(fetchedIdeas);
        setIdeasLoading(false);
      },
      (error) => {
        console.error('Error listening to ideas:', error);
        setIdeasLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Set user directly (for Firebase worker authentication)
  const setUserDirectly = useCallback((user) => {
    setCurrentUser(user);
    if (user) {
      sessionStorage.setItem('pipelineUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('pipelineUser');
    }
  }, []);

  // Logout
  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('pipelineUser');
  }, []);

  // Restore session on mount
  const restoreSession = useCallback(() => {
    const stored = sessionStorage.getItem('pipelineUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        return user;
      } catch (e) {
        sessionStorage.removeItem('pipelineUser');
      }
    }
    return null;
  }, []);

  // Submit new idea to Firebase
  const submitIdea = useCallback(async (ideaData) => {
    try {
      const result = await dbSubmitIdea(ideaData);
      if (result.success) {
        return result.idea;
      }
      throw new Error(result.error || 'Failed to submit idea');
    } catch (error) {
      console.error('Error submitting idea:', error);
      throw error;
    }
  }, []);

  // Approve idea (move to next stage) - Firebase
  const approveIdea = useCallback(async (ideaId, notes = '') => {
    try {
      const result = await dbApproveIdea(ideaId, notes, currentUser?.name || 'System');
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve idea');
      }
      return result;
    } catch (error) {
      console.error('Error approving idea:', error);
      throw error;
    }
  }, [currentUser]);

  // Return idea to previous unit - Firebase
  const returnIdea = useCallback(async (ideaId, reason) => {
    try {
      const result = await dbReturnIdea(ideaId, reason, currentUser?.name || 'System');
      if (!result.success) {
        throw new Error(result.error || 'Failed to return idea');
      }
      return result;
    } catch (error) {
      console.error('Error returning idea:', error);
      throw error;
    }
  }, [currentUser]);

  // Reject idea - Firebase
  const rejectIdea = useCallback(async (ideaId, reason) => {
    try {
      const result = await dbRejectIdea(ideaId, reason, currentUser?.name || 'System');
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject idea');
      }
      return result;
    } catch (error) {
      console.error('Error rejecting idea:', error);
      throw error;
    }
  }, [currentUser]);

  // Update drive link - Firebase
  const updateDriveLink = useCallback(async (ideaId, driveLink) => {
    try {
      const result = await dbUpdateDriveLink(ideaId, driveLink);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update drive link');
      }
      return result;
    } catch (error) {
      console.error('Error updating drive link:', error);
      throw error;
    }
  }, []);

  // Publish idea (Systems unit - converts idea to event) - Firebase
  const publishIdea = useCallback(async (ideaId, eventData = {}) => {
    try {
      const result = await dbPublishIdea(ideaId, eventData, currentUser?.name || 'Systems Unit');
      if (!result.success) {
        throw new Error(result.error || 'Failed to publish idea');
      }
      return result;
    } catch (error) {
      console.error('Error publishing idea:', error);
      throw error;
    }
  }, [currentUser]);

  // Get ideas for a specific unit (from local state, filtered)
  const getIdeasForUnit = useCallback((unitId, university = null) => {
    return ideas.filter(idea => {
      if (idea.currentUnit !== unitId) return false;
      if (university && idea.university !== university) return false;
      return true;
    });
  }, [ideas]);

  // Get ideas by status (from local state, filtered)
  const getIdeasByStatus = useCallback((status, university = null) => {
    return ideas.filter(idea => {
      if (idea.currentStatus !== status) return false;
      if (university && idea.university !== university) return false;
      return true;
    });
  }, [ideas]);

  // Get pending count for unit (from local state)
  const getPendingCountForUnit = useCallback((unitId, university = null) => {
    return ideas.filter(idea => {
      if (idea.currentUnit !== unitId) return false;
      if (university && idea.university !== university) return false;
      if (idea.currentStatus === PIPELINE_STAGES.REJECTED) return false;
      return true;
    }).length;
  }, [ideas]);

  // Get all active ideas for a university (not rejected/published)
  const getActiveIdeas = useCallback((university = null) => {
    return ideas.filter(idea => {
      if (idea.currentStatus === PIPELINE_STAGES.REJECTED) return false;
      if (idea.currentStatus === PIPELINE_STAGES.PUBLISHED) return false;
      if (idea.currentStatus === PIPELINE_STAGES.COMPLETED) return false;
      if (university && idea.university !== university) return false;
      return true;
    });
  }, [ideas]);

  // Get published events for a university
  const getPublishedEvents = useCallback((university = null) => {
    return ideas.filter(idea => {
      if (idea.currentStatus !== PIPELINE_STAGES.PUBLISHED) return false;
      if (university && idea.university !== university) return false;
      return true;
    });
  }, [ideas]);

  // Get rejected ideas for a university
  const getRejectedIdeas = useCallback((university = null) => {
    return ideas.filter(idea => {
      if (idea.currentStatus !== PIPELINE_STAGES.REJECTED) return false;
      if (university && idea.university !== university) return false;
      return true;
    });
  }, [ideas]);

  // Get ideas for Main Lobby view (filtered by university, with status filters)
  const getIdeasForLobby = useCallback((university, filter = 'all') => {
    return ideas.filter(idea => {
      // Filter by university
      if (idea.university !== university) return false;

      switch (filter) {
        case 'pending':
          return idea.currentStatus !== PIPELINE_STAGES.PUBLISHED &&
                 idea.currentStatus !== PIPELINE_STAGES.REJECTED;
        case 'completed':
          return idea.currentStatus === PIPELINE_STAGES.PUBLISHED;
        case 'rejected':
          return idea.currentStatus === PIPELINE_STAGES.REJECTED;
        case 'all':
        default:
          // All ideas for this university (excluding published)
          return idea.currentStatus !== PIPELINE_STAGES.PUBLISHED;
      }
    });
  }, [ideas]);

  // Get idea by ID (from local state)
  const getIdeaById = useCallback((ideaId) => {
    return ideas.find(idea => idea.id === ideaId);
  }, [ideas]);

  // Get relevant announcements for user
  const getAnnouncementsForUser = useCallback(() => {
    const now = new Date();
    return announcements.filter(ann => {
      if (ann.expiresAt && new Date(ann.expiresAt) < now) return false;
      if (ann.targetUnits.includes('all')) return true;
      if (currentUser && currentUser.units && ann.targetUnits.some(t => currentUser.units.includes(t))) return true;
      return false;
    });
  }, [announcements, currentUser]);

  // Context value
  const value = {
    // User
    currentUser,
    logoutUser,
    restoreSession,
    setUserDirectly,

    // Ideas
    ideas,
    ideasLoading,
    submitIdea,
    approveIdea,
    returnIdea,
    rejectIdea,
    publishIdea,
    updateDriveLink,
    getIdeasForUnit,
    getIdeasByStatus,
    getPendingCountForUnit,
    getActiveIdeas,
    getPublishedEvents,
    getRejectedIdeas,
    getIdeasForLobby,
    getIdeaById,

    // Announcements
    announcements,
    getAnnouncementsForUser,

    // Constants (re-exported from mockData for compatibility)
    PIPELINE_STAGES,
    UNITS,
    UNIT_PERMISSIONS,
    STATUS_CONFIG,
    getNextStage,
    getPreviousStage,
    getUnitForStage,
    getUnitIdForStage
  };

  return (
    <PipelineContext.Provider value={value}>
      {children}
    </PipelineContext.Provider>
  );
};

export default PipelineContext;
