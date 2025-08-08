// src/App.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Outlet />
      </div>
    </AuthProvider>
  );
};

export default App;
