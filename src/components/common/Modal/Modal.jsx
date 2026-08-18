import { useEffect, useRef } from "react";
import "./Modal.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    const styles = window.getComputedStyle(element);
    return (
      !element.matches(":disabled") &&
      element.tabIndex >= 0 &&
      element.getClientRects().length > 0 &&
      styles.display !== "none" &&
      styles.visibility !== "hidden"
    );
  });
}

export default function Modal({
  open,
  onClose,
  children,
  labelledBy = "modal-title",
  closeOnOverlay = true,
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableElements = getFocusableElements(dialog);
    (focusableElements[0] || dialog).focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const currentFocusableElements = getFocusableElements(dialog);
      if (!currentFocusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements.at(-1);
      const activeElementIndex = currentFocusableElements.indexOf(
        document.activeElement,
      );
      if (event.shiftKey && activeElementIndex <= 0) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElementIndex === -1 ||
          activeElementIndex === currentFocusableElements.length - 1)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayMouseDown = (event) => {
    if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
  };

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <section
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}
