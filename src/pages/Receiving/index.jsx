import { Eye, Plus } from "lucide-react";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import GenericDataTable from "../../components/common/GenericDataTable/GenericDataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import ReceivingFormCard from "../../components/receiving/ReceivingFormCard/ReceivingFormCard";
import useReceiving from "../../hooks/useReceiving";
import "./receiving.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function Receiving() {
  const receiving = useReceiving();

  const columns = [
    { key: "id", label: "RECEIVING ID", render: (item) => <strong>REC-{item.id}</strong> },
    { key: "receivedDate", label: "RECEIVED DATE", render: (item) => formatDate(item.receivedDate) },
    {
      key: "farm",
      label: "FARM",
      render: (item) => {
        const farmLabel = item.farm?.name || `Farm #${item.farmId}`;
        return <span className="receiving-truncated" title={farmLabel}>{farmLabel}</span>;
      },
    },
    {
      key: "flowerSummary",
      label: "FLOWER",
      render: (item) => {
        const count = item._count?.items;
        const summary = count ? `${count} flower type${count === 1 ? "" : "s"}` : "-";
        return <span className="receiving-truncated" title={summary}>{summary}</span>;
      },
    },
  ];

  return (
    <div className="receiving-page">
      <header className="receiving-page-header">
        <div>
          <p className="receiving-page-eyebrow">HEAD OFFICE OPERATIONS</p>
          <h1>Receiving & Quality Control</h1>
          <p>Record flower receipts from farms and complete Head Office quality control.</p>
        </div>
        <button className="receiving-new-button" type="button" onClick={receiving.openCreate}>
          <Plus size={18} /> New Receiving
        </button>
      </header>

      <div className="receiving-filter-card">
        <SearchBar value={receiving.searchTerm} onChange={receiving.setSearchTerm} placeholder="Search ID, farm, or farm ID..." ariaLabel="Search receiving" />
        <label className="receiving-filter-field">
          <span>Date</span>
          <input type="date" value={receiving.selectedDate} onChange={(event) => receiving.setSelectedDate(event.target.value)} />
        </label>
        <label className="receiving-filter-field">
          <span>Farm</span>
          <select value={receiving.selectedFarm} onChange={(event) => receiving.setSelectedFarm(event.target.value)}>
            <option value="all">All Farms</option>
            {receiving.farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
          </select>
        </label>
      </div>

      <ActionNotice message={receiving.error} tone="error" onAction={receiving.refresh} />
      <ActionNotice message={receiving.successMessage} onClose={() => receiving.setSuccessMessage("")} />

      <GenericDataTable
        columns={columns}
        data={receiving.receivings}
        loading={receiving.loading}
        emptyMessage="No matching receiving records found."
        className="receiving-table-card table-card"
        renderActions={(item) => (
          <button className="receiving-view-button" type="button" onClick={() => receiving.openDetail(item.id)}>
            <Eye size={16} /> View Detail
          </button>
        )}
      />
      <Pagination pagination={receiving.pagination} onPageChange={receiving.setPage} disabled={receiving.loading} />

      <ReceivingFormCard
        open={receiving.formOpen}
        mode={receiving.formMode}
        receiving={receiving.detail}
        farms={receiving.farms}
        flowers={receiving.flowers}
        onSubmit={receiving.submitCreate}
        onClose={receiving.closeForm}
        submitting={receiving.submitting}
        error={receiving.formError}
        detailLoading={receiving.detailLoading}
        detailError={receiving.detailError}
      />
    </div>
  );
}
