import { useEffect, useState } from "react";
import { serviceApi, TableDetail } from "../api/service";

export function useServiceTableDetail(tableId: string | null, pollMs = 4000) {
  const [table, setTable] = useState<TableDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(!!tableId);
  const [error, setError] = useState<any>(null);

  async function load(initial = false) {
    if (!tableId) return;
    try {
      if (initial) setLoading(true);
      setError(null);
      const t = await serviceApi.getTable(tableId);
      setTable(t);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }

  useEffect(() => {
    setTable(null);
    if (tableId) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;
    const t = setInterval(() => load(false), pollMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, pollMs]);

  return { table, loading, error, refetch: () => load(true), setTable };
}
