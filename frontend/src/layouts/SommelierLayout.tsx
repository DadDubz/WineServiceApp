// src/layouts/SommelierLayout.tsx
import { Outlet } from 'react-router-dom';

export default function SommelierLayout() {
  return (
    <div className="min-h-screen bg-purple-50">
      <header className="p-4 bg-purple-100 text-purple-800 font-bold">Sommelier Dashboard</header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
