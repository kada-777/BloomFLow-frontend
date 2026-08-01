import { useState } from "react";
import { PageHeader, SearchBar, StatusBadge } from "../../components/ui";
import DataTable from "../../components/common/DataTable";
import { flowers } from "../../utils/data";
const columns = [
  { key: "name", label: "Flower", render: (x) => <b>{x.name}</b> },
  { key: "category", label: "Category" },
  {
    key: "stock",
    label: "Available stock",
    render: (x) => `${x.stock.toLocaleString()} stems`,
  },
  { key: "shelf", label: "FIFO shelf life" },
  { key: "expiry", label: "Expiry countdown" },
  {
    key: "status",
    label: "Status",
    render: (x) => <StatusBadge>{x.status}</StatusBadge>,
  },
];
export default function Inventory() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const data = flowers.filter(
    (x) =>
      (status === "All" || x.status === status) &&
      x.name.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="FIFO Inventory"
        subtitle="Freshness-first inventory across the entire network"
        action="+ Receive stock"
      />
      <div className="toolbar">
        <SearchBar value={q} onChange={setQ} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Healthy</option>
          <option>Warning</option>
          <option>Critical</option>
          <option>Expired</option>
        </select>
      </div>
      <DataTable
        columns={columns}
        rows={data}
        emptyMessage="No flowers match this filter."
      />
    </>
  );
}
