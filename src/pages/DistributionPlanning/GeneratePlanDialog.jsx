import { Sparkles, X } from "lucide-react";
import Modal from "../../components/common/Modal/Modal";
import { formatPlanningDate } from "./planningDate";
import "./generate-plan-dialog.css";

export default function GeneratePlanDialog({
  open,
  planningDate,
  cutoffDate,
  horizon,
  submitting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onCancel}
      labelledBy="generate-plan-dialog-title"
    >
      <section className="generate-plan-dialog-card">
        <button
          className="generate-plan-dialog-close"
          type="button"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Tutup dialog"
        >
          <X size={18} />
        </button>
        <div className="generate-plan-dialog-icon">
          <Sparkles size={25} />
        </div>
        <h2 id="generate-plan-dialog-title">Buat Distribution Plan?</h2>
        <dl className="generate-plan-dialog-meta">
          <div>
            <dt>Planning Date</dt>
            <dd>{formatPlanningDate(planningDate)}</dd>
          </div>
          <div>
            <dt>Cutoff Daily Sales</dt>
            <dd>{formatPlanningDate(cutoffDate)}</dd>
          </div>
          <div>
            <dt>Forecast Horizon</dt>
            <dd>Hari ke-{horizon}</dd>
          </div>
        </dl>
        <div className="generate-plan-dialog-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>
            Batalkan
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Membuat Plan..." : "Buat Plan"}
          </button>
        </div>
      </section>
    </Modal>
  );
}
