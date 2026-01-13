// src/api/wines.ts
import axios from "axios";

// Configure your base API URL; adjust if you use Vite env
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

// Types
export interface Wine {
  id: number;
  name: string;
  vintage: number;
  region: string;
  quantity: number;
  is_btg: boolean;
}

export interface WineCreate {
  name: string;
  vintage: number;
  region: string;
  quantity: number;
  is_btg: boolean;
}

export interface WineUpdate {
  name?: string;
  vintage?: number;
  region?: string;
  quantity?: number;
  is_btg?: boolean;
}

// Fetch all wines
export const getWines = () => api.get<Wine[]>("/api/wines");

// Create a new wine
export const addWine = (data: WineCreate) => api.post<Wine>("/api/wines", data);

// Update an existing wine by ID
export const updateWine = (id: number, data: WineUpdate) =>
  api.put<Wine>(`/api/wines/${id}`, data);
