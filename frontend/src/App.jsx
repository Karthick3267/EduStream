import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AvailableScholarshipsPage from './pages/student/AvailableScholarshipsPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import AIAssistantWidget from './components/common/AIAssistantWidget';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import MyApplicationsPage from './pages/student/MyApplicationsPage';
import ApplyScholarshipPage from './pages/student/ApplyScholarshipPage';
import ApplicationDetailsPage from './pages/student/ApplicationDetailsPage';

// Institution Staff Pages
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import VerifyApplicationPage from './pages/institution/VerifyApplicationPage';

// Administrator Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import ScholarshipManagementPage from './pages/admin/ScholarshipManagementPage';

// Finance / Disbursement Pages
import FinanceDashboard from './pages/finance/FinanceDashboard';
import DisbursementManagementPage from './pages/finance/DisbursementManagementPage';

// Shared Pages
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/scholarships" element={<AvailableScholarshipsPage />} />
            <Route path="/knowledge" element={<KnowledgeBasePage />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route path="/student/applications" element={<MyApplicationsPage />} />
              <Route path="/student/apply/:id" element={<ApplyScholarshipPage />} />
            </Route>

            {/* Institution Staff Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['institution_staff']} />}>
              <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
              <Route path="/institution/verify/:id" element={<VerifyApplicationPage />} />
            </Route>

            {/* Administrator Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/scholarships" element={<ScholarshipManagementPage />} />
            </Route>

            {/* Finance Officer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['finance_officer']} />}>
              <Route path="/finance/dashboard" element={<FinanceDashboard />} />
              <Route path="/finance/disbursements" element={<DisbursementManagementPage />} />
            </Route>

            {/* Shared Protected Routes (Student, Staff, Admin, Finance) */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['student', 'institution_staff', 'admin', 'finance_officer']}
                />
              }
            >
              <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AIAssistantWidget />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
