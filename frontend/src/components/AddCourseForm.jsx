import { useState } from "react";
import axios from "../api/axios";

export default function AddCourseForm({ tableId, onAdd }) {
  const [form, setForm] = useState({ name: "", wine: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(`/tables/${tableId}/courses`, form);
    onAdd(res.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input placeholder="Course name" onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2" />
      <input placeholder="Wine" onChange={e => setForm({ ...form, wine: e.target.value })} className="border p-2" />
      <button className="bg-purple-600 text-white px-3 py-2 rounded">Add</button>
    </form>
  );
}
