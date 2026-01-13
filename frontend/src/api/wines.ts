// src/api/wines.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

// IMPORTANT: this matches your AuthContext token key
const TOKEN_KEY = "authToken";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: API_BASE_URL,
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
  vintage: number;
  region: string;
  quantity: number;
  is_btg: boolean;
}

export type WineCreate = Omit<Wine, "id">;
export type WineUpdate = Partial<Omit<Wine, "id">>;

// Endpoints (baseURL already includes /api)
export async function getWines(): Promise<Wine[]> {
  const res = await api.get<Wine[]>("/wines");
  return res.data;
}

export async function addWine(data: WineCreate): Promise<Wine> {
  const res = await api.post<Wine>("/wines", data);
  return res.data;
}

export async function updateWine(id: number, data: WineUpdate): Promise<Wine> {
  const res = await api.put<Wine>(`/wines/${id}`, data);
  return res.data;
}
