import { Boxes, Building2, Flower2, Leaf, PackageCheck, Sprout } from "lucide-react";
import SummaryCard from "./SummaryCard";

const formatNumber = (value) => (value === null ? null : value.toLocaleString("en-US"));

export default function SummaryCards({ summary, resourceErrors, onRetry, isBranchStaff, isHeadOffice }) {
  const cards = [
    { label: "Total Branches", value: formatNumber(summary.totalBranches), icon: Building2, error: resourceErrors.branches },
    { label: "Total Farms", value: formatNumber(summary.totalFarms), icon: Sprout, error: resourceErrors.farms },
    { label: "Head Office Stock", value: formatNumber(summary.headOfficeStock), icon: PackageCheck, error: resourceErrors.headOfficeInventory },
    // Backend has no forecast endpoint yet; this is intentionally not a fake value.
    { label: "Forecast Harvested", value: null, icon: Leaf, unsupported: true },
    { label: "Total Branch Stock", value: formatNumber(summary.totalBranchStock), icon: Boxes, error: resourceErrors.branchInventory },
    // Backend has no distribution/in-transit endpoint yet; this is intentionally not a fake value.
    { label: "Flowers In Transit", value: null, icon: Flower2, unsupported: true },
  ];
  const visibleCards = isBranchStaff
    ? cards.filter((card) => ["Total Branch Stock", "Flowers In Transit"].includes(card.label))
    : cards.filter((card) => card.label !== "Flowers In Transit" && (!isHeadOffice || card.label !== "Forecast Harvested"));

  return (
    <section className={`dashboard-summary-grid${isBranchStaff ? " branch-staff" : ""}`} aria-label="Dashboard summary">
      {visibleCards.map((card) => (
        <SummaryCard key={card.label} {...card} onRetry={onRetry} />
      ))}
    </section>
  );
}
