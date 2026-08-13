import { Plus } from "lucide-react";
import ActionButtons from "../ActionButtons/ActionButtons";
import ActionNotice from "../ActionNotice/ActionNotice";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import GenericDataTable from "../GenericDataTable/GenericDataTable";
import Pagination from "../Pagination/Pagination";
import ResourceFormCard from "../ResourceFormCard/ResourceFormCard";
import SearchBar from "../SearchBar/SearchBar";
import useMasterDataResource from "../../../hooks/useMasterDataResource";
import "./MasterDataPage.css";

export default function MasterDataPage({
  resource,
  title,
  subtitle,
  addLabel,
  emptyMessage,
  searchPlaceholder,
  searchableFields,
  columns,
  fields,
  formCopy,
  sortOptions = [],
}) {
  const resourceState = useMasterDataResource({ resource, searchableFields, sortOptions });
  const {
    items,
    searchTerm,
    setSearchTerm,
    pagination,
    page,
    setPage,
    sort,
    setSort,
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
  } = resourceState;

  return (
    <div className="master-data-page">
      <header className="master-data-header">
        <div>
          <p className="master-data-eyebrow">BLOOMFLOW MASTER DATA</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="master-data-add" type="button" onClick={openCreate}>
          <Plus size={18} /> {addLabel}
        </button>
      </header>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={searchPlaceholder}
        ariaLabel={`Search ${title}`}
      />

      {sortOptions.length > 0 && (
        <label className="master-data-sort-field">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      )}

      <ActionNotice message={error} tone="error" onAction={refresh} />
      <ActionNotice message={notice} onClose={() => setNotice("")} />

      <GenericDataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage={emptyMessage}
        className="master-data-table table-card"
        renderActions={(item) => (
          <ActionButtons onEdit={() => openEdit(item)} onDelete={() => openDelete(item)} />
        )}
      />
      <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />

      <ResourceFormCard
        open={formOpen}
        mode={formMode}
        title={formMode === "edit" ? formCopy.editTitle : formCopy.createTitle}
        subtitle={formMode === "edit" ? formCopy.editSubtitle : formCopy.createSubtitle}
        fields={fields}
        initialData={selectedItem}
        onSubmit={submitForm}
        onClose={closeForm}
        submitting={submitting}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${formCopy.entityName}?`}
        message={deleteTarget ? `${deleteTarget.name || deleteTarget.variety} will not be deleted because the backend API is not available yet.` : ""}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
