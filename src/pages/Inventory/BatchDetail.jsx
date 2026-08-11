import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import Modal from "../../components/common/Modal/Modal";
import { getApiError } from "../../services/api";
import { inventoryService } from "../../services/inventoryService";
import "./inventory.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

function formatQuantity(value) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString("id-ID", { maximumFractionDigits: 2 })
    : "0";
}

export default function BatchDetail({ flowerId: selectedFlowerId, open, onClose }) {
  const { flowerId: routeFlowerId } = useParams();
  const navigate = useNavigate();
  const flowerId = selectedFlowerId || routeFlowerId;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isOpen = open ?? Boolean(flowerId);
  const handleClose = onClose || (() => navigate("/inventory"));

  useEffect(() => {
    let active = true;
    if (!flowerId) {
      setDetail(null);
      setLoading(false);
      return undefined;
    }

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
    <Modal open={isOpen} onClose={handleClose} labelledBy="batch-detail-title">
      <div className="inventory-detail-modal">
        <header className="inventory-detail-modal-header">
          <div>
            <p className="eyebrow">BRANCH INVENTORY</p>
            <h2 id="batch-detail-title">Batch Detail</h2>
            <span>{flowerLabel}{detail?.flower?.variety && detail.flower.name ? ` · ${detail.flower.name}` : ""}</span>
          </div>
          <button className="icon-button" type="button" onClick={handleClose} aria-label="Close batch detail">
            <X size={18} />
          </button>
        </header>

        <ActionNotice message={error} tone="error" />
        <div className="table-wrap inventory-detail-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Source Batch</th>
                <th>Received Date</th>
                <th>Total Flowers</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3">Loading batch detail...</td></tr>
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
                    <td>{formatQuantity(lot.quantity)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No batch detail found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
