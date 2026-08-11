import { useEffect, useState } from "react";
import { CalendarDays, Plus, Save, X } from "lucide-react";
import { emptyReceivingForm, emptyReceivingItem, validateReceivingForm } from "../../../hooks/useReceiving";
import Modal from "../../common/Modal/Modal";
import FlowerItemCard from "../FlowerItemCard/FlowerItemCard";
import "./ReceivingFormCard.css";

function toFormData(data) {
  if (!data) return emptyReceivingForm();
  return {
    farmId: String(data.farmId || ""),
    receivedDate: String(data.receivedDate || "").slice(0, 10),
    items: (data.items || []).map((item) => ({
      ...item,
      flowerId: String(item.flowerId || ""),
      shippedQuantity: String(item.shippedQuantity ?? ""),
      actualReceivedQuantity: String(item.actualReceivedQuantity ?? ""),
      acceptedQuantity: String(item.acceptedQuantity ?? ""),
      unusableQuantity: String(item.unusableQuantity ?? ""),
      unusableNotes: item.unusableNotes || "",
    })),
  };
}

export default function ReceivingFormCard({
  open,
  mode,
  receiving,
  farms,
  flowers,
  onSubmit,
  onClose,
  submitting,
  error,
  detailLoading,
  detailError,
}) {
  const [form, setForm] = useState(() => toFormData(receiving));
  const [fieldErrors, setFieldErrors] = useState({});
  const readOnly = mode === "view";

  useEffect(() => {
    if (open) {
      setForm(toFormData(receiving));
      setFieldErrors({});
    }
  }, [open, receiving]);

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
    setFieldErrors((current) => ({ ...current, [`items.${index}.${field}`]: "" }));
  };

  const addItem = () => setForm((current) => ({ ...current, items: [...current.items, emptyReceivingItem()] }));
  const removeItem = (index) => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateReceivingForm(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    const result = await onSubmit(form);
    if (result?.errors) setFieldErrors(result.errors);
  };

  const title = mode === "view" ? "Detail Receiving" : mode === "edit" ? "Edit Receiving" : "New Receiving";
  const subtitle = mode === "view" ? "Review receiving dan hasil quality control" : "Catat penerimaan bunga dan hasil quality control Head Office";

  return (
    <Modal open={open} onClose={submitting ? undefined : onClose} labelledBy="receiving-form-title">
      <form className="receiving-form-card" onSubmit={handleSubmit} noValidate>
        <header className="receiving-form-header">
          <div>
            <span className="receiving-form-eyebrow">RECEIVING & QUALITY CONTROL</span>
            <h2 id="receiving-form-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="receiving-form-close" type="button" onClick={onClose} disabled={submitting} aria-label="Tutup form receiving"><X size={20} /></button>
        </header>

        <div className="receiving-form-body">
          {(error || detailError) && <div className="receiving-form-error" role="alert">{error || detailError}</div>}
          {detailLoading ? (
            <div className="receiving-form-state">Memuat detail receiving...</div>
          ) : (
            <>
              <div className="receiving-form-meta">
                <label>
                  <span>Receiving ID</span>
                  <div className="receiving-readonly-value">{receiving?.id ? `REC-${receiving.id}` : "Generated after submit"}</div>
                </label>
                <label>
                  <span><CalendarDays size={15} /> Tanggal Diterima</span>
                  <input type="date" value={form.receivedDate} onChange={(event) => setForm((current) => ({ ...current, receivedDate: event.target.value }))} disabled={readOnly || submitting} />
                  {fieldErrors.receivedDate && <em>{fieldErrors.receivedDate}</em>}
                </label>
                <label>
                  <span>Farm</span>
                  {readOnly ? <div className="receiving-readonly-value">{receiving?.farm?.name || form.farmId || "-"}</div> : (
                    <select value={form.farmId} onChange={(event) => setForm((current) => ({ ...current, farmId: event.target.value }))} disabled={submitting}>
                      <option value="">Pilih farm</option>
                      {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name} · {farm.location}</option>)}
                    </select>
                  )}
                  {fieldErrors.farmId && <em>{fieldErrors.farmId}</em>}
                </label>
              </div>

              <div className="receiving-items-heading">
                <div><span>FLOWER ITEMS</span><h3>Detail bunga dan hasil QC</h3></div>
                {!readOnly && <button className="receiving-add-item" type="button" onClick={addItem}><Plus size={16} /> Tambah Jenis Bunga</button>}
              </div>

              {form.items.map((item, index) => (
                <FlowerItemCard
                  key={`${index}-${item.flowerId}`}
                  index={index}
                  item={item}
                  flowers={flowers}
                  errors={fieldErrors}
                  readOnly={readOnly}
                  canRemove={!readOnly && form.items.length > 1}
                  onChange={(field, value) => updateItem(index, field, value)}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </>
          )}
        </div>

        <footer className="receiving-form-footer">
          <button className="receiving-secondary-button" type="button" onClick={onClose} disabled={submitting}>Tutup</button>
          {!readOnly && <button className="receiving-primary-button" type="submit" disabled={submitting || detailLoading}>{submitting ? "Menyimpan..." : <><Save size={17} /> Submit Receiving</>}</button>}
        </footer>
      </form>
    </Modal>
  );
}
