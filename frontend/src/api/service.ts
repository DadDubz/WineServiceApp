import { api } from "./client";

export type TableStatus = "OPEN" | "COMPLETED" | "CANCELED";
export type WineKind = "BOTTLE" | "BTG";

export type TableListItem = {
  id: string;
  table_number: string;
  location?: string | null;
  status: TableStatus;
  step_index: number;
  guest_count: number;
  arrived_at?: string | null;
  seated_at?: string | null;
  updated_at: string;
};

export type Guest = {
  id: string;
  name?: string | null;
  allergy?: string | null;
  protein_sub?: string | null;
  doneness?: string | null;
  substitutions?: string | null;
  notes?: string | null;
  updated_at: string;
};

export type WineEntry = {
  id: string;
  kind: WineKind;
  wine_id?: string | null;
  label: string;
  quantity: number;
  updated_at: string;
};

export type StepEvent = {
  id: string;
  event_type: string;
  from_step?: number | null;
  to_step?: number | null;
  payload?: string | null;
  actor_user_id?: string | null;
  created_at: string;
};

export type TableDetail = {
  id: string;
  table_number: string;
  location?: string | null;
  status: TableStatus;
  step_index: number;
  guest_count: number;
  notes?: string | null;
  arrived_at?: string | null;
  seated_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  guests: Guest[];
  wines: WineEntry[];
  events: StepEvent[];
};

export type TableListResponse = {
  items: TableListItem[];
  page: number;
  limit: number;
  total: number;
};

export const serviceApi = {
  listTables: (params: { status?: TableStatus; page?: number; limit?: number; updated_since?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set("status", params.status);
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.updated_since) q.set("updated_since", params.updated_since);
    return api.get<TableListResponse>(`/api/service/tables?${q.toString()}`);
  },

  getTable: (tableId: string) => api.get<TableDetail>(`/api/service/tables/${tableId}`),

  createTable: (payload: { table_number: string; location?: string; guest_count?: number; notes?: string }) =>
    api.post<TableDetail>(`/api/service/tables`, payload),

  patchTable: (tableId: string, payload: Partial<{ table_number: string; location: string; guest_count: number; notes: string }>) =>
    api.patch<TableDetail>(`/api/service/tables/${tableId}`, payload),

  arrive: (tableId: string) => api.post<TableDetail>(`/api/service/tables/${tableId}/arrive`),
  seat: (tableId: string) => api.post<TableDetail>(`/api/service/tables/${tableId}/seat`),
  complete: (tableId: string) => api.post<TableDetail>(`/api/service/tables/${tableId}/complete`),

  next: (tableId: string) => api.post<{ table_id: string; step_index: number; updated_at: string }>(`/api/service/tables/${tableId}/next`),
  undo: (tableId: string) => api.post<{ table_id: string; step_index: number; updated_at: string }>(`/api/service/tables/${tableId}/undo`),

  addGuest: (tableId: string, payload: Partial<Guest>) => api.post<TableDetail>(`/api/service/tables/${tableId}/guests`, payload),
  patchGuest: (tableId: string, guestId: string, payload: Partial<Guest>) =>
    api.patch<TableDetail>(`/api/service/tables/${tableId}/guests/${guestId}`, payload),
  deleteGuest: (tableId: string, guestId: string) => api.del<TableDetail>(`/api/service/tables/${tableId}/guests/${guestId}`),

  addWine: (tableId: string, payload: { kind: WineKind; wine_id?: string; label: string; quantity: number }) =>
    api.post<TableDetail>(`/api/service/tables/${tableId}/wines`, payload),
  patchWine: (tableId: string, wineEntryId: string, payload: Partial<{ label: string; quantity: number }>) =>
    api.patch<TableDetail>(`/api/service/tables/${tableId}/wines/${wineEntryId}`, payload),
  deleteWine: (tableId: string, wineEntryId: string) => api.del<TableDetail>(`/api/service/tables/${tableId}/wines/${wineEntryId}`),
};
