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
  return `${item.flower?.name || `Bunga #${item.flowerId}`}${
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
            "Detail distribution plan tidak dapat dimuat.",
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
          setDetail(null);
          setInputs({});
          setRevealedItems({});
          setAddingBranchId(null);
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
            "Distribution planning tidak dapat dimuat.",
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
          branchName: item.branch?.name || `Cabang #${branchId}`,
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
          "Jumlah akhir harus berupa angka nol atau positif dengan maksimal dua desimal.",
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
          "Alasan penyesuaian minimal 5 karakter saat jumlah berbeda dari rekomendasi.",
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
      setSuccess("Perubahan quantity plan berhasil disimpan.");
      return true;
    } catch (requestError) {
      setError(
        getApiError(requestError, "Perubahan plan tidak dapat disimpan."),
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const generatePlan = async () => {
    if (todayPlan) {
      setSuccess("Plan untuk hari ini sudah ada. Generate plan dinonaktifkan.");
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
          ? "Plan untuk hari ini sudah ada, membuka plan yang tersedia."
          : "Distribution plan DRAFT baru berhasil dibuat dari rekomendasi forecast.",
      );
    } catch (requestError) {
      setError(getApiError(requestError, "Plan tidak dapat digenerate."));
    } finally {
      setIsGenerating(false);
    }
  };

  const transitionPlan = async (action) => {
    if (!detail) return;
    if (changedItems.length) {
      setError(
        "Simpan semua perubahan quantity sebelum melanjutkan status plan.",
      );
      return;
    }
    setIsTransitioning(true);
    setError("");
    try {
      if (action === "finalize") {
        await distributionService.finalizePlan(detail.id);
        setSuccess("Plan telah difinalisasi dan siap dibuatkan order.");
        await openPlan(detail.id);
      } else {
        await distributionService.createOrders(detail.id);
        setDetail(null);
        setInputs({});
        setRevealedItems({});
        setAddingBranchId(null);
        setSuccess(
          "Distribution order berhasil dibuat. Buka halaman Distribution untuk melihat riwayat dan Ship All.",
        );
      }
      await refresh({ selectOpenPlan: false });
    } catch (requestError) {
      setError(
        getApiError(requestError, "Status plan tidak dapat diperbarui."),
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  const deleteActivePlan = async () => {
    if (!detail) return;
    const confirmed = window.confirm(
      `Hapus Plan #${detail.id}? Plan yang sudah memiliki pengiriman berjalan tidak dapat dihapus.`,
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
      setSuccess("Plan aktif berhasil dihapus.");
    } catch (requestError) {
      setError(getApiError(requestError, "Plan aktif tidak dapat dihapus."));
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
            Gunakan forecast sebagai rekomendasi, lalu tetapkan jumlah kirim
            akhir untuk setiap cabang.
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
                Plan untuk hari ini sudah ada: Plan #{todayPlan.id} (
                {statusLabel(todayPlan.status)}). Generate plan hanya bisa
                sekali per hari.
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
            <h2>Plan aktif</h2>
            <p>
              Review rekomendasi dan quantity final sebelum membuat distribution
              order.
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
          <div className="distribution-state">Memuat distribution plan...</div>
        ) : !detail ? (
          <div className="distribution-state">
            {todayPlan
              ? "Plan hari ini sudah ada dan tidak berada pada tahap edit. Buka halaman Distribution untuk melihat atau mengirim order."
              : "Belum ada plan DRAFT atau FINALIZED. Generate plan baru untuk memulai."}
          </div>
        ) : (
          <>
            <div className="distribution-plan-meta">
              <span>Plan #{detail.id}</span>
              <span>Tanggal rencana: {formatDate(detail.planningDate)}</span>
              <span>{detail.items.length} rekomendasi cabang-bunga tersedia</span>
            </div>
            <div className="distribution-branch-groups">
              {branchGroups.map((group) => (
                <section className="distribution-branch-group" key={group.branchId}>
                  <div className="distribution-branch-heading">
                    <div>
                      <h3>{group.branchName}</h3>
                      <span>
                        {group.visibleItems.length} bunga ditampilkan
                        {group.hiddenItems.length
                          ? ` · ${group.hiddenItems.length} belum ditambahkan`
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
                          ? "Tambah bunga"
                          : "Semua bunga sudah ditambahkan"}
                      </button>
                    )}
                  </div>
                  {addingBranchId === group.branchId && (
                    <div className="distribution-add-flower-panel">
                      <label htmlFor={`add-flower-${group.branchId}`}>
                        Pilih bunga untuk {group.branchName}
                      </label>
                      <select
                        id={`add-flower-${group.branchId}`}
                        defaultValue=""
                        onChange={(event) => revealFlower(event.target.value)}
                      >
                        <option value="" disabled>
                          Pilih jenis bunga
                        </option>
                        {group.hiddenItems.map((item) => (
                          <option key={item.id} value={item.id}>
                            {flowerLabel(item)} · Rekomendasi{" "}
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
                          <th>Bunga</th>
                          <th>Rekomendasi forecast</th>
                          <th>Jumlah final</th>
                          <th>Alasan penyesuaian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!group.visibleItems.length && (
                          <tr>
                            <td colSpan={4} className="distribution-empty-row">
                              Belum ada bunga yang ditampilkan untuk cabang ini.
                              Gunakan tombol Tambah bunga jika ingin mengirim
                              jenis bunga lain.
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
                                  aria-label={`Jumlah final ${item.flower?.name || item.flowerId}`}
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
                                  aria-label={`Alasan penyesuaian ${item.flower?.name || item.flowerId}`}
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
                                      ? "Wajib min. 5 karakter"
                                      : "Tidak diperlukan"
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
                  <Trash2 size={17} /> {isDeleting ? "Menghapus..." : "Hapus Plan"}
                </button>
                {detail.status === "DRAFT" && (
                  <>
                    <button
                      className="distribution-secondary-button"
                      type="button"
                      onClick={saveChanges}
                      disabled={!changedItems.length || isSaving}
                    >
                      {isSaving ? "Menyimpan..." : "Simpan perubahan"}
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
                    {isTransitioning ? "Membuat order..." : "Create Orders"}
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

