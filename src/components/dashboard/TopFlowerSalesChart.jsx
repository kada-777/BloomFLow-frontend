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

export default function TopFlowerSalesChart({ data, loading, error, onRetry }) {
  return (
    <DashboardCard title="Top Flower Sales" subtitle="Best-selling flowers">
      {loading ? <DashboardState type="loading" message="Loading top sales..." /> : error ? <DashboardState type="error" message={error} onRetry={onRetry} /> : Array.isArray(data) && data.length > 0 ? (
        <div className="dashboard-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted)" />
              <YAxis dataKey="flowerName" type="category" width={90} stroke="var(--muted)" />
              <Tooltip />
              <Bar dataKey="soldQuantity" fill="var(--accent)" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <DashboardState type="unsupported" />}
    </DashboardCard>
  );
}
