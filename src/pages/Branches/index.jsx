import { PageHeader, StatusBadge } from "../../components/ui";
import { branches } from "../../utils/data";
export default function Branches() {
  return (
    <>
      <PageHeader
        title="Branches"
        subtitle="Monitor operations across your branch network"
        action="+ Add branch"
      />
      <div className="branch-grid">
        {branches.map((b, i) => (
          <article className="branch-card" key={b.name}>
            <div className="map">
              {i === 0 ? "Jakarta" : i === 1 ? "Pondok Indah" : "BSD"}
              <span>●</span>
            </div>
            <StatusBadge>{b.status}</StatusBadge>
            <h3>{b.name}</h3>
            <p>{b.city}</p>
            <dl>
              <div>
                <dt>Manager</dt>
                <dd>{b.manager}</dd>
              </div>
              <div>
                <dt>Current stock</dt>
                <dd>{b.stock}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>+62 21 555 {120 + i}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
