import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Dashboard from '@/pages/DashboardPage';
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
