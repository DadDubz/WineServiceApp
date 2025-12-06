// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import ServicePage from "@/pages/ServicePage";
import ProtectedRoute from "@/components/ProtectedRoute";

// Plasmic Host renderer
import PlasmicHostPage from "@/pages/PlasmicHostPage";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Login */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />

      {/* Default dashboard (React-coded) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* 🔥 Plasmic Dashboard UI */}
      <Route
        path="/dashboard-ui"
        element={
          <ProtectedRoute>
            <PlasmicHostPage pageName="DashboardUI" />
          </ProtectedRoute>
        }
      />

      {/* Inventory */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        }
      />

      {/* React-coded Service Page */}
      <Route
        path="/service"
        element={
          <ProtectedRoute>
            <ServicePage />
          </ProtectedRoute>
        }
      />

      {/* 🔥 Plasmic Service UI */}
      <Route
        path="/service-ui"
        element={
          <ProtectedRoute>
            <PlasmicHostPage pageName="ServiceUI" />
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
