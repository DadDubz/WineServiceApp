import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import InventoryPage from '../pages/InventoryPage';
import DinnerServicePage from '../pages/DinnerServicePage';
import GuestManagementPage from '../pages/GuestManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/inventory',
        element: (
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/service',
        element: (
          <ProtectedRoute>
            <DinnerServicePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/guests',
        element: (
          <ProtectedRoute>
            <GuestManagementPage />
          </ProtectedRoute>
        ),
      },
      { path: '/login', element: <LoginPage /> },
    ],
  },
]);
