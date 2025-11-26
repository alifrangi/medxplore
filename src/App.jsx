import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkerAuthProvider } from './contexts/WorkerAuthContext'
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
const News = lazy(() => import('./pages/News'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const PassportLogin = lazy(() => import('./pages/PassportLogin'))
const PassportApply = lazy(() => import('./pages/PassportApply'))
const PassportDashboard = lazy(() => import('./pages/PassportDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminApplications = lazy(() => import('./pages/AdminApplications'))
const AdminStudents = lazy(() => import('./pages/AdminStudents'))
const AdminEvents = lazy(() => import('./pages/AdminEvents'))
const AdminNews = lazy(() => import('./pages/AdminNews'))
const ResearchDashboard = lazy(() => import('./pages/ResearchDashboard'))
const AcademicDashboard = lazy(() => import('./pages/AcademicDashboard'))
const GlobalOutreachDashboard = lazy(() => import('./pages/GlobalOutreachDashboard'))
const MediaCommunicationsDashboard = lazy(() => import('./pages/MediaCommunicationsDashboard'))
const StudentEngagementDashboard = lazy(() => import('./pages/StudentEngagementDashboard'))
const OperationsLogisticsDashboard = lazy(() => import('./pages/OperationsLogisticsDashboard'))
const WorkerLogin = lazy(() => import('./pages/WorkerLogin'))

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
  const isDepartmentPage = location.pathname.startsWith('/departments/');
  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');
  const isAdminNews = location.pathname.startsWith('/admin/news');
  const isAdminEvents = location.pathname.startsWith('/admin/events');
  const isAdminStudents = location.pathname.startsWith('/admin/students');
  const isAdminApplications = location.pathname.startsWith('/admin/applications');
  
  return (
    <>
      {!isDepartmentPage && !isAdminDashboard && !isAdminNews && !isAdminEvents && !isAdminStudents && !isAdminApplications && (
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
          <Route path="/news" element={<News />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
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
          <Route path="/worker-login" element={<WorkerLogin />} />
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
          <Route 
            path="/departments/research" 
            element={<ResearchDashboard />} 
          />
          <Route 
            path="/departments/academic" 
            element={<AcademicDashboard />} 
          />
          <Route 
            path="/departments/global-outreach" 
            element={<GlobalOutreachDashboard />} 
          />
          <Route 
            path="/departments/student-engagement" 
            element={<StudentEngagementDashboard />} 
          />
          <Route
            path="/departments/media-communications"
            element={<MediaCommunicationsDashboard />}
          />
          <Route
            path="/departments/operations-logistics"
            element={<OperationsLogisticsDashboard />}
          />
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
        <AuthProvider>
          <WorkerAuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </WorkerAuthProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App