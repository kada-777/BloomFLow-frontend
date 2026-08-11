import { AlertTriangle, Trash2, X } from "lucide-react";
import Modal from "../Modal/Modal";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
  submitting = false,
}) {
  return (
    <Modal open={open} onClose={submitting ? undefined : onCancel} labelledBy="confirm-dialog-title">
      <section className="confirm-dialog-card">
        <button className="confirm-dialog-close" type="button" onClick={onCancel} disabled={submitting} aria-label="Tutup dialog">
          <X size={18} />
        </button>
        <div className={`confirm-dialog-icon ${danger ? "is-danger" : ""}`}>
          {danger ? <Trash2 size={25} /> : <AlertTriangle size={25} />}
        </div>
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog-actions">
          <button className="confirm-dialog-cancel" type="button" onClick={onCancel} disabled={submitting}>{cancelText}</button>
          <button className={`confirm-dialog-confirm ${danger ? "is-danger" : ""}`} type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Memproses..." : confirmText}
          </button>
        </div>
      </section>
    </Modal>
  );
}
