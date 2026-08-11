import { useEffect } from "react";
import "./Modal.css";

export default function Modal({
  open,
  onClose,
  children,
  labelledBy = "modal-title",
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayMouseDown = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
  };

return (
  <div
    className="modal-overlay"
    onMouseDown={handleOverlayMouseDown}
  >
    <section
      className="modal-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {children}
    </section>
  </div>
);
}
