// src/layouts/ExpoLayout.tsx
import { Outlet } from 'react-router-dom';

export default function ExpoLayout() {
  return (
    <div className="min-h-screen bg-blue-50">
      <header className="p-4 bg-blue-100 text-blue-800 font-bold">Expo Dashboard</header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}