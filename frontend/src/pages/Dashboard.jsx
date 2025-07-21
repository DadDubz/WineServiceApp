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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wine Service Dashboard</h1>
      <nav className="flex space-x-4 mb-4">
        <Link to="service" className="text-blue-600 underline">Service</Link>
        {(role === "sommelier" || role === "manager") && <Link to="wines" className="text-blue-600 underline">Wines</Link>}
        {role === "manager" && <Link to="reports" className="text-blue-600 underline">Reports</Link>}
      </nav>

      <Routes>
        <Route path="service" element={<Service />} />
        <Route path="wines" element={<Wines />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </div>
  );
}
