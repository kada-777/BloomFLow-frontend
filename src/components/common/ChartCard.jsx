export default function ChartCard({
  title,
  subtitle,
  metric,
  className = "",
  children,
}) {
  return (
    <article className={`chart-card ${className}`}>
      <div className="card-title">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {metric && <span className="metric">{metric}</span>}
      </div>
      {children}
    </article>
  );
}
