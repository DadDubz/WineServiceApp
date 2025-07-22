// src/App.tsx
import React from 'react';
import AppRoutes from './router';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <AppRoutes />
    </div>
  );
};

export default App;
