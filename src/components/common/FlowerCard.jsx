import { StatusBadge } from "../ui";

export default function FlowerCard({ flower, index = 0, detail, action }) {
  return (
    <article className="flower-card">
      <div className={`flower-image f${index % 5}`}>✿</div>
      <div>
        <StatusBadge>{detail?.status || "Healthy"}</StatusBadge>
        <h3>{flower.name}</h3>
        <p>{detail?.summary || `${flower.category} · ${flower.season}`}</p>
        {detail?.content || (
          <dl>
            <div>
              <dt>Shelf life</dt>
              <dd>{flower.shelf}</dd>
            </div>
            <div>
              <dt>Average cost</dt>
              <dd>{flower.cost}</dd>
            </div>
            <div>
              <dt>Quality rating</dt>
              <dd>★ {flower.rating}</dd>
            </div>
          </dl>
        )}
        {action && <button className="text-button">{action}</button>}
      </div>
    </article>
  );
}
