import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, PackageCheck, X, XCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import ConfirmDialog from "../../components/common/ConfirmDialog/ConfirmDialog";
import { getApiError } from "../../services/api";
import { distributionService } from "../../services/distributionService";
import "./distribution.css";

const ORDER_LIMIT = 10;

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function quantityText(value) {
  return value === null || value === undefined ? "0" : String(value);
}

function toMinorUnits(value) {
  const [whole = "0", fraction = ""] = quantityText(value).split(".");
  return (
    BigInt(whole || "0") * 100n +
    BigInt(`${fraction}00`.slice(0, 2))
  );
}

function minorUnitsToText(value) {
  const whole = value / 100n;
  const fraction = value % 100n;
  if (fraction === 0n) return String(whole);
  return `${whole}.${String(fraction).padStart(2, "0")}`;
}

function statusLabel(status) {
  return status?.replaceAll("_", " ") || "-";
}

function buildReceivePayload(order) {
  const quantitiesByFlower = new Map();
  for (const allocation of order?.allocations || []) {
    const flowerId = allocation.batch?.flowerId;
    if (!flowerId) continue;
    quantitiesByFlower.set(
      flowerId,
      (quantitiesByFlower.get(flowerId) || 0n) + toMinorUnits(allocation.quantity),
    );
  }

  return {
    items: [...quantitiesByFlower.entries()].map(([flowerId, quantity]) => ({
      flowerId,
      receivedQuantity: minorUnitsToText(quantity),
      damagedQuantity: "0",
      missingQuantity: "0",
    })),
  };
}

export default function Distribution() {
  const { user } = useAuth();
  const canShip = user?.role?.toUpperCase() === "STAFF_HEAD_OFFICE";
  const canReceive = user?.role?.toUpperCase() === "STAFF_BRANCH";
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [shippingPlanId, setShippingPlanId] = useState(null);
  const [receivingOrderId, setReceivingOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await distributionService.listOrders({
        page,
        limit: ORDER_LIMIT,
        ...(!canShip ? { sort } : {}),
        ...(canShip ? { status } : {}),
      });
      setOrders(payload?.data || []);
      setPagination(payload?.pagination || null);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load distribution history."));
    } finally {
      setLoading(false);
    }
  }, [canShip, page, sort, status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const firstDraftOrderByPlan = useMemo(() => {
    const firstByPlan = new Map();
    for (const order of orders) {
      if (!order.distributionPlanId || order.status !== "DRAFT") continue;
      if (!firstByPlan.has(order.distributionPlanId)) {
        firstByPlan.set(order.distributionPlanId, order.id);
      }
    }
    return firstByPlan;
  }, [orders]);

  const changeSort = (value) => {
    setSort(value);
    setPage(1);
  };

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const openDetail = async (orderId) => {
    setDetailLoading(true);
    setDetail(null);
    setError("");
    try {
      setDetail(await distributionService.getOrder(orderId));
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to load shipment details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setDetailLoading(false);
  };

  const shipPlan = async (planId) => {
    setShippingPlanId(planId);
    setError("");
    try {
      await distributionService.shipPlan(planId);
      await loadOrders();
      setSuccess(`Plan #${planId} was shipped to all branches.`);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to ship the plan."));
    } finally {
      setShippingPlanId(null);
    }
  };

  const receiveOrder = async () => {
    if (!detail) return;
    const payload = buildReceivePayload(detail);
    if (!payload.items.length) {
      setError("This order has no batch allocations to receive.");
      return;
    }

    setReceivingOrderId(detail.id);
    setError("");
    try {
      const received = await distributionService.receiveOrder(detail.id, payload);
      setDetail(received);
      await loadOrders();
      setSuccess(`Order #${detail.id} was received successfully.`);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to receive the order."));
    } finally {
      setReceivingOrderId(null);
    }
  };

  const closeCancelDialog = () => {
    if (!cancellingOrderId) setCancelTarget(null);
  };

  const cancelOrder = async () => {
    if (!cancelTarget) return;

    setCancellingOrderId(cancelTarget.id);
    setError("");
    try {
      const cancelled = await distributionService.cancelOrder(cancelTarget.id);
      setDetail(cancelled);
      setCancelTarget(null);
      await loadOrders();
      setSuccess(`Order #${cancelled.id} was cancelled successfully.`);
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to cancel the order."));
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div className="distribution-page">
      <header className="distribution-header">
        <div>
          <p className="distribution-eyebrow">FULFILMENT HISTORY</p>
          <h1>Distribution History</h1>
          <p>Review shipment status and branch details, then ship all orders in a plan.</p>
        </div>
        <div className="distribution-header-controls">
          {!canShip && (
            <label className="distribution-sort-control">
              <span>Sort</span>
              <select value={sort} onChange={(event) => changeSort(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          )}
          {canShip && (
            <label className="distribution-sort-control">
              <span>Status</span>
              <select value={status} onChange={(event) => changeStatus(event.target.value)}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="in_transit">In Transit</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          )}
        </div>
      </header>

      <ActionNotice message={error} tone="error" onAction={loadOrders} />
      <ActionNotice message={success} onClose={() => setSuccess("")} />

      <section className="distribution-history-panel">
        {loading ? (
          <div className="distribution-state">Loading distribution history...</div>
        ) : orders.length === 0 ? (
          <div className="distribution-state">No distribution orders available.</div>
        ) : (
          <>
            <div className="distribution-table-wrap">
              <table className="distribution-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Plan ID</th>
                    <th>Branch</th>
                    <th>Status</th>
                    <th>Shipped At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, orderIndex) => {
                    const isLastOrderInPlan = order.distributionPlanId && !orders
                      .slice(orderIndex + 1)
                      .some((nextOrder) => nextOrder.distributionPlanId === order.distributionPlanId);

                    return (
                      <Fragment key={order.id}>
                        <tr>
                          <td>Order #{order.id}</td>
                          <td>{order.distributionPlanId ? `Plan #${order.distributionPlanId}` : "-"}</td>
                          <td>{order.branch?.name || `Branch #${order.branchId}`}</td>
                          <td>
                            <span className={`distribution-status status-${order.status.toLowerCase()}`}>
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td>{formatDate(order.shippedAt)}</td>
                          <td>
                            <div className="distribution-row-actions">
                              <button type="button" className="distribution-secondary-button" onClick={() => openDetail(order.id)}>
                                <Eye size={15} /> Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                        {canShip && isLastOrderInPlan && order.distributionPlanId && firstDraftOrderByPlan.has(order.distributionPlanId) && (
                          <tr className="distribution-plan-action-row">
                            <td colSpan={6}>
                              <div className="distribution-plan-action-content">
                                <span>Ready to ship all orders in Plan #{order.distributionPlanId}</span>
                                <button
                                  type="button"
                                  className="distribution-primary-button"
                                  onClick={() => shipPlan(order.distributionPlanId)}
                                  disabled={shippingPlanId === order.distributionPlanId}
                                >
                                  <PackageCheck size={15} />
                                  {shippingPlanId === order.distributionPlanId
                                    ? "Shipping..."
                                    : `Ship All Plan #${order.distributionPlanId}`}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="distribution-pagination">
              <button
                className="distribution-secondary-button"
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={!pagination?.hasPreviousPage}
              >
                Previous
              </button>
              <span>Page {pagination?.page || page} of {pagination?.totalPages || 1}</span>
              <button
                className="distribution-secondary-button"
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination?.hasNextPage}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      {(detail || detailLoading) && (
        <div className="distribution-detail-backdrop" role="presentation">
          <aside className="distribution-detail-panel" aria-label="Shipment details">
            <div className="distribution-detail-heading">
              <div>
                <p className="distribution-eyebrow">SHIPMENT DETAIL</p>
                <h2>{detail ? `Order #${detail.id}` : "Loading details..."}</h2>
              </div>
              <div className="distribution-detail-heading-actions">
                {canReceive && detail?.status === "IN_TRANSIT" && (
                  <button
                    type="button"
                    className="distribution-primary-button"
                    onClick={receiveOrder}
                    disabled={receivingOrderId === detail.id}
                  >
                    <PackageCheck size={15} />
                    {receivingOrderId === detail.id ? "Receiving..." : "Receive"}
                  </button>
                )}
                {canShip && detail?.status === "DRAFT" && (
                  <button
                    type="button"
                    className="distribution-secondary-button"
                    onClick={() => setCancelTarget(detail)}
                    disabled={cancellingOrderId === detail.id}
                  >
                    <XCircle size={15} />
                    Cancel Order
                  </button>
                )}
                <button type="button" className="distribution-icon-button" onClick={closeDetail} aria-label="Close details">
                  <X size={18} />
                </button>
              </div>
            </div>
            {detailLoading ? (
              <div className="distribution-state">Loading shipment details...</div>
            ) : detail && (
              <>
                <div className="distribution-detail-meta">
                  <span>{detail.branch?.name || `Branch #${detail.branchId}`}</span>
                  <span>{detail.distributionPlan?.id ? `Plan #${detail.distributionPlan.id}` : "No plan"}</span>
                  <span className={`distribution-status status-${detail.status.toLowerCase()}`}>
                    {statusLabel(detail.status)}
                  </span>
                  <span>Shipped: {formatDate(detail.shippedAt)}</span>
                </div>

                <section className="distribution-detail-section">
                  <h3>Flower Items</h3>
                  {detail.items?.length ? (
                    <table className="distribution-mini-table">
                      <thead>
                        <tr><th>Flower</th><th>Final Qty</th><th>Recommendation</th></tr>
                      </thead>
                      <tbody>
                        {detail.items.map((item) => (
                          <tr key={`${item.flowerId}-${item.finalQuantity}`}>
                            <td>{item.flower?.name || `Flower #${item.flowerId}`}{item.flower?.variety ? ` · ${item.flower.variety}` : ""}</td>
                            <td>{quantityText(item.finalQuantity)}</td>
                            <td>{quantityText(item.recommendedQuantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="distribution-muted">There are no plan items for this order.</p>
                  )}
                </section>

                <section className="distribution-detail-section">
                  <h3>Batch Allocations</h3>
                  {detail.allocations?.length ? (
                    <table className="distribution-mini-table">
                      <thead>
                        <tr><th>Batch</th><th>Flower</th><th>Quantity</th></tr>
                      </thead>
                      <tbody>
                        {detail.allocations.map((allocation) => (
                          <tr key={allocation.id}>
                            <td>{allocation.batch?.batchNumber || `Batch #${allocation.batch?.id}`}</td>
                            <td>{allocation.batch?.flower?.name || `Flower #${allocation.batch?.flowerId}`}</td>
                            <td>{quantityText(allocation.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="distribution-muted">No batch allocations are available. The order has not been shipped.</p>
                  )}
                </section>
              </>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Distribution Order?"
        message={cancelTarget ? `Order #${cancelTarget.id} will be cancelled and cannot be shipped.` : ""}
        confirmText="Cancel Order"
        cancelText="Back"
        danger
        submitting={Boolean(cancellingOrderId)}
        onConfirm={cancelOrder}
        onCancel={closeCancelDialog}
      />
    </div>
  );
}
