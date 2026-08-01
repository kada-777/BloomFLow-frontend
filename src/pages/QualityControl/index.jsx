import { PageHeader, StatisticCard } from "../../components/ui";
import FlowerCard from "../../components/common/FlowerCard";
import { flowers } from "../../utils/data";
export default function QualityControl() {
  return (
    <>
      <PageHeader
        title="Quality control"
        subtitle="Inspection insights and flower acceptance decisions"
        action="+ New inspection"
      />
      <section className="stat-grid">
        <StatisticCard
          label="Quality score"
          value="94.8"
          note="↑ 2.1 points this month"
        />
        <StatisticCard
          label="Reject rate"
          value="2.6%"
          note="below 4% threshold"
        />
        <StatisticCard
          label="Awaiting inspection"
          value="16 lots"
          note="arrived today"
        />
        <StatisticCard
          label="Approved today"
          value="42 lots"
          note="98% acceptance"
        />
      </section>
      <div className="inspection-grid">
        {flowers.slice(0, 4).map((flower, index) => (
          <FlowerCard
            key={flower.name}
            flower={flower}
            index={index}
            detail={{
              status: index === 2 ? "Warning" : "Healthy",
              summary: `Lot QC-2026-${142 + index} · Score ${96 - index * 3}/100`,
            }}
            action="View inspection →"
          />
        ))}
      </div>
    </>
  );
}
