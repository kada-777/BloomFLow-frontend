import { useOutletContext } from "react-router-dom";
import BranchSelector from "../../components/dashboard/BranchSelector";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSkeleton from "../../components/dashboard/DashboardSkeleton";
import FlowerStatusPieChart from "../../components/dashboard/FlowerStatusPieChart";
import RecentActivityTable from "../../components/dashboard/RecentActivityTable";
import SummaryCards from "../../components/dashboard/SummaryCards";
import TopFlowerSalesChart from "../../components/dashboard/TopFlowerSalesChart";
import { useDashboard } from "../../hooks/useDashboard";

const roleCopy = {
  "Super Admin": ["Supply chain overview", "Live intelligence across your branch network"],
  "Head Office": ["Warehouse command center", "Balance stock, plan distribution, and purchase with confidence"],
  "Branch Staff": ["Branch operations", "Keep shelves fresh and fulfil local demand"],
};

export default function Dashboard() {
  const { role } = useOutletContext();
  const [, subtitle] =
    roleCopy[role] || ["Account access", "Your assigned workspace"];
  const {
    data,
    loading,
    error,
    resourceErrors,
    selectedBranch,
    setSelectedBranch,
    refresh,
    isBranchStaff,
  } = useDashboard();
  const title = "Welcome to BloomFlow🌷";

  return (
    <div className="dashboard-page">
      <DashboardHeader title={title} subtitle={subtitle} />
      {error && (
        <div className="dashboard-alert" role="alert">
          <span>{error}</span>
          <button className="text-button" type="button" onClick={refresh}>Retry</button>
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
          />
          {!isBranchStaff && (
            <div className="dashboard-filter-row">
              <BranchSelector
                branches={data.branches}
                selectedBranch={selectedBranch}
                onChange={setSelectedBranch}
                disabled={isBranchStaff}
                loading={loading}
                error={resourceErrors.branches}
              />
            </div>
          )}
          <div className="dashboard-chart-grid">
            <FlowerStatusPieChart
              data={data.flowerStatus}
              loading={loading}
              error={resourceErrors.branchInventory}
              onRetry={refresh}
            />
            <TopFlowerSalesChart loading={loading} />
          </div>
          <RecentActivityTable
            activities={data.activities}
            loading={loading}
            error={resourceErrors.dailySales || resourceErrors.receivings}
            onRetry={refresh}
          />
        </>
      )}
    </div>
  );
}
