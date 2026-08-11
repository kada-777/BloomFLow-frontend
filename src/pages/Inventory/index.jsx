import { useState } from "react";
import { Eye } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { PageHeader, SearchBar } from "../../components/ui";
import DataTable from "../../components/common/DataTable";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import Pagination from "../../components/common/Pagination/Pagination";
import BatchDetail from "./BatchDetail";
import useBranchInventory from "../../hooks/useBranchInventory";
import "./inventory.css";

function formatQuantity(value) {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export default function Inventory() {
  const { role } = useOutletContext();
  const [q, setQ] = useState("");
  const [selectedFlowerId, setSelectedFlowerId] = useState(null);
  const inventory = useBranchInventory();
  const query = q.trim().toLowerCase();
  const rows = inventory.rows.filter((row) => {
    if (!query) return true;
    return row.flowerName.toLowerCase().includes(query)
      || String(row.flowerId).includes(query)
      || String(row.variety || "").toLowerCase().includes(query);
  });

  const columns = [
    {
      key: "variety",
      label: "Variety",
      render: (row) => <b>{row.variety || row.flowerName}</b>,
    },
    { key: "fresh", label: "Fresh", render: (row) => formatQuantity(row.fresh) },
    { key: "gradeC", label: "Grade C", render: (row) => formatQuantity(row.gradeC) },
    { key: "damaged", label: "Damaged", render: (row) => formatQuantity(row.damaged) },
    { key: "available", label: "Available", render: (row) => formatQuantity(row.available) },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button
          className="inventory-detail-button"
          type="button"
          onClick={() => setSelectedFlowerId(row.flowerId)}
        >
          <Eye size={15} /> View Detail
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Branch Inventory"
        subtitle="Freshness-first stock for your branch"
      />
      <ActionNotice message={inventory.error} tone="error" onAction={inventory.refresh} />
      <div className="toolbar">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={role === "Branch Staff" ? "Search flowers" : undefined}
        />
        <label className="inventory-sort-field">
          <span>Sort Flower</span>
          <select value={inventory.sort} onChange={(event) => inventory.setSort(event.target.value)}>
            <option value="default">Default</option>
            <option value="flower_asc">Flower A-Z</option>
            <option value="flower_desc">Flower Z-A</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        emptyMessage={inventory.loading ? "Loading branch inventory..." : "No branch inventory found."}
      />
      <Pagination pagination={inventory.pagination} onPageChange={inventory.setPage} disabled={inventory.loading} />
      <BatchDetail
        flowerId={selectedFlowerId}
        open={selectedFlowerId !== null}
        onClose={() => setSelectedFlowerId(null)}
      />
    </>
  );
}
