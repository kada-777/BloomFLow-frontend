import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { inventoryService } from "../services/inventoryService";

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export default function useHeadOfficeInventory() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(normalizeList(await inventoryService.getHeadOfficeInventory()));
    } catch (requestError) {
      setError(getApiError(requestError, "Head Office inventory gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredRows = rows.filter((row) => {
    if (statusFilter === "depleted") return false;
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [row.flowerName, row.variety]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const totalAvailableStock = rows.reduce((sum, row) => sum + Number(row.totalAvailable || 0), 0);

  return {
    rows,
    filteredRows,
    totalAvailableStock,
    totalBatches: null,
    depletedBatches: null,
    utilizationRate: null,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    refresh,
    isDepletedUnavailable: statusFilter === "depleted",
  };
}
