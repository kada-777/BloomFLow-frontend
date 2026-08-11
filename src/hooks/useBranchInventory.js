import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { inventoryService } from "../services/inventoryService";

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function quantity(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildRows(entries) {
  return entries.map((entry) => {
    const totals = (entry.lots || []).reduce(
      (summary, lot) => {
        const amount = quantity(lot.quantity);
        if (lot.flowerStatus === "FRESH") summary.fresh += amount;
        if (lot.flowerStatus === "GRADE_C") summary.gradeC += amount;
        if (lot.flowerStatus === "DAMAGED") summary.damaged += amount;
        return summary;
      },
      { fresh: 0, gradeC: 0, damaged: 0 },
    );

    return {
      id: entry.flowerId,
      flowerId: entry.flowerId,
      flowerName: entry.flowerName || `Flower #${entry.flowerId}`,
      variety: entry.variety,
      available: totals.fresh + totals.gradeC,
      ...totals,
    };
  });
}

export default function useBranchInventory() {
  const [inventory, setInventory] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("default");
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await inventoryService.getMyBranchStock({ page, limit: 10, sort });
      setInventory(normalizeList(result.data));
      setPagination(result.pagination);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load branch inventory."));
    } finally {
      setLoading(false);
    }
  }, [page, sort]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination]);

  const updateSort = (value) => {
    setSort(value);
    setPage(1);
  };

  return {
    rows: buildRows(inventory),
    loading,
    error,
    refresh,
    page,
    setPage,
    sort,
    setSort: updateSort,
    pagination,
  };
}
