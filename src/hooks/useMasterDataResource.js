import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../services/api";
import { masterDataService } from "../services/masterDataService";

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export default function useMasterDataResource({ resource, searchableFields, sortOptions = [] }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(sortOptions[0]?.value || "default");
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await masterDataService.list(resource, { page, limit: 10, sort });
      setItems(normalizeList(result.data));
      setPagination(result.pagination);
    } catch (requestError) {
      setError(getApiError(requestError, "Data gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, [page, resource, sort]);

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

  const updateSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const filteredItems = items.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return searchableFields.some((field) => String(item[field] || "").toLowerCase().includes(query));
  });

  const openCreate = () => {
    setSelectedItem(null);
    setFormMode("create");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setFormMode("edit");
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setSelectedItem(null);
    setFormError("");
  };

  const submitForm = async (payload) => {
    setSubmitting(true);
    setFormError("");
    try {
      if (formMode === "edit") await masterDataService.update(resource, selectedItem.id, payload);
      else await masterDataService.create(resource, payload);
      setFormOpen(false);
      setSelectedItem(null);
      await refresh();
    } catch (requestError) {
      setFormError(getApiError(requestError, "Data gagal disimpan."));
    } finally {
      setSubmitting(false);
    }
  };

  const openDelete = (item) => setDeleteTarget(item);
  const closeDelete = () => setDeleteTarget(null);

  const confirmDelete = () => {
    // TODO: connect masterDataService.remove(resource, deleteTarget.id) when DELETE is available.
    setDeleteTarget(null);
    setNotice("Delete API backend belum tersedia.");
  };

  return {
    items: filteredItems,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    page,
    setPage,
    pagination,
    sort,
    setSort: updateSort,
    loading,
    error,
    refresh,
    selectedItem,
    formOpen,
    formMode,
    submitting,
    formError,
    openCreate,
    openEdit,
    closeForm,
    submitForm,
    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
    notice,
    setNotice,
  };
}
