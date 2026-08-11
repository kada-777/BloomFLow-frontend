import DashboardCard from "./DashboardCard";
import DashboardState from "./DashboardState";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function RevenueChart({ data, loading, error, onRetry }) {
  return (
    <DashboardCard title="Monthly Revenue" subtitle="Revenue trend over time">
      {loading ? <DashboardState type="loading" message="Loading revenue..." /> : error ? <DashboardState type="error" message={error} onRetry={onRetry} /> : Array.isArray(data) && data.length > 0 ? (
        <div className="dashboard-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted)" />
              <YAxis stroke="var(--muted)" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <DashboardState type="unsupported" />}
    </DashboardCard>
  );
}
