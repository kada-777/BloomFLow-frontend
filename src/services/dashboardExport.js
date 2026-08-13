function csvValue(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return [
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    date.getUTCFullYear(),
  ].join("-");
}

export function exportDashboardCsv(report) {
  const rows = [
    ["Period", `${report.period.days} days`],
    ["Role", report.role || "Dashboard"],
    ["Branch", report.branchName || "All Branches"],
    ["Date From", formatDate(report.period.dateFrom)],
    ["Date To", formatDate(report.period.dateTo)],
    [],
    ["Metric", "Value"],
    ...Object.entries(report.summary).map(([key, value]) => [key, value]),
    [],
    ["Activity", "Type", "Details", "Date"],
    ...report.activities.map((activity) => [activity.title, activity.type, activity.detail, formatDate(activity.date)]),
  ];
  const blob = new Blob([rows.map((row) => row.map(csvValue).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bloomflow-${String(report.role || "dashboard").toLowerCase().replaceAll(" ", "-")}-${report.period.days}d.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function openDashboardReport({ days, branch, role }) {
  const params = new URLSearchParams();
  if (Number.isFinite(days)) params.set("days", String(days));
  if (branch) params.set("branch", String(branch));
  if (role) params.set("role", String(role));
  const url = params.toString() ? `/dashboard/report?${params.toString()}` : "/dashboard/report";
  window.open(url, "_blank", "noopener,noreferrer");
}
