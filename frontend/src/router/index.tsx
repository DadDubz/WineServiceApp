import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/login';
import Home from '@/pages/home';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
