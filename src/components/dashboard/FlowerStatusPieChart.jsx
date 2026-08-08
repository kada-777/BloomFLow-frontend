import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import DashboardCard from "./DashboardCard";
import DashboardState from "./DashboardState";

export default function FlowerStatusPieChart({ data, loading, error, onRetry }) {
  const hasValues = data.some((entry) => entry.value > 0);

  return (
    <DashboardCard title="Flower Status" subtitle="Current branch inventory by quality">
      {loading ? (
        <DashboardState type="loading" message="Loading flower status..." />
      ) : error ? (
        <DashboardState type="error" message={error} onRetry={onRetry} />
      ) : !hasValues ? (
        <DashboardState type="empty" message="No branch inventory available." />
      ) : (
        <div className="dashboard-chart dashboard-pie-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="78%" paddingAngle={3}>
                {data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}
