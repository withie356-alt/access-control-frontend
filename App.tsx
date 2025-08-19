import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { getToken } from "firebase/messaging";
import { messaging } from "./services/firebase";
import { supabase } from "./services/supabase";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Page Imports
import HomePage from './pages/Home';
import LoginPage from './pages/auth/Login';

// User Pages
import UserLayout from './pages/user/UserLayout';
import ApplyPage from './pages/user/Apply';
import CheckStatusPage from './pages/user/CheckStatus';
import SafetyInfoPage from './pages/user/SafetyInfo';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/Dashboard';
import ApprovalsPage from './pages/admin/Approvals';
import ProjectsPage from './pages/admin/Projects';
import CompaniesPage from './pages/admin/Companies';
import DepartmentsPage from './pages/admin/Departments';

// Guardroom Pages
import GuardroomLayout from './pages/guardroom/GuardroomLayout';
import GuardroomDashboardContent from './pages/guardroom/GuardroomDashboardContent';
import QRScanner from './pages/guardroom/QRScanner';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// This component contains the main logic and routes
const AppContent: React.FC = () => {
  const { user } = useAuth(); // useAuth must be called inside a child of AuthProvider

  // useEffect(() => {
  //   const createTables = async () => {
  //     const {
  //       data,
  //       error
  //     } = await supabase.rpc('exec', {
  //       sql: `
  //         CREATE TABLE IF NOT EXISTS public.push_subscriptions ( 
  //           id uuid NOT NULL,
  //           subscription jsonb NOT NULL,
  //           created_at timestamp with time zone NOT NULL DEFAULT now(),
  //           updated_at timestamp with time zone NOT NULL DEFAULT now(),
  //           CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  //           CONSTRAINT push_subscriptions_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
  //         );

  //         CREATE TABLE IF NOT EXISTS public.fcm_tokens ( 
  //           user_id uuid NOT NULL,
  //           fcm_token text NOT NULL,
  //           created_at timestamp with time zone NOT NULL DEFAULT now(),
  //           updated_at timestamp with time zone NOT NULL DEFAULT now(),
  //           CONSTRAINT fcm_tokens_pkey PRIMARY KEY (user_id),
  //           CONSTRAINT fcm_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id)
  //         );
  //       `
  //     });

  //     if (error) {
  //       console.error('Error creating tables:', error);
  //     } else {
  //       console.log('Successfully created or ensured tables exist.');
  //     }
  //   };

  //   createTables();
  // }, []);

  useEffect(() => {
    // This function requests notification permission and gets the FCM token
    async function requestPermissionAndGetToken() {
      // Only run if a user is logged in
      if (!user) {
        console.log("User not logged in, skipping FCM token request.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");

          // Get FCM token
          const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY }); 
          
          if (currentToken) {
            console.log("FCM Token:", currentToken);
            
            // Save or update the FCM token in the Supabase database
            const { error } = await supabase
              .from('fcm_tokens')
              .upsert({
                user_id: user.id,
                fcm_token: currentToken,
              }, { onConflict: 'user_id' });

            if (error) {
              console.error("Error saving FCM token to Supabase:", error);
            } else {
              console.log("FCM token saved to Supabase successfully.");
            }

          } else {
            console.log("No registration token available. Request permission to generate one.");
          }
        } else {
          console.log("Unable to get permission to notify.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
      }
    }

    requestPermissionAndGetToken();
  }, [user]); // Rerun the effect if the user changes

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      
      {/* User Routes */}
      <Route element={<UserLayout />}>
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/check" element={<CheckStatusPage />} />
        <Route path="/safety" element={<SafetyInfoPage />} />
      </Route>

      {/* Protected Guardroom Routes */}
      <Route element={<ProtectedRoute allowedRoles={['guardroom']} />}>
        <Route path="/guardroom" element={<GuardroomLayout />}>
          <Route path="dashboard" element={<GuardroomDashboardContent />} />
          <Route path="qr-scanner" element={<QRScanner />} />
          <Route index element={<GuardroomDashboardContent />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
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
  );
};

// The main App component wraps the application with context providers
const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;