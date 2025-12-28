import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkerAuthProvider } from './contexts/WorkerAuthContext'
import { PipelineProvider } from './contexts/PipelineContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/shared/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Banner from './components/Banner/Banner'
import CharacterWidget from './components/CharecterWidget/CharacterWidget'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Contact = lazy(() => import('./pages/Contact'))
const Events = lazy(() => import('./pages/Events'))
const PassportLogin = lazy(() => import('./pages/PassportLogin'))
const PassportApply = lazy(() => import('./pages/PassportApply'))
const PassportDashboard = lazy(() => import('./pages/PassportDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminApplications = lazy(() => import('./pages/AdminApplications'))
const AdminStudents = lazy(() => import('./pages/AdminStudents'))
const AdminEvents = lazy(() => import('./pages/AdminEvents'))
const AdminNews = lazy(() => import('./pages/AdminNews'))

// Pipeline pages (new admin dashboard)
const PortalPage = lazy(() => import('./pages/portal/PortalPage'))
const IdeasBoard = lazy(() => import('./pages/ideas/IdeasBoard'))
const MainLobby = lazy(() => import('./pages/lobby/MainLobby'))
const UnitWorkspace = lazy(() => import('./pages/unit/UnitWorkspace'))
const SystemsUnit = lazy(() => import('./pages/unit/SystemsUnit'))
const PassportUnit = lazy(() => import('./pages/unit/PassportUnit'))

// New Worker Dashboard (unified sidebar experience)
const WorkerDashboard = lazy(() => import('./pages/worker/WorkerDashboard'))

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: '#6b7280'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#94bed5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading...
    </div>
  </div>
)

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin/');
  const isPipelinePage = location.pathname.startsWith('/portal') ||
                         location.pathname.startsWith('/ideas') ||
                         location.pathname.startsWith('/lobby') ||
                         location.pathname.startsWith('/unit/') ||
                         location.pathname.startsWith('/worker');
  const isPassportDashboard = location.pathname === '/passport/dashboard';

  return (
    <>
      {!isAdminPage && !isPipelinePage && !isPassportDashboard && (
        <>
          <Banner />
          <Navbar />
        </>
      )}
      <Suspense fallback={<PageLoader />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/passport" element={<PassportLogin />} />
          <Route path="/passport/apply" element={<PassportApply />} />
          <Route 
            path="/passport/dashboard" 
            element={
              <ProtectedRoute requireStudent>
                <PassportDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/applications" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminStudents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminEvents />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNews />
              </ProtectedRoute>
            }
          />

          {/* Pipeline Routes (Unit Workspaces) */}
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/ideas" element={<IdeasBoard />} />
          <Route path="/lobby" element={<MainLobby />} />
          <Route path="/unit/systems" element={<SystemsUnit />} />
          <Route path="/unit/passport" element={<PassportUnit />} />
          <Route path="/unit/:unitId" element={<UnitWorkspace />} />

          {/* New Worker Dashboard Routes */}
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/worker/:unitId" element={<WorkerDashboard />} />
          </Routes>
      </Suspense>
      <CharacterWidget />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <WorkerAuthProvider>
              <PipelineProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </PipelineProvider>
            </WorkerAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App