import { useOutletContext } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatisticCard, PageHeader, StatusBadge } from "../../components/ui";
import { trend } from "../../utils/data";
const roleCopy = {
  "Super Admin": [
    "Supply chain overview",
    "Live intelligence across HQ and 12 branches",
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
  const [title, sub] = roleCopy[role];
  const cards =
    role === "Branch Staff"
      ? [
          ["Incoming Shipments", "4", "2 arriving today"],
          ["Daily Sales", "Rp 12.8M", "↑ 16.2% vs yesterday"],
          ["Low Stock Alerts", "3", "Needs attention"],
          ["Shelf-life Watch", "12 lots", "5 lots under 2 days"],
        ]
      : role === "Head Office"
        ? [
            ["Warehouse Stock", "18,240", "stems available"],
            ["Branch Requests", "18", "6 need review"],
            ["Purchase Plan", "Rp 86M", "for next 7 days"],
            ["Balance Actions", "7", "recommended today"],
          ]
        : [
            ["Total HQ Stock", "18,240", "↑ 5.4% vs last week"],
            ["Branch Stock", "14,820", "across 12 branches"],
            ["Today's Sales", "Rp 48.6M", "↑ 12.8% vs yesterday"],
            ["Stockout Risk", "8 lots", "3 need action"],
          ];
  return (
    <>
      <PageHeader title={title} subtitle={sub} action="Export report" />
      <section className="stat-grid">
        {cards.map(([a, b, c], i) => (
          <StatisticCard
            key={a}
            label={a}
            value={b}
            note={c}
            tone={i === 3 ? "amber" : "rose"}
          />
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="chart-card wide">
          <div className="card-title">
            <div>
              <h3>Sales & inventory trend</h3>
              <p>Last 7 operating days</p>
            </div>
            <span className="metric">Rp 247.4M</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="sales" x1="0" x2="0" y1="0" y2="1">
                  <stop stopColor="#b76e79" stopOpacity=".35" />
                  <stop offset="1" stopColor="#b76e79" stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#B76E79"
                strokeWidth={3}
                fill="url(#sales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </article>
        <article className="chart-card">
          <div className="card-title">
            <div>
              <h3>Branch comparison</h3>
              <p>Sales performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend.slice(2)}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="sales" fill="#D8BFA8" radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="table-card wide">
          <div className="card-title">
            <div>
              <h3>Priority actions</h3>
              <p>Operations needing review today</p>
            </div>
            <button className="text-button">View all</button>
          </div>
          {[
            ["Peony stock approaching expiry", "Warehouse A", "Critical"],
            ["Distribution request from BSD", "Awaiting approval", "Warning"],
            ["Kemang sales target achieved", "Today", "Healthy"],
          ].map((x) => (
            <div className="activity" key={x[0]}>
              <span className="activity-dot" />
              <div>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </div>
              <StatusBadge>{x[2]}</StatusBadge>
            </div>
          ))}
        </article>
        <article className="chart-card">
          <h3>Supply health</h3>
          <div className="health-score">
            92<small>/100</small>
          </div>
          <p className="muted">
            Excellent freshness and fulfillment this week.
          </p>
          <div className="progress">
            <i style={{ width: "92%" }} />
          </div>
        </article>
      </section>
    </>
  );
}
