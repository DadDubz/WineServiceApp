// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import ServicePage from "@/pages/ServicePage";

// ✅ CHANGE THESE IMPORTS TO MATCH YOUR FILE NAMES:
import GuestManagementPage from "@/pages/GuestManagementPage";
import ReportsPage from "@/pages/ReportsPage";

import ProtectedRoute from "@/components/ProtectedRoute";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/service"
        element={
          <ProtectedRoute>
            <ServicePage />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADD THESE ROUTES */}
      <Route
        path="/guests-ui"
        element={
          <ProtectedRoute>
            <GuestManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports-ui"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Optional: placeholder routes so nav doesn't break */}
      <Route
        path="/homepage"
        element={
          <ProtectedRoute>
            <Navigate to="/" replace />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
