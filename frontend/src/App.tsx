// src/App.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <div 
        className="min-h-screen" 
        style={{ 
          backgroundColor: '#F8F5F0',
          color: '#1A1A1A'
        }}
      >
        <Outlet />
      </div>
    </AuthProvider>
  );
};

export default App;
