import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "../services/api";
import { dailySalesService } from "../services/dailySalesService";
import { inventoryService } from "../services/inventoryService";
import { normalizeIntegerQuantity } from "../utils/quantity";

export const emptyDailySalesItem = () => ({
  flowerId: "",
  soldQuantity: "",
  damagedQuantity: "",
});

function todayLocal() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export const emptyDailySalesForm = () => ({
  salesDate: todayLocal(),
  items: [emptyDailySalesItem()],
});

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function normalizeDailySalesQuantity(value) {
  const normalized = String(value ?? "").trim();
  return /^\d+(\.\d{1,2})?$/.test(normalized)
    ? normalizeIntegerQuantity(normalized)
    : null;
}

function getDailySalesError(error, fallback) {
  const message = getApiError(error, fallback);
  const details = error.response?.data?.errors;
  if (!Array.isArray(details) || !details.length) return message;

  const detailMessage = details
    .map((detail) => detail.message || detail.field)
    .filter(Boolean)
    .join(" ");
  return detailMessage ? `${message} ${detailMessage}` : message;
}

export function validateDailySalesForm(payload, availableStockByFlowerId = null) {
  const errors = {};
  const items = payload.items || [];
  const flowerIds = new Set();

  if (!payload.salesDate) errors.salesDate = "The sales date is required.";
  if (!items.length) errors.items = "Add at least one flower type.";

  items.forEach((item, index) => {
    const prefix = `items.${index}`;
    const flowerId = String(item.flowerId || "");
    const soldQuantity = normalizeDailySalesQuantity(item.soldQuantity);
    const damagedQuantity = normalizeDailySalesQuantity(item.damagedQuantity);

    if (!flowerId) errors[`${prefix}.flowerId`] = "A flower must be selected.";
    if (flowerId && flowerIds.has(flowerId)) errors[`${prefix}.flowerId`] = "Flowers cannot be duplicated.";
    if (flowerId) flowerIds.add(flowerId);

    if (soldQuantity === null) errors[`${prefix}.soldQuantity`] = "Enter a valid non-negative quantity.";
    if (damagedQuantity === null) errors[`${prefix}.damagedQuantity`] = "Enter a valid non-negative quantity.";
    if (soldQuantity !== null && damagedQuantity !== null
      && Number(soldQuantity) + Number(damagedQuantity) <= 0) {
      errors[`${prefix}.soldQuantity`] = "Sold and damaged quantities must total more than zero.";
    }
    if (flowerId && availableStockByFlowerId
      && soldQuantity !== null && damagedQuantity !== null) {
      const availableStock = Number(availableStockByFlowerId[flowerId] ?? 0);
      if (Number(soldQuantity) + Number(damagedQuantity) > availableStock) {
        errors[`${prefix}.soldQuantity`] = `Sold and damaged quantities cannot exceed available stock (${availableStock}).`;
      }
    }
  });

  return errors;
}

function normalizePayload(payload) {
  return {
    salesDate: payload.salesDate,
    items: payload.items.map((item) => ({
      flowerId: Number(item.flowerId),
      soldQuantity: normalizeIntegerQuantity(item.soldQuantity),
      damagedQuantity: normalizeIntegerQuantity(item.damagedQuantity),
    })),
  };
}

function normalizeQuantityFields(payload) {
  return {
    ...payload,
    items: payload.items.map((item) => {
      const soldQuantity = normalizeDailySalesQuantity(item.soldQuantity);
      const damagedQuantity = normalizeDailySalesQuantity(item.damagedQuantity);
      return {
        ...item,
        soldQuantity: soldQuantity === null ? item.soldQuantity : soldQuantity,
        damagedQuantity: damagedQuantity === null ? item.damagedQuantity : damagedQuantity,
      };
    }),
  };
}

function summarizeSales(sales) {
  return sales.map((sale) => {
    const items = sale.items || [];
    const varieties = [...new Set(items.map((item) => (
      item.flower?.variety || item.flower?.name || `Flower #${item.flowerId}`
    )))];
    const soldQuantity = items.reduce((total, item) => total + Number(item.soldQuantity || 0), 0);
    const damagedQuantity = items.reduce((total, item) => total + Number(item.damagedQuantity || 0), 0);

    return {
      rowId: sale.id,
      saleId: sale.id,
      salesDate: sale.salesDate,
      variety: varieties.join(", ") || "-",
      soldQuantity,
      damagedQuantity,
    };
  });
}

export default function useDailySales() {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("default");
  const [pagination, setPagination] = useState(null);
  const [flowers, setFlowers] = useState([]);
  const [branchStock, setBranchStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [stockError, setStockError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyDailySalesForm);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const availableStockByFlowerId = useMemo(
    () => Object.fromEntries(
      branchStock.map((entry) => [String(entry.flowerId), entry.totalQuantity ?? "0"]),
    ),
    [branchStock],
  );

  const loadBranchStock = useCallback(async () => {
    setStockLoading(true);
    setStockError("");
    try {
      const result = await inventoryService.getMyBranchStock({ limit: 100 });
      setBranchStock(normalizeList(result.data));
      setStockLoaded(true);
    } catch (requestError) {
      setBranchStock([]);
      setStockLoaded(false);
      setStockError(getDailySalesError(requestError, "Unable to load current branch stock."));
    } finally {
      setStockLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [salesResult, flowersResult] = await Promise.allSettled([
        dailySalesService.list({ page, limit: 10, sort }),
        dailySalesService.listFlowers(),
      ]);

      if (salesResult.status === "fulfilled") {
        setSales(normalizeList(salesResult.value.data));
        setPagination(salesResult.value.pagination);
        if (flowersResult.status === "rejected") {
          setError(getDailySalesError(flowersResult.reason, "Unable to load flowers."));
        }
      } else {
        setError(getDailySalesError(salesResult.reason, "Unable to load daily sales."));
      }

      if (flowersResult.status === "fulfilled") setFlowers(normalizeList(flowersResult.value));
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

  const openCreate = () => {
    setForm(emptyDailySalesForm());
    setFormError("");
    setSuccessMessage("");
    setFormOpen(true);
    loadBranchStock();
  };

  const closeCreate = () => {
    if (submitting) return;
    setFormOpen(false);
    setFormError("");
  };

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDetail(await dailySalesService.getById(id));
    } catch (requestError) {
      setDetailError(getDailySalesError(requestError, "Unable to load daily sales details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (detailLoading) return;
    setDetailOpen(false);
    setDetail(null);
    setDetailError("");
  };

  const submitCreate = async (payload) => {
    const normalizedPayload = normalizeQuantityFields(payload);
    const validationErrors = validateDailySalesForm(
      normalizedPayload,
      stockLoaded ? availableStockByFlowerId : null,
    );
    if (Object.keys(validationErrors).length) {
      setFormError("Review the invalid Daily Sales fields.");
      return { errors: validationErrors };
    }

    setSubmitting(true);
    setFormError("");
    try {
      await dailySalesService.create(normalizePayload(normalizedPayload));
      setFormOpen(false);
      setSuccessMessage("Daily Sales saved successfully.");
      await Promise.all([refresh(), loadBranchStock()]);
      return { errors: {} };
    } catch (requestError) {
      const message = getDailySalesError(requestError, "Unable to save Daily Sales.");
      setFormError(message);
      return { errors: { form: message } };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sales,
    tableRows: summarizeSales(sales),
    flowers,
    availableStockByFlowerId,
    stockLoading,
    stockLoaded,
    stockError,
    loading,
    error,
    refresh,
    page,
    setPage,
    sort,
    setSort: updateSort,
    pagination,
    form,
    setForm,
    openCreate,
    closeCreate,
    formOpen,
    submitCreate,
    submitting,
    formError,
    successMessage,
    setSuccessMessage,
    openDetail,
    closeDetail,
    detailOpen,
    detail,
    detailLoading,
    detailError,
  };
}
