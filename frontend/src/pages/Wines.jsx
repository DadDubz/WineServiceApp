import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Wines() {
  const [wines, setWines] = useState([]);

  useEffect(() => {
    axios.get("/wines/").then(res => setWines(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Wine Inventory</h2>
      {wines.map(w => (
        <div key={w.id} className="border p-2 mb-2 rounded">
          <p>{w.name} ({w.vintage}) - {w.type}</p>
          <p><em>{w.producer} – {w.region}</em></p>
          <p>${w.price} | Stock: {w.stock}</p>
        </div>
      ))}
    </div>
  );
}
