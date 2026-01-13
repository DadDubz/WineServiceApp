// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import ServicePage from "@/pages/ServicePage";
import GuestManagementPage from "@/pages/GuestManagementPage";
import ReportsPage from "@/pages/ReportsPage";

import ProtectedRoute from "@/components/ProtectedRoute";

function AppRoutes() {
  const { user, isLoading } = useAuth();

  // Optional: prevents route flicker on refresh while /auth/me is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    );
  }

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

      <Route
        path="/guests"
        element={
          <ProtectedRoute>
            <GuestManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
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
