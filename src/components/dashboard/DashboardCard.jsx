export default function DashboardCard({ title, subtitle, action, className = "", children }) {
  return (
    <section className={`dashboard-card ${className}`}>
      {(title || subtitle || action) && (
        <header className="dashboard-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
