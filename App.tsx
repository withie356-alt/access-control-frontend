import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/Home';
import ApplyPage from './pages/user/Apply';
import CheckStatusPage from './pages/user/CheckStatus';
import SafetyInfoPage from './pages/user/SafetyInfo';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/Dashboard';
import GuardroomLayout from './pages/guardroom/GuardroomLayout';
import GuardroomDashboardContent from './pages/guardroom/GuardroomDashboardContent';
import QRScanner from './pages/guardroom/QRScanner';
import ApprovalsPage from './pages/admin/Approvals';
import ProjectsPage from './pages/admin/Projects';
import CompaniesPage from './pages/admin/Companies';
import DepartmentsPage from './pages/admin/Departments';
import UserLayout from './pages/user/UserLayout';

// New imports for authentication
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<LoginPage />} /> {/* Updated login route */}
          
          <Route element={<UserLayout />}>
            <Route path="/apply" element={<ApplyPage />} />
            <Route path="/check" element={<CheckStatusPage />} />
            <Route path="/safety" element={<SafetyInfoPage />} />
          </Route>

          {/* Protected Routes for Guardroom */}
          <Route element={<ProtectedRoute allowedRoles={['guardroom']} />}>
            <Route path="/guardroom" element={<GuardroomLayout />}>
              <Route path="dashboard" element={<GuardroomDashboardContent />} />
              <Route path="qr-scanner" element={<QRScanner />} />
              <Route index element={<GuardroomDashboardContent />} />
            </Route>
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route index element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
