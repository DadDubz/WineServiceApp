import { useState } from "react";
import axios from "../api/axios";

export default function AddTableForm({ onAdd }) {
  const [form, setForm] = useState({ number: "", server: "", guests: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/tables/", {
      ...form,
      number: parseInt(form.number),
      guests: parseInt(form.guests),
    });
    onAdd(res.data);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 bg-gray-50 p-4 rounded shadow">
      <input name="number" placeholder="Table #" onChange={e => setForm({ ...form, number: e.target.value })} className="border p-2 mr-2" />
      <input name="server" placeholder="Server Name" onChange={e => setForm({ ...form, server: e.target.value })} className="border p-2 mr-2" />
      <input name="guests" placeholder="# Guests" onChange={e => setForm({ ...form, guests: e.target.value })} className="border p-2 mr-2" />
      <button className="bg-blue-600 text-white p-2 rounded">Seat Table</button>
    </form>
  );
}
