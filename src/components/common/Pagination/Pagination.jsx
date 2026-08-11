import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

export default function Pagination({ pagination, onPageChange, disabled = false }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination-button"
        type="button"
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={disabled || !pagination.hasPreviousPage}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="pagination-status">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        className="pagination-button"
        type="button"
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={disabled || !pagination.hasNextPage}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
