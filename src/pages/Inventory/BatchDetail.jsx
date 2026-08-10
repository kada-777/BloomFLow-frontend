import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import { getApiError } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import "./inventory.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function BatchDetail() {
  const { flowerId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    inventoryService.getMyBranchFlowerDetail(flowerId)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, "Unable to load batch detail."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [flowerId]);

  const flowerLabel = detail?.flower?.variety || detail?.flower?.name || `Flower #${flowerId}`;

  return (
    <div className="inventory-detail-page">
      <Link className="inventory-back-link" to="/inventory"><ArrowLeft size={16} /> Back to Inventory</Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">BRANCH INVENTORY</p>
          <h1>Batch Detail</h1>
          <span>{flowerLabel}{detail?.flower?.variety && detail.flower.name ? ` · ${detail.flower.name}` : ""}</span>
        </div>
      </header>

      <ActionNotice message={error} tone="error" />
      <div className="table-wrap inventory-detail-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Source Batch</th>
              <th>Received Date</th>
              <th>Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Loading batch detail...</td></tr>
            ) : detail?.lots?.length ? (
              detail.lots.map((lot) => (
                <tr key={lot.id}>
                  <td>
                    <div className="inventory-source-list">
                      {lot.sourceBatches.length
                        ? lot.sourceBatches.map((batch) => <span key={batch.batchNumber}>{batch.batchNumber}</span>)
                        : <span>-</span>}
                    </div>
                  </td>
                  <td>
                    <div className="inventory-source-list">
                      {lot.sourceBatches.length
                        ? lot.sourceBatches.map((batch) => <span key={`${batch.batchNumber}-date`}>{formatDate(batch.receivedDate)}</span>)
                        : <span>-</span>}
                    </div>
                  </td>
                  <td>{lot.ageDays} days</td>
                  <td><span className={`inventory-status inventory-status-${lot.flowerStatus.toLowerCase()}`}>{lot.flowerStatus}</span></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No batch detail found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
