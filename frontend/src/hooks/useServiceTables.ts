import { useEffect, useMemo, useRef, useState } from "react";
import { serviceApi, TableListItem, TableStatus } from "../api/service";

export function useServiceTables(opts?: { status?: TableStatus; limit?: number; pollMs?: number }) {
  const status = opts?.status ?? "OPEN";
  const limit = opts?.limit ?? 50;
  const pollMs = opts?.pollMs ?? 5000;

  const [items, setItems] = useState<TableListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const latestUpdatedAtRef = useRef<string | null>(null);

  async function load(initial = false) {
    try {
      if (initial) setLoading(true);
      setError(null);

      const updated_since = latestUpdatedAtRef.current || undefined;
      const res = await serviceApi.listTables({ status, limit, page: 1, updated_since });

      if (!latestUpdatedAtRef.current) {
        // first load: use response items
        setItems(res.items);
      } else {
        // merge updates: server returns only items updated since
        if (res.items.length > 0) {
          setItems((prev) => {
            const map = new Map(prev.map((x) => [x.id, x]));
            for (const it of res.items) map.set(it.id, it);
            return Array.from(map.values()).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
          });
        }
      }

      const newest = (res.items[0]?.updated_at) || items[0]?.updated_at || null;
      if (newest) latestUpdatedAtRef.current = newest;

      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    latestUpdatedAtRef.current = null;
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit]);

  useEffect(() => {
    const t = setInterval(() => load(false), pollMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs, status, limit]);

  return {
    items,
    loading,
    error,
    refetch: () => load(true),
    setItems, // allow optimistic updates
  };
}
