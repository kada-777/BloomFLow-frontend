export default function DashboardState({ type = "empty", message, onRetry }) {
  const defaultMessage = type === "unsupported"
    ? "Awaiting backend support"
    : type === "error"
      ? "Unable to load this data."
      : "No data available yet.";

  return (
    <div className={`dashboard-state dashboard-state-${type}`}>
      <p>{message || defaultMessage}</p>
      {onRetry && (
        <button className="text-button" type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
