import DashboardCard from "./DashboardCard";
import DashboardState from "./DashboardState";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default function RecentActivityTable({ activities, loading, error, onRetry }) {
  return (
    <DashboardCard title="Recent Activities" subtitle="Latest receiving and daily sales activity" className="dashboard-activity-card">
      {loading ? (
        <DashboardState type="loading" message="Loading recent activities..." />
      ) : error ? (
        <DashboardState type="error" message={error} onRetry={onRetry} />
      ) : activities.length === 0 ? (
        <DashboardState type="empty" message="No recent activities available." />
      ) : (
        <div className="dashboard-table-wrap">
          <table>
            <thead>
              <tr><th>Activity</th><th>Details</th><th>Date</th></tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td><b>{activity.title}</b><small>{activity.type}</small></td>
                  <td>{activity.detail}</td>
                  <td>{formatDate(activity.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
