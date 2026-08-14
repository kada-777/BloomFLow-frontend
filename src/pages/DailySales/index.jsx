import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import GenericDataTable from "../../components/common/GenericDataTable/GenericDataTable";
import Pagination from "../../components/common/Pagination/Pagination";
import DailySalesDetail from "../../components/daily-sales/DailySalesDetail";
import DailySalesForm from "../../components/daily-sales/DailySalesForm";
import useDailySales, { emptyDailySalesItem } from "../../hooks/useDailySales";
import { normalizeIntegerQuantity } from "../../utils/quantity";
import "./daily-sales.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

function formatQuantity(value) {
  return Number(normalizeIntegerQuantity(value)).toLocaleString("id-ID");
}

export default function DailySales() {
  const dailySales = useDailySales();

  const handleFormChange = (fieldOrIndex, valueOrField, itemValue) => {
    if (typeof fieldOrIndex === "number") {
      dailySales.setForm((current) => ({
        ...current,
        items: current.items.map((item, index) => (
          index === fieldOrIndex ? { ...item, [valueOrField]: itemValue } : item
        )),
      }));
      return;
    }

    dailySales.setForm((current) => ({ ...current, [fieldOrIndex]: valueOrField }));
  };

  const columns = [
    { key: "salesDate", label: "Date", render: (row) => formatDate(row.salesDate) },
    { key: "soldQuantity", label: "Sold Qty", render: (row) => formatQuantity(row.soldQuantity) },
    { key: "damagedQuantity", label: "Damaged Qty", render: (row) => formatQuantity(row.damagedQuantity) },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <button className="daily-sales-view-button" type="button" onClick={() => dailySales.openDetail(row.saleId)}>
          View Detail
        </button>
      ),
    },
  ];

  return (
    <div className="daily-sales-page">
      <header className="daily-sales-page-header">
        <div>
          <p className="daily-sales-page-eyebrow">BRANCH OPERATIONS</p>
          <h1>Most Recent Sales</h1>
          <p>Record and review daily flower sales for your branch.</p>
        </div>
        <button className="button" type="button" onClick={dailySales.openCreate}>Add Sales</button>
      </header>

      <label className="daily-sales-sort-field">
        <span>Sort Date</span>
        <select value={dailySales.sort} onChange={(event) => dailySales.setSort(event.target.value)}>
          <option value="default">Default</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </label>

      <ActionNotice message={dailySales.error} tone="error" onAction={dailySales.refresh} />
      <ActionNotice message={dailySales.successMessage} onClose={() => dailySales.setSuccessMessage("")} />

      <GenericDataTable
        columns={columns}
        data={dailySales.tableRows}
        loading={dailySales.loading}
        emptyMessage="No daily sales data available."
        className="daily-sales-table-card table-card"
        rowKey={(row) => row.rowId}
      />
      <Pagination pagination={dailySales.pagination} onPageChange={dailySales.setPage} disabled={dailySales.loading} />

      <DailySalesForm
        open={dailySales.formOpen}
        form={dailySales.form}
        flowers={dailySales.flowers}
        onChange={handleFormChange}
        onAddItem={() => dailySales.setForm((current) => ({ ...current, items: [...current.items, emptyDailySalesItem()] }))}
        onRemoveItem={(index) => dailySales.setForm((current) => ({
          ...current,
          items: current.items.filter((_, itemIndex) => itemIndex !== index),
        }))}
        onSubmit={dailySales.submitCreate}
        onClose={dailySales.closeCreate}
        submitting={dailySales.submitting}
        error={dailySales.formError}
      />

      <DailySalesDetail
        open={dailySales.detailOpen}
        detail={dailySales.detail}
        loading={dailySales.detailLoading}
        error={dailySales.detailError}
        onClose={dailySales.closeDetail}
      />
    </div>
  );
}
