import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkerAuthProvider } from './contexts/WorkerAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Banner from './components/Banner/Banner'
import CharacterWidget from './components/CharecterWidget/CharacterWidget'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Events from './pages/Events'
import News from './pages/News'
import PassportLogin from './pages/PassportLogin'
import PassportApply from './pages/PassportApply'
import PassportDashboard from './pages/PassportDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplications from './pages/AdminApplications'
import AdminStudents from './pages/AdminStudents'
import AdminEvents from './pages/AdminEvents'
import AdminNews from './pages/AdminNews'
import ResearchDashboard from './pages/ResearchDashboard'
import AcademicDashboard from './pages/AcademicDashboard'
import GlobalOutreachDashboard from './pages/GlobalOutreachDashboard'
import MediaCommunicationsDashboard from './pages/MediaCommunicationsDashboard'
import StudentEngagementDashboard from './pages/StudentEngagementDashboard'
import OperationsLogisticsDashboard from './pages/OperationsLogisticsDashboard'
import WorkerLogin from './pages/WorkerLogin'
import Leaderboard from './pages/Leaderboard'

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
            <AppContent />
          </WorkerAuthProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App