import { X } from "lucide-react";
import "./ActionNotice.css";

export default function ActionNotice({ message, tone = "info", onClose, onAction, actionLabel = "Coba lagi" }) {
  if (!message) return null;

  return (
    <div className={`action-notice action-notice-${tone}`} role="status">
      <span>{message}</span>
      <div className="action-notice-actions">
        {onAction && <button className="action-notice-action" type="button" onClick={onAction}>{actionLabel}</button>}
        {onClose && <button className="action-notice-close" type="button" onClick={onClose} aria-label="Tutup notifikasi"><X size={16} /></button>}
      </div>
    </div>
  );
}
