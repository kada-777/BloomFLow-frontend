import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PackageCheck, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ActionNotice from "../../components/common/ActionNotice/ActionNotice";
import { getApiError } from "../../services/api";
import { distributionService } from "../../services/distributionService";
import GeneratePlanDialog from "./GeneratePlanDialog";
import { formatPlanningDate } from "./planningDate";
import "./distribution-planning.css";

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function quantityText(value) {
  if (value === null || value === undefined || value === "") return "0";
  const quantity = Number(value);
  return Number.isFinite(quantity) ? String(Math.round(quantity)) : "0";
}

function statusLabel(status) {
  return status?.replaceAll("_", " ") || "-";
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
  const [planningMetadata, setPlanningMetadata] = useState(null);
  const [selectedPlanningDate, setSelectedPlanningDate] = useState("");
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState("");
  const [generationDialog, setGenerationDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const openPlanRequestId = useRef(0);

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
    async (id, { throwOnError = false } = {}) => {
      const requestId = ++openPlanRequestId.current;
      setError("");
      try {
        const plan = await distributionService.getPlan(id);
        if (requestId !== openPlanRequestId.current) return false;
        setDetail(plan);
        hydrateInputs(plan);
        return true;
      } catch (requestError) {
        if (requestId === openPlanRequestId.current) {
          setError(
            getApiError(
              requestError,
              "Unable to load distribution plan details.",
            ),
          );
        }
        if (throwOnError) throw requestError;
        return false;
      }
    },
    [hydrateInputs],
  );

  const loadPlanningMetadata = useCallback(async () => {
    setMetadataLoading(true);
    setMetadataError("");
    try {
      const metadata = await distributionService.getPlanningMetadata();
      const planningDates = Array.isArray(metadata?.planningDates)
        ? metadata.planningDates
        : [];
      const firstAvailable = planningDates.find((entry) => entry.available);

      setPlanningMetadata({ ...metadata, planningDates });
      setSelectedPlanningDate(firstAvailable?.date || "");
      return metadata;
    } catch (requestError) {
      setPlanningMetadata(null);
      setSelectedPlanningDate("");
      setMetadataError(
        getApiError(requestError, "Unable to load planning dates."),
      );
      return null;
    } finally {
      setMetadataLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async ({ selectOpenPlan = true } = {}) => {
      const requestId = selectOpenPlan ? ++openPlanRequestId.current : null;
      setLoading(true);
      setError("");
      try {
        const planRows = await distributionService.listPlans();
        if (selectOpenPlan && requestId === openPlanRequestId.current) {
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
    loadPlanningMetadata();
  }, [loadPlanningMetadata, refresh]);

  const changedItems = useMemo(
    () =>
      (detail?.items || []).filter((item) => {
        const input = inputs[item.id];
        const finalQuantity = input?.finalQuantity?.trim() || "";
        return (
          input &&
          (!/^\d+$/.test(finalQuantity) ||
            quantityText(item.finalQuantity ?? item.recommendedQuantity) !==
              quantityText(finalQuantity))
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
        });
      }
      const group = groups.get(branchId);
      group.items.push(item);
    }
    return [...groups.values()];
  }, [detail]);

  const canShowPlanActions =
    canManage && detail && ["DRAFT", "FINALIZED"].includes(detail.status);
  const selectedPlanningEntry = planningMetadata?.planningDates.find(
    (entry) => entry.date === selectedPlanningDate && entry.available,
  );
  const hasAvailablePlanningDate = Boolean(selectedPlanningEntry);
  const planningUnavailableMessage =
    planningMetadata?.unavailableReason === "SALES_DATA_OUTDATED"
      ? "Tidak ada tanggal planning yang tersedia. Data Daily Sales perlu diperbarui sebelum membuat plan baru."
      : planningMetadata && !hasAvailablePlanningDate
        ? "Semua tanggal planning yang tersedia sudah memiliki plan."
        : "";

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
      if (!/^\d+$/.test(input.finalQuantity.trim())) {
        setError("Final quantity must be a non-negative integer.");
        return false;
      }
      const changedFromRecommendation =
        quantityText(item.recommendedQuantity) !==
        quantityText(input.finalQuantity.trim());
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
          finalQuantity: quantityText(input.finalQuantity.trim()),
          ...(quantityText(item.recommendedQuantity) !==
          quantityText(input.finalQuantity.trim())
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

  const openGenerationDialog = () => {
    if (!selectedPlanningEntry || isGenerating) return;
    setGenerationDialog({
      planningDate: selectedPlanningEntry.date,
      cutoffDate: planningMetadata.cutoffDate,
      horizon: selectedPlanningEntry.horizon,
    });
  };

  const closeGenerationDialog = () => {
    if (!isGenerating) setGenerationDialog(null);
  };

  const generatePlan = async () => {
    if (!generationDialog || isGenerating) return;

    setIsGenerating(true);
    setError("");
    try {
      const result = await distributionService.generatePlan(
        generationDialog.planningDate,
      );
      const planOpened = await openPlan(result.distributionPlanId, {
        throwOnError: true,
      });
      if (!planOpened) {
        throw new Error("Unable to load distribution plan details.");
      }
      await Promise.all([
        refresh({ selectOpenPlan: false }),
        loadPlanningMetadata(),
      ]);
      setGenerationDialog(null);
      setSuccess(
        "A new DRAFT distribution plan was created from forecast recommendations.",
      );
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setGenerationDialog(null);
        await loadPlanningMetadata();
        const conflictMessage = requestError.response?.data?.message;
        setError(
          typeof conflictMessage === "string" && conflictMessage.trim()
            ? conflictMessage
            : "Planning metadata has changed. Choose an available date and try again.",
        );
      } else {
        setError(getApiError(requestError, "Unable to generate the plan."));
      }
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
      await Promise.all([
        refresh({ selectOpenPlan: true }),
        loadPlanningMetadata(),
      ]);
      setSuccess("The active plan was deleted successfully.");
    } catch (requestError) {
      setError(getApiError(requestError, "Unable to delete the active plan."));
    } finally {
      setIsDeleting(false);
    }
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
            <label className="distribution-planning-date-field">
              <span>Planning Date</span>
              <select
                value={selectedPlanningDate}
                onChange={(event) => setSelectedPlanningDate(event.target.value)}
                disabled={metadataLoading || isGenerating}
              >
                {!selectedPlanningDate && (
                  <option value="">Pilih tanggal planning</option>
                )}
                {(planningMetadata?.planningDates || []).map((entry) => (
                  <option
                    key={entry.date}
                    value={entry.date}
                    disabled={!entry.available}
                  >
                    {formatPlanningDate(entry.date)}
                    {entry.reason === "PLAN_ALREADY_EXISTS"
                      ? " - Plan sudah ada"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="distribution-primary-button"
              type="button"
              onClick={openGenerationDialog}
              disabled={
                metadataLoading || isGenerating || !hasAvailablePlanningDate
              }
            >
              <Sparkles size={18} /> Generate Plan
            </button>
            {metadataLoading && <p>Memuat tanggal planning...</p>}
            {!metadataLoading && planningUnavailableMessage && (
              <p>{planningUnavailableMessage}</p>
            )}
          </div>
        )}
      </header>

      <ActionNotice message={error} tone="error" onAction={() => refresh()} />
      <ActionNotice
        message={metadataError}
        tone="error"
        onAction={loadPlanningMetadata}
      />
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
             No DRAFT or FINALIZED plan is available. Generate a new plan to get
             started.
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
                      <span>{group.items.length} flowers displayed</span>
                    </div>
                  </div>
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
                        {!group.items.length && (
                          <tr>
                            <td colSpan={4} className="distribution-empty-row">
                              No flowers are available for this branch.
                            </td>
                          </tr>
                        )}
                        {group.items.map((item) => {
                          const input = inputs[item.id] || {};
                          const isDraft = detail.status === "DRAFT" && canManage;
                          const changedFromRecommendation =
                            quantityText(input.finalQuantity) !==
                            quantityText(item.recommendedQuantity);
                          return (
                            <tr key={item.id}>
                              <td>{flowerLabel(item)}</td>
                              <td>{quantityText(item.recommendedQuantity)}</td>
                              <td>
                                <input
                                  aria-label={`Final quantity for ${item.flower?.name || item.flowerId}`}
                                  disabled={!isDraft}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
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

      <GeneratePlanDialog
        open={Boolean(generationDialog)}
        planningDate={generationDialog?.planningDate}
        cutoffDate={generationDialog?.cutoffDate}
        horizon={generationDialog?.horizon}
        submitting={isGenerating}
        onCancel={closeGenerationDialog}
        onConfirm={generatePlan}
      />
    </div>
  );
}

