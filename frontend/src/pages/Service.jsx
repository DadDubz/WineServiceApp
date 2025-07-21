import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Service() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    axios.get("/tables/").then(res => setTables(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Current Tables</h2>
      {tables.map(t => (
        <div key={t.id} className="border p-2 mb-2 rounded">
          <p><strong>Table:</strong> {t.number}</p>
          <p><strong>Server:</strong> {t.server}</p>
          <p><strong>Status:</strong> {t.status}</p>
          <ul>
            {t.courses.map((c, i) => (
              <li key={i}>• {c.name} – {c.wine}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
