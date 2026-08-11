import { useEffect, useState } from "react";
import { Save, UserPlus, X } from "lucide-react";
import Modal from "../Modal/Modal";
import "./ResourceFormCard.css";

function createInitialValues(fields, initialData) {
  return fields.reduce((values, field) => {
    values[field.name] = initialData?.[field.name] ?? "";
    return values;
  }, {});
}

export default function ResourceFormCard({
  open,
  mode,
  title,
  subtitle,
  fields,
  initialData,
  onSubmit,
  onClose,
  submitting = false,
  error,
}) {
  const [values, setValues] = useState(() => createInitialValues(fields, initialData));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(createInitialValues(fields, initialData));
      setFieldErrors({});
    }
  }, [open, initialData]);

  const handleChange = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.required && !String(values[field.name] || "").trim()) {
        nextErrors[field.name] = `${field.label} wajib diisi.`;
      }
    });

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    onSubmit(values);
  };

  return (
    <Modal open={open} onClose={submitting ? undefined : onClose} labelledBy="resource-form-title">
      <form className="resource-form-card" onSubmit={handleSubmit} noValidate>
        <header className="resource-form-header">
          <div>
            <span className="resource-form-eyebrow">MASTER DATA</span>
            <h2 id="resource-form-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="resource-form-close" type="button" onClick={onClose} disabled={submitting} aria-label="Tutup dialog">
            <X size={20} />
          </button>
        </header>

        <div className={`resource-form-body ${fields.length === 2 ? "is-two-field" : ""}`}>
          {error && <div className="resource-form-error" role="alert">{error}</div>}
          {fields.map((field) => (
            <label className="resource-form-field" key={field.name}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select value={values[field.name]} onChange={(event) => handleChange(field.name, event.target.value)} disabled={submitting}>
                  <option value="">Pilih {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name]}
                  onChange={(event) => handleChange(field.name, event.target.value)}
                  disabled={submitting}
                  placeholder={field.placeholder}
                />
              )}
              {fieldErrors[field.name] && <em>{fieldErrors[field.name]}</em>}
            </label>
          ))}
        </div>

        <footer className="resource-form-footer">
          <button className="resource-form-secondary" type="button" onClick={onClose} disabled={submitting}>Batal</button>
          <button className="resource-form-primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : mode === "edit" ? <><Save size={17} /> Simpan Perubahan</> : <><UserPlus size={17} /> Tambah Data</>}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
