
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/Home';
import ApplyPage from './pages/user/Apply';
import CheckStatusPage from './pages/user/CheckStatus';
import SafetyInfoPage from './pages/user/SafetyInfo';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/Dashboard';
import GuardroomDashboardPage from './pages/guardroom/Dashboard';
import ApprovalsPage from './pages/admin/Approvals';
import ProjectsPage from './pages/admin/Projects';
import CompaniesPage from './pages/admin/Companies';
import DepartmentsPage from './pages/admin/Departments';
import UsersPage from './pages/admin/Users';
import UserLayout from './pages/user/UserLayout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route element={<UserLayout />}>
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/check" element={<CheckStatusPage />} />
          <Route path="/safety" element={<SafetyInfoPage />} />
        </Route>

        <Route path="/guardroom/dashboard" element={<GuardroomDashboardPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
