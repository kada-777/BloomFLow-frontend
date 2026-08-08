import DashboardCard from "./DashboardCard";
import DashboardState from "./DashboardState";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DistributionStatusChart({ data, loading, error, onRetry }) {
  return (
    <DashboardCard title="Distribution Status" subtitle="Current distribution orders">
      {loading ? <DashboardState type="loading" message="Loading distribution status..." /> : error ? <DashboardState type="error" message={error} onRetry={onRetry} /> : Array.isArray(data) && data.length > 0 ? (
        <div className="dashboard-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" stroke="var(--muted)" />
              <YAxis allowDecimals={false} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="count" fill="var(--sage)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <DashboardState type="unsupported" />}
    </DashboardCard>
  );
}
