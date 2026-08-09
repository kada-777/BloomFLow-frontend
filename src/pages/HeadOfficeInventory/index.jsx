import { PackageCheck } from "lucide-react";
import { PageHeader, StatisticCard } from "../../components/ui";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import GenericDataTable from "../../components/common/GenericDataTable/GenericDataTable";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import useHeadOfficeInventory from "../../hooks/useHeadOfficeInventory";
import "./head-office-inventory.css";

const unavailable = <span className="inventory-unavailable">Data belum tersedia</span>;

export default function HeadOfficeInventory() {
  const inventory = useHeadOfficeInventory();

  const columns = [
    { key: "batchNumber", label: "BATCH NUMBER", render: () => unavailable },
    {
      key: "flowerName",
      label: "FLOWER",
      render: (row) => (
        <div className="inventory-flower-cell" title={`${row.flowerName || "-"}${row.variety ? ` · ${row.variety}` : ""}`}>
          <strong>{row.flowerName || "-"}</strong>
          {row.variety && <small>{row.variety}</small>}
        </div>
      ),
    },
    { key: "farm", label: "FARM", render: () => unavailable },
    { key: "receivedDate", label: "RECEIVED DATE", render: () => unavailable },
    { key: "initialQuantity", label: "INITIAL QUANTITY", render: () => unavailable },
    { key: "totalAvailable", label: "AVAILABLE QUANTITY", render: (row) => Number(row.totalAvailable || 0).toLocaleString("en-US") },
    { key: "usedQuantity", label: "USED QUANTITY", render: () => unavailable },
    { key: "status", label: "STATUS", render: () => unavailable },
  ];

  return (
    <div className="head-office-inventory-page">
      <PageHeader title="Head Office Inventory" subtitle="Monitor available stock batches at Head Office" />

      <section className="inventory-summary-grid" aria-label="Inventory summary">
        <StatisticCard label="Total Available Stock" value={inventory.totalAvailableStock.toLocaleString("en-US")} note="From available inventory API" tone="rose" />
        <StatisticCard label="Total Batches" value="Data belum tersedia" note="Batch detail is not exposed by API" tone="sage" />
        <StatisticCard label="Depleted Batches" value="Data belum tersedia" note="Depleted records are not exposed by API" tone="amber" />
        <StatisticCard label="Utilization Rate" value="Data belum tersedia" note="Requires initial and available batch quantities" tone="rose" />
      </section>

      <section className="inventory-toolbar" aria-label="Inventory filters">
        <SearchBar value={inventory.searchTerm} onChange={inventory.setSearchTerm} placeholder="Search flower or variety..." ariaLabel="Search inventory" />
        <label className="inventory-status-filter">
          <span>Status</span>
          <select value={inventory.statusFilter} onChange={(event) => inventory.setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="depleted">Depleted</option>
          </select>
        </label>
      </section>

      {inventory.error && <ActionNotice message={inventory.error} tone="error" onAction={inventory.refresh} />}
      {inventory.isDepletedUnavailable && <div className="inventory-unavailable-note"><PackageCheck size={16} /> Depleted data belum tersedia dari API inventory saat ini.</div>}

      <GenericDataTable
        columns={columns}
        data={inventory.filteredRows}
        loading={inventory.loading}
        emptyMessage={inventory.isDepletedUnavailable ? "Data belum tersedia untuk status Depleted." : "Belum ada inventory yang cocok."}
        className="inventory-table-card table-card"
      />
    </div>
  );
}
