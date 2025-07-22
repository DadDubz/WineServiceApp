// src/layouts/ManagerLayout.tsx
import { Outlet } from 'react-router-dom';

export default function ManagerLayout() {
  return (
    <div className="min-h-screen bg-green-50">
      <header className="p-4 bg-green-100 text-green-800 font-bold">Manager Dashboard</header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}