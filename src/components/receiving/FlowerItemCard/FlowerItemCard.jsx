import { Trash2 } from "lucide-react";
import "./FlowerItemCard.css";

const fields = [
  ["shippedQuantity", "Shipped Quantity"],
  ["actualReceivedQuantity", "Actual Received Quantity"],
  ["acceptedQuantity", "Accepted Quantity"],
  ["unusableQuantity", "Unusable Quantity"],
];

export default function FlowerItemCard({ index, item, flowers, errors = {}, readOnly, canRemove, onChange, onRemove }) {
  const itemError = (field) => errors[`items.${index}.${field}`];

  return (
    <section className="flower-item-card">
      <header className="flower-item-header">
        <div>
          <span>FLOWER ITEM {index + 1}</span>
          <h3>Detail bunga dan hasil QC</h3>
        </div>
        {canRemove && (
          <button className="flower-item-remove" type="button" onClick={onRemove} disabled={readOnly} aria-label={`Hapus flower item ${index + 1}`}>
            <Trash2 size={17} />
          </button>
        )}
      </header>

      <div className="flower-item-grid">
        <label className="flower-item-field flower-item-field-wide">
          <span>{readOnly ? "Variety" : "Flower"}</span>
          {readOnly ? (
            <div className="flower-item-readonly">{item.flower?.variety || item.flower?.name || item.flowerName || item.flowerId || "-"}</div>
          ) : (
            <select value={item.flowerId} onChange={(event) => onChange("flowerId", event.target.value)}>
              <option value="">Pilih flower</option>
              {flowers.map((flower) => <option key={flower.id} value={flower.id}>{flower.name} · {flower.variety}</option>)}
            </select>
          )}
          {itemError("flowerId") && <em>{itemError("flowerId")}</em>}
        </label>

        {fields.map(([name, label]) => (
          <label className="flower-item-field" key={name}>
            <span>{label}</span>
            {readOnly ? (
              <div className="flower-item-readonly">{item[name] ?? "-"}</div>
            ) : (
              <input type="number" min="0" step="0.01" value={item[name]} onChange={(event) => onChange(name, event.target.value)} />
            )}
            {itemError(name) && <em>{itemError(name)}</em>}
          </label>
        ))}

        <label className="flower-item-field flower-item-field-wide">
          <span>Unusable Notes</span>
          {readOnly ? (
            <div className="flower-item-readonly flower-item-notes">{item.unusableNotes || "-"}</div>
          ) : (
            <textarea value={item.unusableNotes} onChange={(event) => onChange("unusableNotes", event.target.value)} placeholder="Catatan kerusakan atau hasil QC" rows="3" />
          )}
        </label>
      </div>
    </section>
  );
}
