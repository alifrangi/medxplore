// Pipeline Status Definitions
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

// Status display names and colors
export const STATUS_CONFIG = {
  [PIPELINE_STAGES.SUBMITTED]: { label: 'Submitted', color: '#FFA726', bgColor: '#FFF3E0' },
  [PIPELINE_STAGES.ACADEMIC_REVIEW]: { label: 'Academic Review', color: '#4CAF50', bgColor: '#E8F5E9' },
  [PIPELINE_STAGES.PROGRAMS_PACKAGE]: { label: 'Programs Package', color: '#2196F3', bgColor: '#E3F2FD' },
  [PIPELINE_STAGES.OPERATIONS]: { label: 'Operations Review', color: '#607D8B', bgColor: '#ECEFF1' },
  [PIPELINE_STAGES.EXTERNAL_APPROVALS]: { label: 'External Approvals', color: '#9C27B0', bgColor: '#F3E5F5' },
  [PIPELINE_STAGES.SYSTEMS]: { label: 'Systems Processing', color: '#FF5722', bgColor: '#FBE9E7' },
  [PIPELINE_STAGES.PUBLISHED]: { label: 'Event Published', color: '#00C853', bgColor: '#E8F5E9' },
  [PIPELINE_STAGES.PASSPORT_VERIFICATION]: { label: 'Passport Verification', color: '#009688', bgColor: '#E0F2F1' },
  [PIPELINE_STAGES.COMPLETED]: { label: 'Completed', color: '#1a1a1a', bgColor: '#F5F5F5' },
  [PIPELINE_STAGES.RETURNED]: { label: 'Returned', color: '#FF9800', bgColor: '#FFF8E1' },
  [PIPELINE_STAGES.REJECTED]: { label: 'Rejected', color: '#F44336', bgColor: '#FFEBEE' }
};

// Unit definitions with colors and associated pipeline stage
export const UNITS = {
  academic: {
    id: 'academic',
    name: 'Academic Unit',
    color: '#4CAF50',
    icon: 'BookOpen',
    stage: PIPELINE_STAGES.ACADEMIC_REVIEW,
    description: 'Reviews academic value and learning outcomes'
  },
  programs: {
    id: 'programs',
    name: 'Programs Unit',
    color: '#2196F3',
    icon: 'ClipboardList',
    stage: PIPELINE_STAGES.PROGRAMS_PACKAGE,
    description: 'Prepares program structure and event design'
  },
  operations: {
    id: 'operations',
    name: 'Operations Unit',
    color: '#607D8B',
    icon: 'Settings',
    stage: PIPELINE_STAGES.OPERATIONS,
    description: 'Handles feasibility and logistics'
  },
  external: {
    id: 'external',
    name: 'External Approvals',
    color: '#9C27B0',
    icon: 'Building2',
    stage: PIPELINE_STAGES.EXTERNAL_APPROVALS,
    description: 'Secures official permissions and approvals'
  },
  systems: {
    id: 'systems',
    name: 'Systems Unit',
    color: '#FF5722',
    icon: 'Monitor',
    stage: PIPELINE_STAGES.SYSTEMS,
    description: 'Creates and publishes events on platform'
  },
  passport: {
    id: 'passport',
    name: 'Passport Unit',
    color: '#009688',
    icon: 'Ticket',
    stage: PIPELINE_STAGES.PASSPORT_VERIFICATION,
    description: 'Manages attendance and passport credits'
  }
};

// Pipeline flow order
export const PIPELINE_ORDER = [
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

// Get previous stage in pipeline (for returns)
export const getPreviousStage = (currentStage) => {
  const currentIndex = PIPELINE_ORDER.indexOf(currentStage);
  // Cannot return from Academic (nothing before it) or Submitted
  if (currentIndex <= 1) return null;

  return PIPELINE_ORDER[currentIndex - 1];
};

// Get the unit ID for a given pipeline stage
export const getUnitIdForStage = (stage) => {
  const stageToUnit = {
    [PIPELINE_STAGES.ACADEMIC_REVIEW]: 'academic',
    [PIPELINE_STAGES.PROGRAMS_PACKAGE]: 'programs',
    [PIPELINE_STAGES.OPERATIONS]: 'operations',
    [PIPELINE_STAGES.EXTERNAL_APPROVALS]: 'external',
    [PIPELINE_STAGES.SYSTEMS]: 'systems',
    [PIPELINE_STAGES.PASSPORT_VERIFICATION]: 'passport'
  };
  return stageToUnit[stage] || null;
};

// Get unit responsible for a stage
export const getUnitForStage = (stage) => {
  return Object.values(UNITS).find(unit => unit.stage === stage);
};

// Universities - Only JUST and YU (Other maps to JUST)
export const UNIVERSITIES = [
  { id: 'JUST', name: 'Jordan University of Science & Technology' },
  { id: 'YU', name: 'Yarmouk University' }
];

// Idea types
export const IDEA_TYPES = [
  { id: 'workshop', label: 'Workshop', description: 'Hands-on practical session' },
  { id: 'skills', label: 'Skills Training', description: 'Focused skill development' },
  { id: 'talk', label: 'Talk/Lecture', description: 'Educational presentation' },
  { id: 'campaign', label: 'Campaign', description: 'Awareness or outreach campaign' },
  { id: 'collaboration', label: 'Collaboration', description: 'Partnership event' },
  { id: 'other', label: 'Other', description: 'Other type of event' }
];

// Target audience options
export const TARGET_AUDIENCES = [
  'Year 1 Students',
  'Year 2 Students',
  'Year 3 Students',
  'Year 4 Students',
  'Year 5 Students',
  'Year 6 Students',
  'All Medical Students',
  'Specific Major/Specialty',
  'Open to All'
];

// Mock Announcements (keeping for now until Firebase announcements are implemented)
export const initialMockAnnouncements = [
  {
    id: 'ANN-001',
    title: 'Q1 2026 Event Planning Deadline',
    content: 'All Q1 event proposals must be submitted by January 15th to ensure proper review and scheduling. Late submissions may be pushed to Q2.',
    priority: 'high',
    tags: ['Deadline', 'Important'],
    createdAt: new Date('2025-12-25T09:00:00'),
    expiresAt: new Date('2026-01-15T23:59:59'),
    createdBy: 'Admin Team',
    targetUnits: ['all']
  },
  {
    id: 'ANN-002',
    title: 'New External Approval Requirements',
    content: 'Events expecting over 100 attendees now require dean signature. Please plan for additional 3-5 days in the external approvals stage.',
    priority: 'medium',
    tags: ['Policy Update'],
    createdAt: new Date('2025-12-23T14:00:00'),
    expiresAt: new Date('2026-02-01T23:59:59'),
    createdBy: 'Operations',
    targetUnits: ['operations', 'external']
  },
  {
    id: 'ANN-003',
    title: 'System Maintenance - December 28th',
    content: 'The dashboard will be unavailable from 2:00 AM to 4:00 AM for scheduled maintenance.',
    priority: 'low',
    tags: ['Maintenance'],
    createdAt: new Date('2025-12-24T10:00:00'),
    expiresAt: new Date('2025-12-28T04:00:00'),
    createdBy: 'Systems Team',
    targetUnits: ['all']
  }
];


// Unit action permissions
export const UNIT_PERMISSIONS = {
  academic: {
    canApprove: true,
    canReject: true,
    canReturn: false,
    requiresDriveLink: true
  },
  programs: {
    canApprove: true,
    canReject: false,
    canReturn: true,
    viewDriveLink: true
  },
  operations: {
    canApprove: true,
    canReject: true,
    canReturn: true
  },
  external: {
    canApprove: true,
    canReject: true,
    canReturn: true
  },
  systems: {
    canPublish: true,
    canManageEvents: true,
    canManageWorkers: true
  },
  passport: {
    canManageApplications: true,
    canManageStudents: true
  }
};

// Calculate time in current status
export const getTimeInStatus = (statusHistory) => {
  if (!statusHistory || statusHistory.length === 0) return 'Unknown';

  const lastEntry = statusHistory[statusHistory.length - 1];
  const now = new Date();
  const statusDate = new Date(lastEntry.timestamp);
  const diffMs = now - statusDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m`;
  }
};
