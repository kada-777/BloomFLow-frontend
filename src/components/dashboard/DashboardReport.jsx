import { Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import { exportDashboardCsv } from "../../services/dashboardExport";
import SummaryCards from "./SummaryCards";
import FlowerStatusPieChart from "./FlowerStatusPieChart";
import TopFlowerSalesChart from "./TopFlowerSalesChart";
import RecentActivityTable from "./RecentActivityTable";
import "./DashboardReport.css";

const DATE_OPTIONS = { dateStyle: "medium", timeZone: "UTC" };

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", DATE_OPTIONS).format(date);
}

export default function DashboardReport() {
  const { user, isRestoring } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    data,
    loading,
    error,
    resourceErrors,
    refresh,
    isBranchStaff,
    isHeadOffice,
    rangeDays,
    setRangeDays,
    selectedBranch,
    setSelectedBranch,
    period,
  } = useDashboard();

  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const days = Number(searchParams.get("days"));
    const branch = searchParams.get("branch");
    if (Number.isFinite(days) && days !== rangeDays) setRangeDays(days);
    if (branch && branch !== selectedBranch) setSelectedBranch(branch);
  }, [searchParams, rangeDays, selectedBranch, setRangeDays, setSelectedBranch]);

  const autoPrinted = useRef(false);
  useEffect(() => {
    if (autoPrinted.current) return;
    if (loading) return;
    if (!period) return;
    autoPrinted.current = true;
    const id = window.setTimeout(() => window.print(), 800);
    return () => window.clearTimeout(id);
  }, [loading, period]);

  if (isRestoring) return null;
  if (!user) return <Navigate to="/" replace />;

  const report = {
    period,
    rangeDays,
    selectedBranch,
    summary: data.summary,
    flowerStatus: data.flowerStatus,
    topFlowerSales: data.topFlowerSales,
    activities: data.activities,
    activitiesPagination: data.activitiesPagination,
    branchName: data.selectedBranchName,
    resourceErrors,
  };

  const handleCsv = () => exportDashboardCsv({ period, summary: data.summary, activities: data.activities, branchName: data.selectedBranchName });

  return (
    <div className="dashboard-report">
      <div className="dashboard-report-controls">
        <button className="button" type="button" onClick={() => window.print()}>Print report</button>
        <button className="button" type="button" onClick={handleCsv} disabled={loading || !period}>Download CSV</button>
      </div>
      <header className="dashboard-report-header">
        <p className="eyebrow">BloomFlow Operations</p>
        <h1>{isBranchStaff ? "Branch Report" : isHeadOffice ? "Head Office Report" : "Super Admin Report"}</h1>
        <span className="dashboard-report-subtitle">
          {report.branchName || "All Branches"} · Period: {report.rangeDays} days ({formatDate(report.period?.dateFrom)} to {formatDate(report.period?.dateTo)})
        </span>
      </header>
      {error && (
        <div className="dashboard-alert" role="alert">
          <span>{error}</span>
          <button className="text-button" type="button" onClick={refresh}>Retry</button>
        </div>
      )}
      <SummaryCards
        summary={report.summary}
        resourceErrors={resourceErrors}
        onRetry={refresh}
        isBranchStaff={isBranchStaff}
        isHeadOffice={isHeadOffice}
      />
      <div className="dashboard-chart-grid">
        <FlowerStatusPieChart data={report.flowerStatus} loading={loading} error={resourceErrors.branchInventory} onRetry={refresh} />
        <TopFlowerSalesChart data={report.topFlowerSales} loading={loading} />
      </div>
      <RecentActivityTable
        activities={report.activities}
        loading={loading}
        error={resourceErrors.dailySales || resourceErrors.receivings}
        onRetry={refresh}
        pagination={report.activitiesPagination}
        paginationDisabled={loading}
        isHeadOffice={isHeadOffice}
      />
    </div>
  );
}
