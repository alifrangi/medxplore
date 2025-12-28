import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { usePipeline } from '../../contexts/PipelineContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/shared/Toast';
import WorkerSidebar from '../../components/worker/WorkerSidebar';
import AcademicContent from '../../components/worker/units/AcademicContent';
import ProgramsContent from '../../components/worker/units/ProgramsContent';
import OperationsContent from '../../components/worker/units/OperationsContent';
import ExternalContent from '../../components/worker/units/ExternalContent';
import SystemsContent from '../../components/worker/units/SystemsContent';
import PassportContent from '../../components/worker/units/PassportContent';
import './WorkerDashboard.css';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { unitId } = useParams();
  const toast = useToast();

  // Get auth context to check if admin
  const { isAdmin, adminData, loading: authLoading } = useAuth();

  const {
    currentUser,
    restoreSession,
    logoutUser,
    ideas,
    ideasLoading,
    UNITS,
    getPendingCountForUnit,
    approveIdea,
    returnIdea,
    rejectIdea,
    publishIdea,
    updateDriveLink
  } = usePipeline();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeUnit, setActiveUnit] = useState(null);

  // Get all unit IDs for admin access
  const allUnitIds = Object.keys(UNITS);

  // Determine which units the user has access to
  const userUnits = isAdmin ? allUnitIds : (currentUser?.units || []);

  // Restore session on mount
  useEffect(() => {
    if (!currentUser && !isAdmin) {
      const restored = restoreSession();
      if (!restored) {
        navigate('/admin');
      }
    }
  }, [currentUser, isAdmin, restoreSession, navigate]);

  // Set active unit based on URL or redirect to first available unit
  useEffect(() => {
    // For admins, we use all units; for workers, use their assigned units
    if (userUnits.length === 0) return;

    if (unitId && userUnits.includes(unitId)) {
      setActiveUnit(unitId);
    } else if (!unitId || !userUnits.includes(unitId)) {
      // Redirect to first available unit
      const firstUnit = userUnits[0];
      navigate(`/worker/${firstUnit}`, { replace: true });
    }
  }, [unitId, userUnits, navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate('/admin');
  };

  const handleUnitChange = (newUnitId) => {
    navigate(`/worker/${newUnitId}`);
    setSidebarOpen(false); // Close mobile sidebar
  };

  // Calculate pending counts for each unit the user has access to
  const getPendingCounts = () => {
    if (userUnits.length === 0) return {};
    const counts = {};
    // For admin, don't filter by university; for workers, use their university
    const university = isAdmin ? null : currentUser?.university;
    userUnits.forEach(unit => {
      counts[unit] = getPendingCountForUnit(unit, university);
    });
    return counts;
  };

  // Calculate quick stats
  const getQuickStats = () => {
    if (userUnits.length === 0) return { pendingTasks: 0, completedToday: 0 };

    const pendingCounts = getPendingCounts();
    const totalPending = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);

    // Count completed today (ideas that were processed today by any of user's units)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = ideas.filter(idea => {
      if (!idea.statusHistory || !Array.isArray(idea.statusHistory)) return false;

      return idea.statusHistory.some(entry => {
        const entryDate = entry.timestamp instanceof Date
          ? entry.timestamp
          : new Date(entry.timestamp);
        return entryDate >= today &&
               userUnits.includes(entry.fromUnit) &&
               (entry.action === 'approved' || entry.action === 'rejected');
      });
    }).length;

    return { pendingTasks: totalPending, completedToday };
  };

  // Create an effective user object that works for both admin and workers
  const effectiveUser = isAdmin
    ? {
        name: adminData?.name || 'Admin',
        university: 'All Universities',
        units: userUnits
      }
    : currentUser;

  // Get filtered ideas for the active unit
  const getIdeasForActiveUnit = () => {
    if (!activeUnit) return [];
    // For admin, show all ideas in the unit; for workers, filter by university
    if (isAdmin) {
      return ideas.filter(idea => idea.currentUnit === activeUnit);
    }
    if (!currentUser?.university) return [];
    return ideas.filter(idea =>
      idea.currentUnit === activeUnit &&
      idea.university === currentUser.university
    );
  };

  // Get all ideas for the lobby view (filtered by university only for workers)
  const getAllIdeasForLobby = () => {
    // For admin, show all ideas
    if (isAdmin) {
      return ideas;
    }
    if (!currentUser?.university) return [];
    return ideas.filter(idea => idea.university === currentUser.university);
  };

  // Render the appropriate content component based on active unit
  const renderUnitContent = () => {
    if (!activeUnit) {
      return (
        <div className="worker-dashboard__loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    const unitIdeas = getIdeasForActiveUnit();
    const unit = UNITS[activeUnit];

    const commonProps = {
      ideas: unitIdeas,
      allIdeas: getAllIdeasForLobby(),
      allUnits: UNITS,
      unit,
      university: isAdmin ? null : currentUser?.university,
      currentUser: effectiveUser,
      onApprove: approveIdea,
      onReturn: returnIdea,
      onReject: rejectIdea,
      onUpdateDriveLink: updateDriveLink,
      loading: ideasLoading
    };

    switch (activeUnit) {
      case 'academic':
        return <AcademicContent {...commonProps} />;
      case 'programs':
        return <ProgramsContent {...commonProps} />;
      case 'operations':
        return <OperationsContent {...commonProps} />;
      case 'external':
        return <ExternalContent {...commonProps} />;
      case 'systems':
        return <SystemsContent {...commonProps} onPublish={publishIdea} />;
      case 'passport':
        return <PassportContent {...commonProps} />;
      default:
        return (
          <div className="worker-dashboard__empty">
            <h2>Unit not found</h2>
            <p>The requested unit does not exist.</p>
          </div>
        );
    }
  };

  // Show loading state while checking auth
  if (authLoading || (!currentUser && !isAdmin)) {
    return (
      <div className="worker-dashboard worker-dashboard--loading">
        <div className="worker-dashboard__loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-dashboard">
      {/* Mobile Header */}
      <header className="worker-dashboard__mobile-header">
        <button
          className="worker-dashboard__menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="worker-dashboard__mobile-title">
          {activeUnit && UNITS[activeUnit]?.name}
        </span>
        <span className="worker-dashboard__mobile-badge">{effectiveUser?.university}</span>
      </header>

      {/* Sidebar */}
      <WorkerSidebar
        currentUser={effectiveUser}
        activeUnit={activeUnit}
        onUnitChange={handleUnitChange}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCounts={getPendingCounts()}
        quickStats={getQuickStats()}
        units={UNITS}
        isAdmin={isAdmin}
      />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="worker-dashboard__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="worker-dashboard__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUnit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="worker-dashboard__content-inner"
          >
            {renderUnitContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default WorkerDashboard;
