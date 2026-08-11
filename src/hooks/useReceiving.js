import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { receivingService } from "../services/receivingService";

export const emptyReceivingItem = () => ({
  flowerId: "",
  shippedQuantity: "",
  actualReceivedQuantity: "",
  acceptedQuantity: "",
  unusableQuantity: "",
  unusableNotes: "",
});

export const emptyReceivingForm = () => ({
  farmId: "",
  receivedDate: "",
  items: [emptyReceivingItem()],
});

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function decimal(value) {
  return /^\d+(\.\d{1,2})?$/.test(String(value).trim()) ? Number(value) : null;
}

export function validateReceivingForm(payload) {
  const errors = {};
  const items = payload.items || [];

  if (!payload.farmId) errors.farmId = "Farm wajib dipilih.";
  if (!payload.receivedDate) errors.receivedDate = "Tanggal diterima wajib diisi.";
  if (!items.length) errors.items = "Minimal satu jenis bunga harus ditambahkan.";

  const flowerIds = new Set();
  items.forEach((item, index) => {
    const prefix = `items.${index}`;
    if (!item.flowerId) errors[`${prefix}.flowerId`] = "Flower wajib dipilih.";
    if (item.flowerId && flowerIds.has(String(item.flowerId))) errors[`${prefix}.flowerId`] = "Flower tidak boleh sama.";
    flowerIds.add(String(item.flowerId));

    ["shippedQuantity", "actualReceivedQuantity", "acceptedQuantity", "unusableQuantity"].forEach((field) => {
      if (decimal(item[field]) === null) errors[`${prefix}.${field}`] = "Masukkan angka desimal yang valid.";
    });

    const shipped = decimal(item.shippedQuantity);
    const actual = decimal(item.actualReceivedQuantity);
    const accepted = decimal(item.acceptedQuantity);
    const unusable = decimal(item.unusableQuantity);

    if (shipped !== null && actual !== null && actual > shipped) {
      errors[`${prefix}.actualReceivedQuantity`] = "Actual received tidak boleh melebihi shipped quantity.";
    }
    if (accepted !== null && unusable !== null && actual !== null && accepted + unusable !== actual) {
      errors[`${prefix}.acceptedQuantity`] = "Accepted + unusable harus sama dengan actual received.";
    }
  });

  return errors;
}

function normalizePayload(payload) {
  return {
    farmId: Number(payload.farmId),
    receivedDate: payload.receivedDate,
    items: payload.items.map((item) => ({
      flowerId: Number(item.flowerId),
      shippedQuantity: String(item.shippedQuantity).trim(),
      actualReceivedQuantity: String(item.actualReceivedQuantity).trim(),
      acceptedQuantity: String(item.acceptedQuantity).trim(),
      unusableQuantity: String(item.unusableQuantity).trim(),
      unusableNotes: String(item.unusableNotes || "").trim() || null,
    })),
  };
}

export default function useReceiving() {
  const [receivings, setReceivings] = useState([]);
  const [farms, setFarms] = useState([]);
  const [flowers, setFlowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarm, setSelectedFarm] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [formMode, setFormMode] = useState("create");
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      receivingService.list({ page, limit: 10 }),
      receivingService.listFarms(),
      receivingService.listFlowers(),
    ]);

    const [receivingResult, farmResult, flowerResult] = results;
    if (receivingResult.status === "fulfilled") {
      setReceivings(normalizeList(receivingResult.value.data));
      setPagination(receivingResult.value.pagination);
    }
    else setError(getApiError(receivingResult.reason, "Data receiving gagal dimuat."));
    if (farmResult.status === "fulfilled") setFarms(normalizeList(farmResult.value));
    else setError((current) => current || getApiError(farmResult.reason, "Data farm gagal dimuat."));
    if (flowerResult.status === "fulfilled") setFlowers(normalizeList(flowerResult.value));
    else setError((current) => current || getApiError(flowerResult.reason, "Data flower gagal dimuat."));
    setLoading(false);
  }, [page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination]);

  const updateSearchTerm = (value) => {
    setSearchTerm(value);
    setPage(1);
  };
  const updateSelectedFarm = (value) => {
    setSelectedFarm(value);
    setPage(1);
  };
  const updateSelectedDate = (value) => {
    setSelectedDate(value);
    setPage(1);
  };

  const filteredReceivings = receivings.filter((receiving) => {
    const farmName = receiving.farm?.name || "";
    const id = String(receiving.id || "");
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || id.includes(query) || farmName.toLowerCase().includes(query) || String(receiving.farmId || "").includes(query);
    const matchesFarm = selectedFarm === "all" || String(receiving.farmId) === String(selectedFarm);
    const matchesDate = !selectedDate || String(receiving.receivedDate).slice(0, 10) === selectedDate;
    return matchesSearch && matchesFarm && matchesDate;
  });

  const openCreate = () => {
    setDetail(null);
    setFormMode("create");
    setFormError("");
    setSuccessMessage("");
    setFormOpen(true);
  };

  const openDetail = async (id) => {
    setFormMode("view");
    setFormOpen(true);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDetail(await receivingService.getById(id));
    } catch (requestError) {
      setDetailError(getApiError(requestError, "Detail receiving gagal dimuat."));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setDetail(null);
    setFormError("");
  };

  const submitCreate = async (payload) => {
    const validationErrors = validateReceivingForm(payload);
    if (Object.keys(validationErrors).length) {
      setFormError("Periksa kembali field Receiving yang belum valid.");
      return { errors: validationErrors };
    }

    setSubmitting(true);
    setFormError("");
    try {
      await receivingService.create(normalizePayload(payload));
      setFormOpen(false);
      setSuccessMessage("Receiving berhasil disimpan.");
      await refresh();
      return { errors: {} };
    } catch (requestError) {
      const message = getApiError(requestError, "Receiving gagal disimpan.");
      setFormError(message);
      return { errors: { form: message } };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    receivings,
    filteredReceivings,
    farms,
    flowers,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    selectedFarm,
    setSelectedFarm: updateSelectedFarm,
    selectedDate,
    setSelectedDate: updateSelectedDate,
    page,
    setPage,
    pagination,
    loading,
    error,
    refresh,
    detail,
    detailLoading,
    detailError,
    openDetail,
    closeForm,
    formMode,
    formOpen,
    openCreate,
    submitCreate,
    submitting,
    formError,
    successMessage,
    setSuccessMessage,
  };
}
