import { describe, test, expect, beforeEach } from 'vitest';
import {
  PIPELINE_STAGES,
  PIPELINE_ORDER,
  UNITS,
  STATUS_CONFIG,
  UNIT_PERMISSIONS,
  UNIVERSITIES,
  getNextStage,
  getPreviousStage,
  getUnitIdForStage,
  getUnitForStage,
  generateIdeaId,
  getTimeInStatus,
  initialMockIdeas,
  mockWorkers
} from '../data/mockData';

// ============================================
// PIPELINE STAGES & STATUS TESTS
// ============================================
describe('Pipeline Stages', () => {
  test('PIPELINE_STAGES contains all required stages', () => {
    const requiredStages = [
      'SUBMITTED',
      'ACADEMIC_REVIEW',
      'PROGRAMS_PACKAGE',
      'OPERATIONS',
      'EXTERNAL_APPROVALS',
      'SYSTEMS',
      'PUBLISHED',
      'PASSPORT_VERIFICATION',
      'COMPLETED',
      'REJECTED',
      'RETURNED'
    ];

    requiredStages.forEach(stage => {
      expect(PIPELINE_STAGES).toHaveProperty(stage);
    });
  });

  test('STATUS_CONFIG has styling for all statuses', () => {
    const statuses = Object.values(PIPELINE_STAGES);

    statuses.forEach(status => {
      expect(STATUS_CONFIG).toHaveProperty(status);
      expect(STATUS_CONFIG[status]).toHaveProperty('label');
      expect(STATUS_CONFIG[status]).toHaveProperty('color');
    });
  });

  test('PIPELINE_ORDER is in correct sequence', () => {
    expect(PIPELINE_ORDER[0]).toBe('submitted');
    expect(PIPELINE_ORDER[1]).toBe('academic-review');
    expect(PIPELINE_ORDER[2]).toBe('programs-package');
    expect(PIPELINE_ORDER[3]).toBe('operations');
    expect(PIPELINE_ORDER[4]).toBe('external-approvals');
    expect(PIPELINE_ORDER[5]).toBe('systems');
    expect(PIPELINE_ORDER[6]).toBe('published');
  });
});

// ============================================
// STATUS TRANSITION TESTS
// ============================================
describe('Status Transitions - getNextStage', () => {
  test('submitted -> academic-review', () => {
    expect(getNextStage('submitted')).toBe('academic-review');
  });

  test('academic-review -> programs-package', () => {
    expect(getNextStage('academic-review')).toBe('programs-package');
  });

  test('programs-package -> operations', () => {
    expect(getNextStage('programs-package')).toBe('operations');
  });

  test('operations -> external-approvals when required', () => {
    expect(getNextStage('operations', true)).toBe('external-approvals');
  });

  test('operations -> systems when external NOT required', () => {
    expect(getNextStage('operations', false)).toBe('systems');
  });

  test('external-approvals -> systems', () => {
    expect(getNextStage('external-approvals')).toBe('systems');
  });

  test('systems -> published', () => {
    expect(getNextStage('systems')).toBe('published');
  });

  test('published -> passport-verification', () => {
    expect(getNextStage('published')).toBe('passport-verification');
  });

  test('returns null for terminal states', () => {
    expect(getNextStage('completed')).toBeNull();
    expect(getNextStage('rejected')).toBeNull();
  });

  test('returns null for invalid stage', () => {
    expect(getNextStage('invalid-stage')).toBeNull();
    expect(getNextStage(null)).toBeNull();
    expect(getNextStage(undefined)).toBeNull();
  });
});

describe('Status Transitions - getPreviousStage', () => {
  test('academic-review -> null (cannot return from first working unit)', () => {
    // Academic unit cannot return ideas - this is by design
    // Matches UNIT_PERMISSIONS.academic.canReturn = false
    expect(getPreviousStage('academic-review')).toBeNull();
  });

  test('programs-package -> academic-review', () => {
    expect(getPreviousStage('programs-package')).toBe('academic-review');
  });

  test('operations -> programs-package', () => {
    expect(getPreviousStage('operations')).toBe('programs-package');
  });

  test('external-approvals -> operations', () => {
    expect(getPreviousStage('external-approvals')).toBe('operations');
  });

  test('systems -> external-approvals', () => {
    expect(getPreviousStage('systems')).toBe('external-approvals');
  });

  test('returns null for first stage', () => {
    expect(getPreviousStage('submitted')).toBeNull();
  });

  test('returns null for invalid stage', () => {
    expect(getPreviousStage('invalid')).toBeNull();
  });
});

// ============================================
// UNIT ASSIGNMENT TESTS
// ============================================
describe('Unit Assignment', () => {
  test('getUnitIdForStage returns correct units', () => {
    expect(getUnitIdForStage('academic-review')).toBe('academic');
    expect(getUnitIdForStage('programs-package')).toBe('programs');
    expect(getUnitIdForStage('operations')).toBe('operations');
    expect(getUnitIdForStage('external-approvals')).toBe('external');
    expect(getUnitIdForStage('systems')).toBe('systems');
    expect(getUnitIdForStage('passport-verification')).toBe('passport');
  });

  test('getUnitIdForStage returns null for non-unit stages', () => {
    expect(getUnitIdForStage('submitted')).toBeNull();
    expect(getUnitIdForStage('completed')).toBeNull();
    expect(getUnitIdForStage('rejected')).toBeNull();
  });

  test('getUnitForStage returns full unit object', () => {
    const academicUnit = getUnitForStage('academic-review');
    expect(academicUnit).toBeDefined();
    expect(academicUnit.id).toBe('academic');
    expect(academicUnit.name).toBe('Academic Unit');
  });

  test('all UNITS have required properties', () => {
    Object.values(UNITS).forEach(unit => {
      expect(unit).toHaveProperty('id');
      expect(unit).toHaveProperty('name');
      expect(unit).toHaveProperty('color');
      expect(unit).toHaveProperty('icon');
      expect(unit).toHaveProperty('stage');
    });
  });
});

// ============================================
// UNIT PERMISSIONS TESTS
// ============================================
describe('Unit Permissions', () => {
  test('Academic unit can approve and reject but NOT return', () => {
    const academicPerms = UNIT_PERMISSIONS.academic;
    expect(academicPerms.canApprove).toBe(true);
    expect(academicPerms.canReject).toBe(true);
    expect(academicPerms.canReturn).toBe(false);
    expect(academicPerms.requiresDriveLink).toBe(true);
  });

  test('Programs unit can approve and return but NOT reject', () => {
    const programsPerms = UNIT_PERMISSIONS.programs;
    expect(programsPerms.canApprove).toBe(true);
    expect(programsPerms.canReject).toBe(false);
    expect(programsPerms.canReturn).toBe(true);
  });

  test('Operations unit can approve, reject, and return', () => {
    const opsPerms = UNIT_PERMISSIONS.operations;
    expect(opsPerms.canApprove).toBe(true);
    expect(opsPerms.canReject).toBe(true);
    expect(opsPerms.canReturn).toBe(true);
  });

  test('External unit can approve, reject, and return', () => {
    const externalPerms = UNIT_PERMISSIONS.external;
    expect(externalPerms.canApprove).toBe(true);
    expect(externalPerms.canReject).toBe(true);
    expect(externalPerms.canReturn).toBe(true);
  });

  test('Systems unit has special permissions', () => {
    const systemsPerms = UNIT_PERMISSIONS.systems;
    expect(systemsPerms.canPublish).toBe(true);
    expect(systemsPerms.canManageEvents).toBe(true);
    expect(systemsPerms.canManageWorkers).toBe(true);
  });

  test('Passport unit has application management permissions', () => {
    const passportPerms = UNIT_PERMISSIONS.passport;
    expect(passportPerms.canManageApplications).toBe(true);
    expect(passportPerms.canManageStudents).toBe(true);
  });
});

// ============================================
// UNIVERSITY FILTERING TESTS
// ============================================
describe('University Filtering', () => {
  test('UNIVERSITIES contains all expected options', () => {
    // UNIVERSITIES is an array of objects with {id, name}
    const universityIds = UNIVERSITIES.map(u => u.id);
    expect(universityIds).toContain('JUST');
    expect(universityIds).toContain('YU');
    expect(universityIds).toContain('HU');
    expect(universityIds).toContain('Other');
    expect(UNIVERSITIES.length).toBe(4);
  });

  test('Mock ideas have valid universities', () => {
    const universityIds = UNIVERSITIES.map(u => u.id);
    initialMockIdeas.forEach(idea => {
      expect(universityIds).toContain(idea.university);
    });
  });

  test('Ideas can be filtered by university', () => {
    const justIdeas = initialMockIdeas.filter(i => i.university === 'JUST');
    const yuIdeas = initialMockIdeas.filter(i => i.university === 'YU');
    const huIdeas = initialMockIdeas.filter(i => i.university === 'HU');

    // Verify each filter returns only ideas from that university
    justIdeas.forEach(idea => expect(idea.university).toBe('JUST'));
    yuIdeas.forEach(idea => expect(idea.university).toBe('YU'));
    huIdeas.forEach(idea => expect(idea.university).toBe('HU'));
  });

  test('Workers are assigned to specific universities', () => {
    const universityIds = UNIVERSITIES.map(u => u.id);
    mockWorkers.forEach(worker => {
      expect(worker).toHaveProperty('university');
      expect(universityIds).toContain(worker.university);
    });
  });

  test('Worker units filtering works correctly', () => {
    // Get workers for a specific unit
    const academicWorkers = mockWorkers.filter(w =>
      w.units && w.units.includes('academic')
    );

    expect(academicWorkers.length).toBeGreaterThan(0);

    // Check they can only see their university's ideas
    academicWorkers.forEach(worker => {
      const workerUniversity = worker.university;
      const accessibleIdeas = initialMockIdeas.filter(i =>
        i.university === workerUniversity &&
        i.currentUnit === 'academic'
      );

      // All accessible ideas should match worker's university
      accessibleIdeas.forEach(idea => {
        expect(idea.university).toBe(workerUniversity);
      });
    });
  });
});

// ============================================
// EDGE CASES TESTS
// ============================================
describe('Edge Cases', () => {
  describe('getTimeInStatus', () => {
    test('returns "0m" for very recent timestamps', () => {
      const recentHistory = [{
        status: 'academic-review',
        timestamp: new Date()
      }];

      const result = getTimeInStatus(recentHistory);
      expect(result).toBe('0m');
    });

    test('handles empty statusHistory gracefully', () => {
      // getTimeInStatus returns 'Unknown' for invalid inputs
      expect(getTimeInStatus([])).toBe('Unknown');
      expect(getTimeInStatus(null)).toBe('Unknown');
      expect(getTimeInStatus(undefined)).toBe('Unknown');
    });

    test('handles hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const history = [{
        status: 'academic-review',
        timestamp: twoHoursAgo
      }];

      const result = getTimeInStatus(history);
      expect(result).toMatch(/2h|2 h/i);
    });

    test('handles days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const history = [{
        status: 'academic-review',
        timestamp: threeDaysAgo
      }];

      const result = getTimeInStatus(history);
      expect(result).toMatch(/3d|3 d/i);
    });
  });

  describe('generateIdeaId', () => {
    test('generates ID with correct university prefix', () => {
      const justId = generateIdeaId('JUST');
      const yuId = generateIdeaId('YU');
      const huId = generateIdeaId('HU');

      expect(justId).toMatch(/^IDEA-JUST-\d+$/);
      expect(yuId).toMatch(/^IDEA-YU-\d+$/);
      expect(huId).toMatch(/^IDEA-HU-\d+$/);
    });

    test('generates unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateIdeaId('JUST'));
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('Idea Data Integrity', () => {
    test('all ideas have required fields', () => {
      initialMockIdeas.forEach(idea => {
        expect(idea).toHaveProperty('id');
        expect(idea).toHaveProperty('title');
        expect(idea).toHaveProperty('university');
        expect(idea).toHaveProperty('currentStatus');
        expect(idea).toHaveProperty('currentUnit');
        expect(idea).toHaveProperty('statusHistory');
        expect(idea).toHaveProperty('submittedBy');
        expect(idea).toHaveProperty('submittedAt');
      });
    });

    test('statusHistory is always an array', () => {
      initialMockIdeas.forEach(idea => {
        expect(Array.isArray(idea.statusHistory)).toBe(true);
      });
    });

    test('rejected ideas have null currentUnit', () => {
      const rejectedIdeas = initialMockIdeas.filter(i =>
        i.currentStatus === 'rejected'
      );

      rejectedIdeas.forEach(idea => {
        expect(idea.currentUnit).toBeNull();
        expect(idea.rejectionReason).toBeDefined();
      });
    });

    test('returned ideas have returnReason', () => {
      const returnedIdeas = initialMockIdeas.filter(i =>
        i.currentStatus === 'returned'
      );

      returnedIdeas.forEach(idea => {
        expect(idea.returnReason).toBeDefined();
      });
    });
  });

  describe('Status Transition Validation', () => {
    test('cannot return from first stage', () => {
      const previousStage = getPreviousStage('submitted');
      expect(previousStage).toBeNull();
    });

    test('cannot advance from rejected status', () => {
      const nextStage = getNextStage('rejected');
      expect(nextStage).toBeNull();
    });

    test('cannot advance from completed status', () => {
      const nextStage = getNextStage('completed');
      expect(nextStage).toBeNull();
    });
  });
});

// ============================================
// WORKFLOW SIMULATION TESTS
// ============================================
describe('Workflow Simulations', () => {
  test('Full approval path without external approval', () => {
    const stages = [];
    let currentStage = 'submitted';

    // Simulate progression through pipeline
    while (currentStage !== null && currentStage !== 'completed') {
      stages.push(currentStage);
      const requiresExternal = false; // Skip external approvals
      currentStage = getNextStage(currentStage, requiresExternal);
    }

    // Should skip external-approvals
    expect(stages).not.toContain('external-approvals');
    expect(stages).toContain('systems');
    expect(stages).toContain('published');
  });

  test('Full approval path WITH external approval', () => {
    const stages = [];
    let currentStage = 'submitted';

    // Simulate progression through pipeline
    while (currentStage !== null && currentStage !== 'completed') {
      stages.push(currentStage);
      const requiresExternal = true;
      currentStage = getNextStage(currentStage, requiresExternal);
    }

    // Should include external-approvals
    expect(stages).toContain('external-approvals');
    expect(stages).toContain('systems');
    expect(stages).toContain('published');
  });

  test('Return and resubmit flow', () => {
    // Idea at programs-package, gets returned
    const currentStage = 'programs-package';
    const returnedTo = getPreviousStage(currentStage);

    expect(returnedTo).toBe('academic-review');

    // After revision, should go back to programs
    const nextAfterRevision = getNextStage(returnedTo);
    expect(nextAfterRevision).toBe('programs-package');
  });

  test('Multi-university isolation in queue', () => {
    // Simulate getting queue for academic unit at JUST
    const justAcademicQueue = initialMockIdeas.filter(idea =>
      idea.university === 'JUST' &&
      idea.currentUnit === 'academic'
    );

    // All ideas should be from JUST
    justAcademicQueue.forEach(idea => {
      expect(idea.university).toBe('JUST');
    });

    // YU ideas should NOT be in JUST queue
    const yuIdeas = initialMockIdeas.filter(i => i.university === 'YU');
    yuIdeas.forEach(yuIdea => {
      expect(justAcademicQueue).not.toContainEqual(yuIdea);
    });
  });
});

// ============================================
// DRIVE LINK TESTS
// ============================================
describe('Drive Link Requirements', () => {
  test('Academic unit requires drive link for approval', () => {
    expect(UNIT_PERMISSIONS.academic.requiresDriveLink).toBe(true);
  });

  test('Other units can view but not require drive link', () => {
    expect(UNIT_PERMISSIONS.programs.viewDriveLink).toBe(true);
    expect(UNIT_PERMISSIONS.programs.requiresDriveLink).toBeUndefined();
  });

  test('Ideas with driveLink field are properly structured', () => {
    const ideasWithDriveLink = initialMockIdeas.filter(i => i.driveLink);

    ideasWithDriveLink.forEach(idea => {
      expect(typeof idea.driveLink).toBe('string');
      expect(idea.driveLink).toMatch(/^https?:\/\//);
    });
  });
});
