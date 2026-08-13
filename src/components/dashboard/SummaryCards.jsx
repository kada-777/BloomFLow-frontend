import { Boxes, Building2, Flower2, PackageCheck, Sprout, TrendingDown } from "lucide-react";
import SummaryCard from "./SummaryCard";

const formatNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US") : null;
};

function BranchStockOutDetails({ summary }) {
  return (
    <div className="dashboard-summary-breakdown">
      <span>Sells: {formatNumber(summary.branchSoldOut) ?? "-"}</span>
      <span>Damaged: {formatNumber(summary.branchDamagedOut) ?? "-"}</span>
    </div>
  );
}

export default function SummaryCards({ summary, resourceErrors, onRetry, isBranchStaff, isHeadOffice }) {
  const cards = [
    { key: "branches", label: "Total Branches", value: formatNumber(summary.totalBranches), icon: Building2, error: resourceErrors.branches },
    { key: "farms", label: "Total Farms", value: formatNumber(summary.totalFarms), icon: Sprout, error: resourceErrors.farms },
    { key: "headOfficeStock", label: "Head Office Stock", value: formatNumber(summary.headOfficeStock), icon: PackageCheck, error: resourceErrors.headOfficeInventory },
    { key: "branchStockActivity", label: "Branch Stock Activity", value: formatNumber(summary.totalBranchNetStockActivity), icon: Boxes, error: resourceErrors.branchInventory },
    { key: "branchStock", label: "Currently Stock", value: formatNumber(summary.totalBranchStock), icon: Boxes, error: resourceErrors.branchInventory },
    { key: "branchReceived", label: "Received Stock", value: formatNumber(summary.branchStockReceived), icon: PackageCheck, error: resourceErrors.headOfficeDashboard || resourceErrors.branchInventory },
    { key: "branchStockOut", label: "Stock Out", value: formatNumber(summary.branchStockOut), details: <BranchStockOutDetails summary={summary} />, icon: TrendingDown, error: resourceErrors.headOfficeDashboard || resourceErrors.branchInventory },
    { key: "headOfficeReceived", label: "Received Stock", value: formatNumber(summary.headOfficeReceivedStock), icon: PackageCheck, error: resourceErrors.headOfficeDashboard },
    { key: "headOfficeStockOut", label: "Stock Out", value: formatNumber(summary.headOfficeStockOut), icon: TrendingDown, error: resourceErrors.headOfficeDashboard },
    { key: "headOfficeDamaged", label: "Damaged Stock", value: formatNumber(summary.headOfficeDamagedStock), icon: Flower2, error: resourceErrors.headOfficeDashboard },
    { key: "inTransit", label: "Flowers In Transit", value: formatNumber(summary.flowersInTransit), icon: Flower2 },
  ];
  const visibleCards = isBranchStaff
    ? cards.filter((card) => ["branchReceived", "branchStockOut", "branchStock", "inTransit"].includes(card.key))
    : isHeadOffice
      ? cards.filter((card) => ["branches", "farms", "headOfficeStock", "branchStock", "headOfficeReceived", "headOfficeStockOut", "headOfficeDamaged"].includes(card.key))
      : cards.filter((card) => !["inTransit", "branchStock", "branchReceived", "branchStockOut", "headOfficeReceived", "headOfficeStockOut", "headOfficeDamaged"].includes(card.key));

  return (
    <section className={`dashboard-summary-grid${isBranchStaff ? " branch-staff" : isHeadOffice ? " head-office" : ""}`} aria-label="Dashboard summary">
      {visibleCards.map((card) => (
        <SummaryCard key={card.label} {...card} onRetry={onRetry} />
      ))}
    </section>
  );
}
