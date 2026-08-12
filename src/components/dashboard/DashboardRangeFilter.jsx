export default function DashboardRangeFilter({ value, onChange, disabled }) {
  return (
    <label className="dashboard-range-filter">
      <span>Period</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))} disabled={disabled}>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="60">Last 60 days</option>
      </select>
    </label>
  );
}
