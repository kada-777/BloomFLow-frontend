export default function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="Loading dashboard">
      <div className="dashboard-skeleton-summary">
        {Array.from({ length: 6 }, (_, index) => <span key={index} />)}
      </div>
      <div className="dashboard-skeleton-grid">
        <span />
        <span />
      </div>
    </div>
  );
}
