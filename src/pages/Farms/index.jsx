import { PageHeader, StatisticCard, StatusBadge } from "../../components/ui";
const farms = [
  ["Lembang Flora", "West Java", "24,000 stems/week", "96"],
  ["Puncak Growers", "West Java", "18,500 stems/week", "93"],
  ["Batu Bloom Farm", "East Java", "14,200 stems/week", "89"],
];
export default function Farms() {
  return (
    <>
      <PageHeader
        title="Supplier farms"
        subtitle="Cultivation capacity, harvesting, and partner health"
        action="+ Add farm"
      />
      <section className="stat-grid">
        <StatisticCard label="Active farms" value="18" note="3 regions" />
        <StatisticCard
          label="Weekly capacity"
          value="124K"
          note="stems planned"
        />
        <StatisticCard
          label="Harvest scheduled"
          value="9"
          note="for this week"
        />
        <StatisticCard
          label="Partner health"
          value="94%"
          note="network average"
        />
      </section>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Farm</th>
              <th>Region</th>
              <th>Capacity</th>
              <th>Flower types</th>
              <th>Health score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((x) => (
              <tr key={x[0]}>
                <td>
                  <b>{x[0]}</b>
                </td>
                <td>{x[1]}</td>
                <td>{x[2]}</td>
                <td>Rose, Lily, Orchid</td>
                <td>{x[3]}/100</td>
                <td>
                  <StatusBadge>Healthy</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
