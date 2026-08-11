import { motion } from "framer-motion";
import DashboardState from "./DashboardState";

export default function SummaryCard({ label, value, note, icon: Icon, unsupported, error, onRetry }) {
  return (
    <motion.article whileHover={{ y: -3 }} className="dashboard-summary-card">
      <div className="dashboard-summary-icon">{Icon && <Icon size={18} />}</div>
      <p>{label}</p>
      {unsupported || error ? (
        <DashboardState
          type={unsupported ? "unsupported" : "error"}
          message={unsupported ? "Awaiting backend support" : "Unable to load"}
          onRetry={onRetry}
        />
      ) : (
        <>
          <h2>{value ?? "-"}</h2>
          {note && <small>{note}</small>}
        </>
      )}
    </motion.article>
  );
}
