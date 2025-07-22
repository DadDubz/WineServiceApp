// src/router/index.tsx
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/home';
import NotFound from '../pages/not-found';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
