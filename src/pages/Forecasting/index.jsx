import { PageHeader, StatisticCard } from "../../components/ui";
import { trend, flowers } from "../../utils/data";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
export default function Forecasting() {
  return (
    <>
      <PageHeader
        title="Demand forecasting"
        subtitle="AI-guided demand signals for smarter purchasing"
        action="Review recommendations"
      />
      <section className="stat-grid">
        <StatisticCard
          label="Weekly forecast"
          value="8,460"
          note="stems expected"
        />
        <StatisticCard
          label="Monthly forecast"
          value="34,200"
          note="↑ 9.4% seasonal lift"
        />
        <StatisticCard
          label="Purchase recommendation"
          value="Rp 86M"
          note="for next cycle"
        />
        <StatisticCard
          label="Forecast confidence"
          value="93%"
          note="based on 12 months"
        />
      </section>
      <section className="dashboard-grid">
        <article className="chart-card wide">
          <div className="card-title">
            <div>
              <h3>Predicted demand</h3>
              <p>Daily forecast with seasonality signal</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={trend}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#6E8B6B"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
        <article className="chart-card">
          <h3>Popular flowers</h3>
          {flowers.slice(0, 4).map((f, i) => (
            <div className="rank" key={f.name}>
              <span>0{i + 1}</span>
              <b>{f.name}</b>
              <small>{94 - i * 7}% demand</small>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}
