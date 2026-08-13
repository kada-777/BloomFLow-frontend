import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import { getApiError } from "../../services/api";
import { distributionService } from "../../services/distributionService";
import "./distribution-planning.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function quantityText(value) {
  return value === null || value === undefined ? "0" : String(value);
}

function statusLabel(status) {
  return status?.replaceAll("_", " ") || "-";
}

function dateKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isPositiveQuantity(value) {
  return Number.parseFloat(quantityText(value)) > 0;
}

function flowerLabel(item) {
  return `${item.flower?.name || `Flower #${item.flowerId}`}${
    item.flower?.variety ? ` · ${item.flower.variety}` : ""
  }`;
}

export default function DistributionPlanning() {
  const { user } = useAuth();
  const canManage = user?.role?.toUpperCase() === "STAFF_HEAD_OFFICE";
  const [detail, setDetail] = useState(null);
  const [inputs, setInputs] = useState({});
  const [revealedItems, setRevealedItems] = useState({});
  const [addingBranchId, setAddingBranchId] = useState(null);
  const [todayPlan, setTodayPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hydrateInputs = useCallback((plan) => {
    setInputs(
      Object.fromEntries(
        (plan?.items || []).map((item) => [
          item.id,
          {
            finalQuantity: quantityText(
              item.finalQuantity ?? item.recommendedQuantity,
            ),
            adjustmentReason: item.adjustmentReason || "",
          },
        ]),
      ),
    );
  }, []);

  const openPlan = useCallback(
    async (id) => {
      setError("");
      try {
        const plan = await distributionService.getPlan(id);
        setDetail(plan);
        hydrateInputs(plan);
        setRevealedItems({});
        setAddingBranchId(null);
      } catch (requestError) {
        setError(
          getApiError(
            requestError,
            "Unable to load distribution plan details.",
          ),
        );
      }
    },
    [hydrateInputs],
  );

  const refresh = useCallback(
    async ({ selectOpenPlan = true } = {}) => {
      setLoading(true);
      setError("");
      try {
        const planRows = await distributionService.listPlans();
        const currentDateKey = dateKey(new Date());
        const existingTodayPlan = (planRows || []).find(
          (plan) => dateKey(plan.planningDate) === currentDateKey,
        );
        setTodayPlan(existingTodayPlan || null);
        if (selectOpenPlan && existingTodayPlan) {
          await openPlan(existingTodayPlan.id);
          return;
        }
        if (selectOpenPlan) {
          const open = (planRows || []).find((plan) =>
            ["DRAFT", "FINALIZED"].includes(plan.status),
          );
          if (open) await openPlan(open.id);
        }
      } catch (requestError) {
        setError(
          getApiError(
            requestError,
            "Unable to load distribution planning.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [openPlan],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changedItems = useMemo(
    () =>
      (detail?.items || []).filter((item) => {
        const input = inputs[item.id];
        return (
          input &&
          quantityText(item.finalQuantity ?? item.recommendedQuantity) !==
            input.finalQuantity.trim()
        );
      }),
    [detail, inputs],
  );

  const branchGroups = useMemo(() => {
    const groups = new Map();
    for (const item of detail?.items || []) {
      const branchId = item.branchId;
      if (!groups.has(branchId)) {
        groups.set(branchId, {
          branchId,
          branchName: item.branch?.name || `Branch #${branchId}`,
          items: [],
          hiddenItems: [],
          visibleItems: [],
        });
      }
      const group = groups.get(branchId);
      const isVisible =
        isPositiveQuantity(item.recommendedQuantity) ||
        isPositiveQuantity(item.finalQuantity) ||
        Boolean(item.adjustmentReason) ||
        Boolean(revealedItems[item.id]);
      group.items.push(item);
      if (isVisible) {
        group.visibleItems.push(item);
      } else {
        group.hiddenItems.push(item);
      }
    }
    return [...groups.values()];
  }, [detail, revealedItems]);

  const canShowPlanActions =
    canManage && detail && ["DRAFT", "FINALIZED"].includes(detail.status);

  const updateInput = (itemId, field, value) => {
    setInputs((current) => ({
      ...current,
      [itemId]: { ...current[itemId], [field]: value },
    }));
  };

  const saveChanges = async () => {
    if (!detail || !changedItems.length) return true;
    for (const item of changedItems) {
      const input = inputs[item.id];
      if (!/^\d+(\.\d{1,2})?$/.test(input.finalQuantity.trim())) {
        setError(
          "Final quantity must be zero or a positive number with at most two decimal places.",
        );
        return false;
      }
      const changedFromRecommendation =
        quantityText(item.recommendedQuantity) !== input.finalQuantity.trim();
      if (
        changedFromRecommendation &&
        input.adjustmentReason.trim().length < 5
      ) {
        setError(
          "The adjustment reason must have at least 5 characters when the quantity differs from the recommendation.",
        );
        return false;
      }
    }

    setIsSaving(true);
    setError("");
    try {
      for (const item of changedItems) {
        const input = inputs[item.id];
        await distributionService.updatePlanItem(detail.id, item.id, {
          finalQuantity: input.finalQuantity.trim(),
          ...(quantityText(item.recommendedQuantity) !==
          input.finalQuantity.trim()
            ? { adjustmentReason: input.adjustmentReason.trim() }
            : {}),
        });
      }
      await openPlan(detail.id);
      setSuccess("Plan quantity changes saved successfully.");
      return true;
    } catch (requestError) {
      setError(
        getApiError(requestError, "Unable to save plan changes."),
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const generatePlan = async () => {
    if (todayPlan) {
      setSuccess("Today's plan already exists. Plan generation is disabled.");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const result = await distributionService.generatePlan();
      await openPlan(result.distributionPlanId);
      await refresh({ selectOpenPlan: false });
      setSuccess(
        result.reused
          ? "Today's plan already exists. Opening the available plan."
          : "A new DRAFT distribution plan was created from forecast recommendations.",
      );
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to generate the plan."));
    } finally {
      setIsGenerating(false);
    }
  };

  const transitionPlan = async (action) => {
    if (!detail) return;
    if (changedItems.length) {
      setError(
        "Save all quantity changes before updating the plan status.",
      );
      return;
    }
    setIsTransitioning(true);
    setError("");
    try {
      if (action === "finalize") {
        await distributionService.finalizePlan(detail.id);
        setSuccess("The plan was finalized and is ready to create orders.");
        await openPlan(detail.id);
      } else {
        await distributionService.createOrders(detail.id);
        setDetail(null);
        setInputs({});
        setRevealedItems({});
        setAddingBranchId(null);
        setSuccess(
          "Distribution orders were created. Open Distribution to review history and ship all orders.",
        );
      }
      await refresh({ selectOpenPlan: false });
    } catch (requestError) {
      setError(
        getApiError(requestError, "Unable to update plan status."),
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  const deleteActivePlan = async () => {
    if (!detail) return;
    const confirmed = window.confirm(
      `Delete Plan #${detail.id}? A plan with shipments in progress cannot be deleted.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError("");
    try {
      await distributionService.deletePlan(detail.id);
      setDetail(null);
      setInputs({});
      setRevealedItems({});
      setAddingBranchId(null);
      await refresh({ selectOpenPlan: true });
      setSuccess("The active plan was deleted successfully.");
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to delete the active plan."));
    } finally {
      setIsDeleting(false);
    }
  };

  const revealFlower = (itemId) => {
    if (!itemId) return;
    setRevealedItems((current) => ({ ...current, [itemId]: true }));
    setAddingBranchId(null);
  };

  return (
    <div className="distribution-planning-page">
      <header className="distribution-planning-header">
        <div>
          <p className="distribution-planning-eyebrow">HEAD OFFICE PLANNING</p>
          <h1>Distribution Planning</h1>
          <p>
            Use the forecast as a recommendation, then set the final shipment
            quantity for each branch.
          </p>
        </div>
        {canManage && (
          <div className="distribution-generate-area">
            <button
              className="distribution-primary-button"
              type="button"
              onClick={generatePlan}
              disabled={isGenerating || Boolean(todayPlan)}
            >
              <Sparkles size={18} />{" "}
              {isGenerating ? "Generating..." : "Generate Plan"}
            </button>
            {todayPlan && (
              <p>
                Today's plan already exists: Plan #{todayPlan.id} (
                {statusLabel(todayPlan.status)}). Plans can only be generated
                once per day.
              </p>
            )}
          </div>
        )}
      </header>

      <ActionNotice message={error} tone="error" onAction={() => refresh()} />
      <ActionNotice message={success} onClose={() => setSuccess("")} />

      <section className="distribution-plan-detail">
        <div className="distribution-section-heading">
          <div>
            <h2>Active Plan</h2>
            <p>
              Review recommendations and final quantities before creating
              distribution orders.
            </p>
          </div>
          {detail && (
            <span
              className={`distribution-status status-${detail.status.toLowerCase()}`}
            >
              {statusLabel(detail.status)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="distribution-state">Loading distribution plan...</div>
         ) : !detail ? (
           <div className="distribution-state">
             {todayPlan
               ? "Today's plan already exists and is not editable. Finalize the plan, then create orders before opening Distribution to review or ship them."
               : "No DRAFT or FINALIZED plan is available. Generate a new plan to get started."}
           </div>
        ) : (
          <>
            <div className="distribution-plan-meta">
              <span>Plan #{detail.id}</span>
              <span>Planning date: {formatDate(detail.planningDate)}</span>
              <span>{detail.items.length} branch-flower recommendations available</span>
            </div>
            <div className="distribution-branch-groups">
              {branchGroups.map((group) => (
                <section className="distribution-branch-group" key={group.branchId}>
                  <div className="distribution-branch-heading">
                    <div>
                      <h3>{group.branchName}</h3>
                      <span>
                         {group.visibleItems.length} flowers displayed
                        {group.hiddenItems.length
                           ? ` · ${group.hiddenItems.length} not added yet`
                          : ""}
                      </span>
                    </div>
                    {detail.status === "DRAFT" && canManage && (
                      <button
                        className="distribution-add-flower-button"
                        type="button"
                        onClick={() =>
                          setAddingBranchId((current) =>
                            current === group.branchId ? null : group.branchId,
                          )
                        }
                        disabled={!group.hiddenItems.length}
                      >
                        <Plus size={15} />
                        {group.hiddenItems.length
                           ? "Add Flower"
                           : "All flowers added"}
                      </button>
                    )}
                  </div>
                  {addingBranchId === group.branchId && (
                    <div className="distribution-add-flower-panel">
                      <label htmlFor={`add-flower-${group.branchId}`}>
                         Select a flower for {group.branchName}
                      </label>
                      <select
                        id={`add-flower-${group.branchId}`}
                        defaultValue=""
                        onChange={(event) => revealFlower(event.target.value)}
                      >
                        <option value="" disabled>
                           Select a flower type
                        </option>
                        {group.hiddenItems.map((item) => (
                          <option key={item.id} value={item.id}>
                             {flowerLabel(item)} · Recommended{" "}
                            {quantityText(item.recommendedQuantity)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="distribution-table-wrap">
                    <table className="distribution-plan-table">
                      <thead>
                        <tr>
                           <th>Flower</th>
                           <th>Forecast Recommendation</th>
                           <th>Final Quantity</th>
                           <th>Adjustment Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!group.visibleItems.length && (
                          <tr>
                            <td colSpan={4} className="distribution-empty-row">
                               No flowers are displayed for this branch. Use
                               Add Flower to send another flower type.
                            </td>
                          </tr>
                        )}
                        {group.visibleItems.map((item) => {
                          const input = inputs[item.id] || {};
                          const isDraft = detail.status === "DRAFT" && canManage;
                          const changedFromRecommendation =
                            input.finalQuantity !==
                            quantityText(item.recommendedQuantity);
                          return (
                            <tr key={item.id}>
                              <td>{flowerLabel(item)}</td>
                              <td>{quantityText(item.recommendedQuantity)}</td>
                              <td>
                                <input
                                   aria-label={`Final quantity for ${item.flower?.name || item.flowerId}`}
                                  disabled={!isDraft}
                                  inputMode="decimal"
                                  value={input.finalQuantity || ""}
                                  onChange={(event) =>
                                    updateInput(
                                      item.id,
                                      "finalQuantity",
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                   aria-label={`Adjustment reason for ${item.flower?.name || item.flowerId}`}
                                  disabled={!isDraft || !changedFromRecommendation}
                                  value={input.adjustmentReason || ""}
                                  onChange={(event) =>
                                    updateInput(
                                      item.id,
                                      "adjustmentReason",
                                      event.target.value,
                                    )
                                  }
                                  placeholder={
                                    changedFromRecommendation
                                       ? "At least 5 characters required"
                                       : "Not required"
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
            {canShowPlanActions && (
              <div className="distribution-plan-actions">
                <button
                  className="distribution-danger-button"
                  type="button"
                  onClick={deleteActivePlan}
                  disabled={isDeleting || isSaving || isTransitioning}
                >
                  <Trash2 size={17} /> {isDeleting ? "Deleting..." : "Delete Plan"}
                </button>
                {detail.status === "DRAFT" && (
                  <>
                    <button
                      className="distribution-secondary-button"
                      type="button"
                      onClick={saveChanges}
                      disabled={!changedItems.length || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="distribution-primary-button"
                      type="button"
                      onClick={() => transitionPlan("finalize")}
                      disabled={isTransitioning || changedItems.length > 0}
                    >
                      <PackageCheck size={17} /> Finalize Plan
                    </button>
                  </>
                )}
                {detail.status === "FINALIZED" && (
                  <button
                    className="distribution-primary-button"
                    type="button"
                    onClick={() => transitionPlan("create-orders")}
                    disabled={isTransitioning}
                  >
                    <Plus size={17} />{" "}
                     {isTransitioning ? "Creating orders..." : "Create Orders"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}

