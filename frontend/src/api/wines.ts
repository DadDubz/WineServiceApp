// src/api/wines.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// IMPORTANT: this matches your AuthContext token key
const TOKEN_KEY = "authToken";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Adjust these fields to match your backend schema if needed
export interface Wine {
  id: number;
  name: string;
  vintage?: number | null;
  region?: string | null;
  quantity?: number | null;
  is_btg?: boolean | null;
}

export type WineCreate = Omit<Wine, "id">;
export type WineUpdate = Partial<WineCreate>;

// If your backend endpoint differs, change ONLY these paths:
export async function getWines(): Promise<Wine[]> {
  const res = await api.get<Wine[]>("/api/wines");
  return res.data;
}

export async function addWine(data: WineCreate): Promise<Wine> {
  const res = await api.post<Wine>("/api/wines", data);
  return res.data;
}

export async function updateWine(id: number, data: WineUpdate): Promise<Wine> {
  const res = await api.put<Wine>(`/api/wines/${id}`, data);
  return res.data;
}
