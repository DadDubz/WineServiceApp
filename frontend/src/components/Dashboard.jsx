import { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import Service from "./Service";
import Wines from "./Wines";
import Reports from "./Reports";

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const r = localStorage.getItem("role");
    if (!r) navigate("/");
    else setRole(r);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wine Service Dashboard</h1>
        <button
          onClick={logout}
          className="text-red-500 underline hover:text-red-700"
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-4 mb-6">
        <Link to="service" className="text-blue-600 underline">
          Service
        </Link>
        {(role === "sommelier" || role === "manager") && (
          <Link to="wines" className="text-blue-600 underline">
            Wines
          </Link>
        )}
        {role === "manager" && (
          <Link to="reports" className="text-blue-600 underline">
            Reports
          </Link>
        )}
      </nav>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded shadow">
        <Routes>
          <Route path="service" element={<Service />} />
          <Route path="wines" element={<Wines />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
}
