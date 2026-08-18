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

function integer(value) {
  return /^\d+$/.test(String(value).trim()) ? Number(value) : null;
}

export function validateReceivingForm(payload) {
  const errors = {};
  const items = payload.items || [];

  if (!payload.farmId) errors.farmId = "A farm must be selected.";
  if (!payload.receivedDate) errors.receivedDate = "The received date is required.";
  if (!items.length) errors.items = "Add at least one flower type.";

  const flowerIds = new Set();
  items.forEach((item, index) => {
    const prefix = `items.${index}`;
    if (!item.flowerId) errors[`${prefix}.flowerId`] = "A flower must be selected.";
    if (item.flowerId && flowerIds.has(String(item.flowerId))) errors[`${prefix}.flowerId`] = "Flowers cannot be duplicated.";
    flowerIds.add(String(item.flowerId));

    ["shippedQuantity", "actualReceivedQuantity", "acceptedQuantity", "unusableQuantity"].forEach((field) => {
       if (integer(item[field]) === null) errors[`${prefix}.${field}`] = "Enter a whole number.";
    });

     const shipped = integer(item.shippedQuantity);
     const actual = integer(item.actualReceivedQuantity);
     const accepted = integer(item.acceptedQuantity);
     const unusable = integer(item.unusableQuantity);

    if (shipped !== null && actual !== null && actual > shipped) {
      errors[`${prefix}.actualReceivedQuantity`] = "Actual received quantity cannot exceed shipped quantity.";
    }
    if (accepted !== null && unusable !== null && actual !== null && accepted + unusable !== actual) {
      errors[`${prefix}.acceptedQuantity`] = "Accepted plus unusable quantity must equal actual received quantity.";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
      receivingService.list({
        page,
        limit: 10,
        receivedDate: selectedDate,
        farmId: selectedFarm === "all" ? "" : selectedFarm,
        search: debouncedSearch,
      }),
      receivingService.listFarms(),
      receivingService.listFlowers(),
    ]);

    const [receivingResult, farmResult, flowerResult] = results;
    if (receivingResult.status === "fulfilled") {
      setReceivings(normalizeList(receivingResult.value.data));
      setPagination(receivingResult.value.pagination);
    }
    else setError(getApiError(receivingResult.reason, "Unable to load receiving data."));
    if (farmResult.status === "fulfilled") setFarms(normalizeList(farmResult.value));
    else setError((current) => current || getApiError(farmResult.reason, "Unable to load farms."));
    if (flowerResult.status === "fulfilled") setFlowers(normalizeList(flowerResult.value));
    else setError((current) => current || getApiError(flowerResult.reason, "Unable to load flowers."));
    setLoading(false);
  }, [debouncedSearch, page, selectedDate, selectedFarm]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (pagination?.totalPages && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [page, pagination]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

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
      setDetailError(getApiError(requestError, "Unable to load receiving details."));
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
      setFormError("Review the invalid Receiving fields.");
      return { errors: validationErrors };
    }

    setSubmitting(true);
    setFormError("");
    try {
      await receivingService.create(normalizePayload(payload));
      setFormOpen(false);
      setSuccessMessage("Receiving saved successfully.");
      await refresh();
      return { errors: {} };
    } catch (requestError) {
      const message = getApiError(requestError, "Unable to save Receiving.");
      setFormError(message);
      return { errors: { form: message } };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    receivings,
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
