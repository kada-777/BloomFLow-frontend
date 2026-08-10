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
        summary.available += amount;
        if (lot.flowerStatus === "FRESH") summary.fresh += amount;
        if (lot.flowerStatus === "GRADE_C") summary.gradeC += amount;
        if (lot.flowerStatus === "DAMAGED") summary.damaged += amount;
        return summary;
      },
      { fresh: 0, gradeC: 0, damaged: 0, available: 0 },
    );

    return {
      id: entry.flowerId,
      flowerId: entry.flowerId,
      flowerName: entry.flowerName || `Flower #${entry.flowerId}`,
      variety: entry.variety,
      ...totals,
    };
  });
}

export default function useBranchInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setInventory(normalizeList(await inventoryService.getMyBranchStock()));
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load branch inventory."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    rows: buildRows(inventory),
    loading,
    error,
    refresh,
  };
}
