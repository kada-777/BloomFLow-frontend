import { Pencil, Trash2 } from "lucide-react";
import "./ActionButtons.css";

export default function ActionButtons({ onEdit, onDelete, deleteDisabled = false }) {
  return (
    <div className="action-buttons generic-action-buttons">
      <button className="edit-btn" type="button" onClick={onEdit}>
        <Pencil size={16} /> Edit
      </button>
      {onDelete && (
        <button className="delete-btn" type="button" onClick={onDelete} disabled={deleteDisabled}>
          <Trash2 size={16} /> Delete
        </button>
      )}
    </div>
  );
}
