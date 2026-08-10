import { useEffect, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";

function fieldError(errors, index, field) {
  return errors[`items.${index}.${field}`];
}

export default function DailySalesForm({
  open,
  form,
  flowers,
  onChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onClose,
  submitting,
  error,
}) {
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) setFieldErrors({});
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSubmit(form);
    setFieldErrors(result?.errors || {});
  };

  const updateItem = (index, field, value) => {
    onChange(index, field, value);
    setFieldErrors((current) => ({ ...current, [`items.${index}.${field}`]: "" }));
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="daily-sales-modal" role="dialog" aria-modal="true" aria-labelledby="daily-sales-form-title">
        <form onSubmit={handleSubmit} noValidate>
          <header className="daily-sales-modal-header">
            <div>
              <span className="daily-sales-eyebrow">BRANCH OPERATIONS</span>
              <h2 id="daily-sales-form-title">Add Sales</h2>
              <p>Catat penjualan bunga harian cabang.</p>
            </div>
            <button className="daily-sales-close" type="button" onClick={onClose} disabled={submitting} aria-label="Tutup Add Sales">
              <X size={20} />
            </button>
          </header>

          <div className="daily-sales-modal-body">
            {error && <div className="daily-sales-error" role="alert">{error}</div>}
            <label className="daily-sales-field daily-sales-date-field">
              <span>Tanggal Sales</span>
              <input
                type="date"
                value={form.salesDate}
                onChange={(event) => {
                  onChange("salesDate", event.target.value);
                  setFieldErrors((current) => ({ ...current, salesDate: "" }));
                }}
                disabled={submitting}
              />
              {fieldErrors.salesDate && <em>{fieldErrors.salesDate}</em>}
            </label>

            <div className="daily-sales-items-heading">
              <div><span>SALES ITEMS</span><h3>Detail penjualan bunga</h3></div>
              <button className="daily-sales-secondary-button" type="button" onClick={onAddItem} disabled={submitting} aria-label="Tambah flower item">
                <Plus size={16} /> Add Flower
              </button>
            </div>
            {fieldErrors.items && <div className="daily-sales-field-error" role="alert">{fieldErrors.items}</div>}

            {form.items.map((item, index) => (
              <section className="daily-sales-item-card" key={`${index}-${item.flowerId}`}>
                <header className="daily-sales-item-header">
                  <strong>FLOWER ITEM {index + 1}</strong>
                  {form.items.length > 1 && (
                    <button className="daily-sales-remove" type="button" onClick={() => onRemoveItem(index)} disabled={submitting} aria-label={`Hapus flower item ${index + 1}`}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </header>
                <div className="daily-sales-item-grid">
                  <label className="daily-sales-field">
                    <span>Flower</span>
                    <select value={item.flowerId} onChange={(event) => updateItem(index, "flowerId", event.target.value)} disabled={submitting}>
                      <option value="">Pilih flower</option>
                      {flowers.map((flower) => <option key={flower.id} value={flower.id}>{flower.name}{flower.variety ? ` · ${flower.variety}` : ""}</option>)}
                    </select>
                    {fieldError(fieldErrors, index, "flowerId") && <em>{fieldError(fieldErrors, index, "flowerId")}</em>}
                  </label>
                  <label className="daily-sales-field">
                    <span>Sold Qty</span>
                    <input type="number" min="0" step="0.01" value={item.soldQuantity} onChange={(event) => updateItem(index, "soldQuantity", event.target.value)} disabled={submitting} />
                    {fieldError(fieldErrors, index, "soldQuantity") && <em>{fieldError(fieldErrors, index, "soldQuantity")}</em>}
                  </label>
                  <label className="daily-sales-field">
                    <span>Damaged Qty</span>
                    <input type="number" min="0" step="0.01" value={item.damagedQuantity} onChange={(event) => updateItem(index, "damagedQuantity", event.target.value)} disabled={submitting} />
                    {fieldError(fieldErrors, index, "damagedQuantity") && <em>{fieldError(fieldErrors, index, "damagedQuantity")}</em>}
                  </label>
                </div>
              </section>
            ))}
          </div>

          <footer className="daily-sales-modal-footer">
            <button className="daily-sales-secondary-button" type="button" onClick={onClose} disabled={submitting}>Tutup</button>
            <button className="daily-sales-primary-button" type="submit" disabled={submitting}>
              <Save size={17} /> {submitting ? "Menyimpan..." : "Simpan Sales"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
