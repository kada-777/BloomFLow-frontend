import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { dailySalesService } from "../services/dailySalesService";

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

function decimal(value) {
  return /^\d+(\.\d{1,2})?$/.test(String(value).trim()) ? Number(value) : null;
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

export function validateDailySalesForm(payload) {
  const errors = {};
  const items = payload.items || [];
  const flowerIds = new Set();

  if (!payload.salesDate) errors.salesDate = "Tanggal sales wajib diisi.";
  if (!items.length) errors.items = "Minimal satu jenis bunga harus ditambahkan.";

  items.forEach((item, index) => {
    const prefix = `items.${index}`;
    const flowerId = String(item.flowerId || "");
    const soldQuantity = decimal(item.soldQuantity);
    const damagedQuantity = decimal(item.damagedQuantity);

    if (!flowerId) errors[`${prefix}.flowerId`] = "Flower wajib dipilih.";
    if (flowerId && flowerIds.has(flowerId)) errors[`${prefix}.flowerId`] = "Flower tidak boleh sama.";
    if (flowerId) flowerIds.add(flowerId);

    if (soldQuantity === null) errors[`${prefix}.soldQuantity`] = "Masukkan angka desimal yang valid.";
    if (damagedQuantity === null) errors[`${prefix}.damagedQuantity`] = "Masukkan angka desimal yang valid.";
    if (soldQuantity !== null && damagedQuantity !== null && soldQuantity + damagedQuantity <= 0) {
      errors[`${prefix}.soldQuantity`] = "Sold dan damaged quantity harus lebih dari nol.";
    }
  });

  return errors;
}

function normalizePayload(payload) {
  return {
    salesDate: payload.salesDate,
    items: payload.items.map((item) => ({
      flowerId: Number(item.flowerId),
      soldQuantity: String(item.soldQuantity).trim(),
      damagedQuantity: String(item.damagedQuantity).trim(),
    })),
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
  const [flowers, setFlowers] = useState([]);
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [salesResult, flowersResult] = await Promise.allSettled([
        dailySalesService.list(),
        dailySalesService.listFlowers(),
      ]);

      if (salesResult.status === "fulfilled") {
        setSales(normalizeList(salesResult.value));
        if (flowersResult.status === "rejected") {
          setError(getDailySalesError(flowersResult.reason, "Data flower gagal dimuat."));
        }
      } else {
        setError(getDailySalesError(salesResult.reason, "Data daily sales gagal dimuat."));
      }

      if (flowersResult.status === "fulfilled") setFlowers(normalizeList(flowersResult.value));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openCreate = () => {
    setForm(emptyDailySalesForm());
    setFormError("");
    setSuccessMessage("");
    setFormOpen(true);
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
      setDetailError(getDailySalesError(requestError, "Detail daily sales gagal dimuat."));
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
    const validationErrors = validateDailySalesForm(payload);
    if (Object.keys(validationErrors).length) {
      setFormError("Periksa kembali field Daily Sales yang belum valid.");
      return { errors: validationErrors };
    }

    setSubmitting(true);
    setFormError("");
    try {
      await dailySalesService.create(normalizePayload(payload));
      setFormOpen(false);
      setSuccessMessage("Daily Sales berhasil disimpan.");
      await refresh();
      return { errors: {} };
    } catch (requestError) {
      const message = getDailySalesError(requestError, "Daily Sales gagal disimpan.");
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
    loading,
    error,
    refresh,
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
