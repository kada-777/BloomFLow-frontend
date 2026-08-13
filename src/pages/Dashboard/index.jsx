import { useOutletContext } from "react-router-dom";
import BranchSelector from "../../components/dashboard/BranchSelector";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import FlowerStatusPieChart from "../../components/dashboard/FlowerStatusPieChart";
import RecentActivityTable from "../../components/dashboard/RecentActivityTable";
import SummaryCards from "../../components/dashboard/SummaryCards";
import TopFlowerSalesChart from "../../components/dashboard/TopFlowerSalesChart";
import { useDashboard } from "../../hooks/useDashboard";
import DashboardRangeFilter from "../../components/dashboard/DashboardRangeFilter";
import {
  exportDashboardCsv,
  openDashboardReport,
} from "../../services/dashboardExport";

const roleCopy = {
  "Super Admin": [
    "Supply chain overview",
    "Live intelligence across your branch network",
  ],
  "Head Office": [
    "Warehouse command center",
    "Balance stock, plan distribution, and purchase with confidence",
  ],
  "Branch Staff": [
    "Branch operations",
    "Keep shelves fresh and fulfil local demand",
  ],
};

export default function Dashboard() {
  const { role } = useOutletContext();
  const [, subtitle] = roleCopy[role] || [
    "Account access",
    "Your assigned workspace",
  ];
  const {
    data,
    loading,
    error,
    resourceErrors,
    selectedBranch,
    setSelectedBranch,
    refresh,
    isBranchStaff,
    isHeadOffice,
    canSelectBranch,
    rangeDays,
    setRangeDays,
    period,
    setActivityPage,
  } = useDashboard();
  const title = "Welcome to BloomFlow🌷";

  return (
    <div className="dashboard-page">
      <DashboardHeader
        title={title}
        subtitle={subtitle}
      />
      <div className="dashboard-filter-row dashboard-period-filter-row">
        <DashboardRangeFilter
          value={rangeDays}
          onChange={setRangeDays}
          disabled={loading}
        />
        {canSelectBranch && (
          <BranchSelector
            branches={data.branches}
            selectedBranch={selectedBranch}
            onChange={setSelectedBranch}
            disabled={loading}
            loading={loading}
            error={resourceErrors.branches}
          />
        )}
        {period && (
          <div className="dashboard-export-actions">
            <button
              className="button"
              type="button"
              onClick={() =>
                openDashboardReport({ days: rangeDays, branch: selectedBranch, role })
              }
              disabled={loading}
            >
              Print / Save as PDF
            </button>
            <button
              className="button"
              type="button"
              onClick={() =>
                exportDashboardCsv({
                  period,
                  summary: data.summary,
                  activities: data.activities,
                  branchName: data.selectedBranchName,
                  role,
                })
              }
              disabled={loading}
            >
              Download CSV
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="dashboard-alert" role="alert">
          <span>{error}</span>
          <button className="text-button" type="button" onClick={refresh}>
            Retry
          </button>
        </div>
      )}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <SummaryCards
            summary={data.summary}
            resourceErrors={resourceErrors}
            onRetry={refresh}
            isBranchStaff={isBranchStaff}
            isHeadOffice={isHeadOffice}
          />
          <div className="dashboard-chart-grid">
            <FlowerStatusPieChart
              data={data.flowerStatus}
              loading={loading}
              error={resourceErrors.branchInventory}
              onRetry={refresh}
            />
            <TopFlowerSalesChart data={data.topFlowerSales} loading={loading} />
          </div>
          <RecentActivityTable
            activities={data.activities}
            loading={loading}
            error={resourceErrors.headOfficeDashboard || resourceErrors.dailySales || resourceErrors.receivings}
            onRetry={refresh}
            pagination={data.activitiesPagination}
            onPageChange={setActivityPage}
            paginationDisabled={loading}
            isHeadOffice={isHeadOffice}
          />
        </>
      )}
    </div>
  );
}
