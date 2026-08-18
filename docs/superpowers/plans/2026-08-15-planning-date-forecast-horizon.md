# Planning Date Forecast Horizon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require Head Office Staff to choose and confirm a backend-provided planning date before generating a Distribution Plan, with the backend remaining authoritative for cutoff, horizon, availability, and duplicate detection.

**Architecture:** Extend the existing distribution API service with planning metadata and a date-specific generation request. Keep request orchestration on `DistributionPlanning`, isolate timezone-safe calendar-date formatting in a small page utility, and render the structured confirmation in a focused `GeneratePlanDialog` built on the existing `Modal` component.

**Tech Stack:** React 19, Vite 8, JavaScript, Axios, existing BloomFlow `Modal` and `ActionNotice` components.

## Global Constraints

- Treat planning and cutoff dates as unchanged `YYYY-MM-DD` strings at the API boundary.
- Do not calculate server date, Daily Sales cutoff, minimum/maximum planning date, forecast horizon, or previous-plan existence in the frontend.
- Populate selection only from `planningDates` and automatically choose the first response entry with `available: true`.
- Disable entries with `reason: "PLAN_ALREADY_EXISTS"` and label them `Plan sudah ada`.
- Send `POST /forecasts` with exactly `{ planningDate }`; never send `cutoffDate`, `forecastDate`, or `horizon`.
- Treat every HTTP 409 from plan generation as duplicate/stale metadata and refresh planning metadata.
- Do not add a test runner or test dependencies; follow the repository's existing production-build and manual acceptance-verification approach.
- Preserve existing plan detail, quantity editing, save, finalize, delete, and create-order behavior.

## File Structure

- Modify `src/services/distributionService.js`: expose metadata retrieval and the exact generation request payload.
- Create `src/pages/DistributionPlanning/planningDate.js`: format backend calendar-date strings without timezone conversion.
- Create `src/pages/DistributionPlanning/GeneratePlanDialog.jsx`: present confirmation metadata and guard dismissal/submission while pending.
- Create `src/pages/DistributionPlanning/generate-plan-dialog.css`: style the focused dialog with existing theme variables and mobile behavior.
- Modify `src/pages/DistributionPlanning/index.jsx`: own metadata selection, unavailable states, dialog lifecycle, generation, conflict refresh, and generated-plan opening.
- Modify `src/pages/DistributionPlanning/distribution-planning.css`: lay out the Planning Date field and generate controls responsively.

---

### Task 1: Planning Metadata API Contract

**Files:**
- Modify: `src/services/distributionService.js:7-13`

**Interfaces:**
- Produces: `distributionService.getPlanningMetadata(): Promise<PlanningMetadata>` where the unwrapped object contains `cutoffDate`, `planningDates`, and `unavailableReason`.
- Produces: `distributionService.generatePlan(planningDate: string): Promise<GeneratePlanResult>` posting exactly `{ planningDate }`.
- Consumes: existing Axios `api` client and local `unwrap(response)` helper.

- [ ] **Step 1: Replace the empty generation payload and add metadata retrieval**

Update the top of the service object to:

```js
export const distributionService = {
  async getPlanningMetadata() {
    return unwrap(await api.get("/forecasts/planning-metadata"));
  },

  async generatePlan(planningDate) {
    return unwrap(await api.post("/forecasts", { planningDate }));
  },

  async listPlans() {
    return unwrap(await api.get("/distribution-plans", { params: { limit: "100" } }));
  },
```

Do not add optional payload fields or derive values inside the service.

- [ ] **Step 2: Verify the service compiles**

Run:

```bash
npm run build
```

Expected: Vite completes successfully; there are no syntax errors in `distributionService.js`. The page may still call `generatePlan()` without an argument until Task 3, so functional payload verification occurs there.

- [ ] **Step 3: Review and commit the API contract**

Run:

```bash
git diff --check
git diff -- src/services/distributionService.js
```

Confirm the only request-body change is `{ planningDate }`, then commit:

```bash
git add src/services/distributionService.js
git commit -m "feat: add planning metadata service"
```

### Task 2: Timezone-Safe Date Formatting And Confirmation Dialog

**Files:**
- Create: `src/pages/DistributionPlanning/planningDate.js`
- Create: `src/pages/DistributionPlanning/GeneratePlanDialog.jsx`
- Create: `src/pages/DistributionPlanning/generate-plan-dialog.css`

**Interfaces:**
- Produces: `formatPlanningDate(value: string): string`, returning an Indonesian date label without parsing an instant.
- Produces: `GeneratePlanDialog({ open, planningDate, cutoffDate, horizon, submitting, onCancel, onConfirm })`.
- Consumes: existing `Modal` component and Lucide icons.

- [ ] **Step 1: Add a date-only formatter that never creates a `Date`**

Create `planningDate.js`:

```js
const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatPlanningDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return "-";

  const [, year, month, day] = match;
  const monthLabel = INDONESIAN_MONTHS[Number(month) - 1];
  if (!monthLabel) return "-";

  return `${Number(day)} ${monthLabel} ${year}`;
}
```

This utility must not use `new Date`, `Date.parse`, UTC conversion, or locale parsing.

- [ ] **Step 2: Create the focused generation dialog**

Create `GeneratePlanDialog.jsx`:

```jsx
import { Sparkles, X } from "lucide-react";
import Modal from "../../components/common/Modal/Modal";
import { formatPlanningDate } from "./planningDate";
import "./generate-plan-dialog.css";

export default function GeneratePlanDialog({
  open,
  planningDate,
  cutoffDate,
  horizon,
  submitting,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onCancel}
      labelledBy="generate-plan-dialog-title"
    >
      <section className="generate-plan-dialog-card">
        <button
          className="generate-plan-dialog-close"
          type="button"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Tutup dialog"
        >
          <X size={18} />
        </button>
        <div className="generate-plan-dialog-icon">
          <Sparkles size={25} />
        </div>
        <h2 id="generate-plan-dialog-title">Buat Distribution Plan?</h2>
        <dl className="generate-plan-dialog-meta">
          <div>
            <dt>Planning Date</dt>
            <dd>{formatPlanningDate(planningDate)}</dd>
          </div>
          <div>
            <dt>Cutoff Daily Sales</dt>
            <dd>{formatPlanningDate(cutoffDate)}</dd>
          </div>
          <div>
            <dt>Forecast Horizon</dt>
            <dd>Hari ke-{horizon}</dd>
          </div>
        </dl>
        <div className="generate-plan-dialog-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>
            Batalkan
          </button>
          <button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Membuat Plan..." : "Buat Plan"}
          </button>
        </div>
      </section>
    </Modal>
  );
}
```

Keep this dialog presentational. It must not fetch metadata or issue the generation request.

- [ ] **Step 3: Style the dialog using existing visual tokens**

Create `generate-plan-dialog.css` with scoped classes. Match the existing `ConfirmDialog` dimensions and interaction patterns, but use a left-aligned definition list:

```css
.generate-plan-dialog-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 24px 70px #2e211e28;
  max-width: 470px;
  padding: 30px;
  position: relative;
  width: 100%;
}

.generate-plan-dialog-close {
  align-items: center;
  background: var(--soft);
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--muted);
  display: grid;
  height: 34px;
  justify-content: center;
  position: absolute;
  right: 18px;
  top: 18px;
  width: 34px;
}

.generate-plan-dialog-icon {
  align-items: center;
  background: #fcf2dc;
  border-radius: 50%;
  color: #9a721b;
  display: inline-flex;
  height: 62px;
  justify-content: center;
  width: 62px;
}

.generate-plan-dialog-card h2 {
  color: var(--text);
  font: 700 22px "Plus Jakarta Sans";
  margin: 18px 0;
}

.generate-plan-dialog-meta {
  display: grid;
  gap: 0;
  margin: 0;
}

.generate-plan-dialog-meta div {
  align-items: center;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 12px 0;
}

.generate-plan-dialog-meta dt {
  color: var(--muted);
  font-size: 13px;
}

.generate-plan-dialog-meta dd {
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  text-align: right;
}

.generate-plan-dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}

.generate-plan-dialog-actions button {
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  min-height: 44px;
  padding: 0 18px;
}

.generate-plan-dialog-actions button:first-child {
  background: var(--card);
  color: var(--text);
}

.generate-plan-dialog-actions button:last-child {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.generate-plan-dialog-actions button:disabled,
.generate-plan-dialog-close:disabled {
  cursor: wait;
  opacity: 0.58;
}

@media (max-width: 480px) {
  .generate-plan-dialog-card {
    padding: 27px 18px 22px;
  }

  .generate-plan-dialog-meta div {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .generate-plan-dialog-meta dd {
    text-align: left;
  }

  .generate-plan-dialog-actions {
    flex-direction: column-reverse;
  }
}
```

- [ ] **Step 4: Verify the new modules compile**

The dialog is not yet imported by the route, so first inspect imports and then proceed to Task 3 for route-level compilation. Run the formatter source scan now:

```bash
rg "new Date|Date\.parse|toISOString" src/pages/DistributionPlanning/planningDate.js
```

Expected: no matches.

- [ ] **Step 5: Review and commit the focused UI units**

Run:

```bash
git diff --check
git diff -- src/pages/DistributionPlanning/planningDate.js src/pages/DistributionPlanning/GeneratePlanDialog.jsx src/pages/DistributionPlanning/generate-plan-dialog.css
```

Then commit:

```bash
git add src/pages/DistributionPlanning/planningDate.js src/pages/DistributionPlanning/GeneratePlanDialog.jsx src/pages/DistributionPlanning/generate-plan-dialog.css
git commit -m "feat: add generate plan confirmation dialog"
```

### Task 3: Planning Date Selection And Generation Workflow

**Files:**
- Modify: `src/pages/DistributionPlanning/index.jsx:1-129,221-242,299-333,497-499`
- Modify: `src/pages/DistributionPlanning/distribution-planning.css:1-36`

**Interfaces:**
- Consumes: `distributionService.getPlanningMetadata()`, `distributionService.generatePlan(planningDate)`, `formatPlanningDate(value)`, and `GeneratePlanDialog` from Tasks 1-2.
- Produces: a backend-authoritative selector, confirmation flow, exact request payload, generated-plan opening, metadata refresh, and 409 recovery.

- [ ] **Step 1: Replace browser-today helpers and state with planning metadata state**

In `index.jsx`, import the new units:

```jsx
import GeneratePlanDialog from "./GeneratePlanDialog";
import { formatPlanningDate } from "./planningDate";
```

Delete `dateKey`. Keep the existing `formatDate` only for loaded plan details, or replace its `YYYY-MM-DD` path with `formatPlanningDate` if `detail.planningDate` is a date-only string.

Remove `todayPlan` state and add:

```js
const [planningMetadata, setPlanningMetadata] = useState(null);
const [selectedPlanningDate, setSelectedPlanningDate] = useState("");
const [metadataLoading, setMetadataLoading] = useState(true);
const [metadataError, setMetadataError] = useState("");
const [generationDialog, setGenerationDialog] = useState(null);
```

`generationDialog` is either `null` or this immutable request snapshot:

```js
{
  planningDate: selectedEntry.date,
  cutoffDate: planningMetadata.cutoffDate,
  horizon: selectedEntry.horizon,
}
```

- [ ] **Step 2: Add the metadata loader and automatic first-available selection**

Add a memoized loader before the existing plan-list `refresh` callback:

```js
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
```

This uses response order and does not sort, add dates, or infer availability.

- [ ] **Step 3: Remove today-plan derivation from the plan-list refresh**

Inside `refresh`, delete `currentDateKey`, `existingTodayPlan`, and `setTodayPlan`. Keep listing plans and opening the first `DRAFT` or `FINALIZED` plan when `selectOpenPlan` is true:

```js
const planRows = await distributionService.listPlans();
if (selectOpenPlan) {
  const open = (planRows || []).find((plan) =>
    ["DRAFT", "FINALIZED"].includes(plan.status),
  );
  if (open) await openPlan(open.id);
}
```

Change the mount effect to load both independent resources:

```js
useEffect(() => {
  refresh();
  loadPlanningMetadata();
}, [loadPlanningMetadata, refresh]);
```

- [ ] **Step 4: Derive selected metadata and unavailable copy without calculations**

Add:

```js
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
```

Do not read `serverDate`, `minimumPlanningDate`, or `maximumPlanningDate` to derive client behavior.

- [ ] **Step 5: Split dialog opening from request submission**

Replace the current `generatePlan` handler with:

```js
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
    await openPlan(result.distributionPlanId);
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
      setError(
        getApiError(
          requestError,
          "Planning metadata has changed. Choose an available date and try again.",
        ),
      );
    } else {
      setError(getApiError(requestError, "Unable to generate the plan."));
    }
  } finally {
    setIsGenerating(false);
  }
};
```

The generation request must use the dialog snapshot, not a recalculated or reformatted date.

- [ ] **Step 6: Render the Planning Date selector and unavailable states**

Replace the current generate area with a labeled selector and button:

```jsx
<div className="distribution-generate-area">
  <label className="distribution-planning-date-field">
    <span>Planning Date</span>
    <select
      value={selectedPlanningDate}
      onChange={(event) => setSelectedPlanningDate(event.target.value)}
      disabled={metadataLoading || isGenerating}
    >
      {!selectedPlanningDate && <option value="">Pilih tanggal planning</option>}
      {(planningMetadata?.planningDates || []).map((entry) => (
        <option key={entry.date} value={entry.date} disabled={!entry.available}>
          {formatPlanningDate(entry.date)}
          {entry.reason === "PLAN_ALREADY_EXISTS" ? " - Plan sudah ada" : ""}
        </option>
      ))}
    </select>
  </label>
  <button
    className="distribution-primary-button"
    type="button"
    onClick={openGenerationDialog}
    disabled={metadataLoading || isGenerating || !hasAvailablePlanningDate}
  >
    <Sparkles size={18} /> Generate Plan
  </button>
  {metadataLoading && <p>Memuat tanggal planning...</p>}
  {!metadataLoading && planningUnavailableMessage && (
    <p>{planningUnavailableMessage}</p>
  )}
</div>
```

Delete the old “Today's plan already exists” copy and all `todayPlan`-based disabling.

- [ ] **Step 7: Render retry feedback and the confirmation dialog**

Place metadata feedback near the existing notices:

```jsx
<ActionNotice
  message={metadataError}
  tone="error"
  onAction={loadPlanningMetadata}
/>
```

Render the dialog near the end of the page:

```jsx
<GeneratePlanDialog
  open={Boolean(generationDialog)}
  planningDate={generationDialog?.planningDate}
  cutoffDate={generationDialog?.cutoffDate}
  horizon={generationDialog?.horizon}
  submitting={isGenerating}
  onCancel={closeGenerationDialog}
  onConfirm={generatePlan}
/>
```

Cancel, Escape, overlay, and close-button paths now send no request. During submission, `Modal` receives no `onClose`, and the dialog buttons are disabled.

- [ ] **Step 8: Remove today-dependent empty-state messaging**

Replace the active-plan empty state with backend-neutral copy:

```jsx
<div className="distribution-state">
  No DRAFT or FINALIZED plan is available. Generate a new plan to get started.
</div>
```

Do not use the browser date to decide whether a plan exists.

- [ ] **Step 9: Style the Planning Date field and preserve mobile layout**

Expand the generate-area CSS with:

```css
.distribution-planning-date-field {
  display: grid;
  gap: 6px;
  min-width: 230px;
}

.distribution-planning-date-field span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.distribution-planning-date-field select {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  min-height: 42px;
  padding: 0 34px 0 12px;
}

.distribution-planning-date-field select:focus {
  border-color: var(--accent);
  outline: none;
}
```

In the existing `@media (max-width: 720px)` block, add:

```css
.distribution-planning-date-field {
  min-width: 0;
}
```

Retain the existing mobile full-width button behavior.

- [ ] **Step 10: Verify compilation and static contract constraints**

Run:

```bash
npm run build
rg "dateKey|todayPlan|currentDateKey" src/pages/DistributionPlanning/index.jsx
rg "cutoffDate|forecastDate|horizon" src/services/distributionService.js
rg "new Date|Date\.parse|toISOString" src/pages/DistributionPlanning/planningDate.js
```

Expected:

- Vite build succeeds.
- The removed browser-today identifiers have no matches.
- The service contains no `cutoffDate`, `forecastDate`, or `horizon` request fields.
- The date-only formatter contains no instant/timezone parsing.

- [ ] **Step 11: Review and commit the integrated workflow**

Run:

```bash
git diff --check
git diff -- src/pages/DistributionPlanning/index.jsx src/pages/DistributionPlanning/distribution-planning.css
git status --short
```

Confirm no unrelated files changed, then commit:

```bash
git add src/pages/DistributionPlanning/index.jsx src/pages/DistributionPlanning/distribution-planning.css
git commit -m "feat: select planning date before generation"
```

### Task 4: Manual Acceptance Verification

**Files:**
- Verify: `src/services/distributionService.js`
- Verify: `src/pages/DistributionPlanning/index.jsx`
- Verify: `src/pages/DistributionPlanning/planningDate.js`
- Verify: `src/pages/DistributionPlanning/GeneratePlanDialog.jsx`
- Verify: `docs/superpowers/specs/2026-08-15-planning-date-forecast-horizon-design.md`

**Interfaces:**
- Consumes: the complete API, selection, confirmation, generation, refresh, and date-formatting workflow from Tasks 1-3.
- Produces: acceptance evidence against all 11 requested frontend scenarios without adding test dependencies.

- [ ] **Step 1: Verify metadata loading and first-available selection**

Open Distribution Planning as `STAFF_HEAD_OFFICE` with metadata containing an unavailable `2026-08-14` entry followed by available `2026-08-15`. In browser DevTools Network, confirm `GET /forecasts/planning-metadata` runs and the selector automatically chooses `15 Agustus 2026`.

- [ ] **Step 2: Verify existing-plan option behavior**

Open the selector and confirm `2026-08-14` remains visible, cannot be selected, and is labeled `14 Agustus 2026 - Plan sudah ada`.

- [ ] **Step 3: Verify dialog data and cancellation**

Click Generate Plan. Confirm the dialog shows:

```text
Planning Date       15 Agustus 2026
Cutoff Daily Sales  12 Agustus 2026
Forecast Horizon    Hari ke-3
```

Click Batalkan and confirm DevTools records no `POST /forecasts` request. Repeat with Escape, overlay click, and the close button.

- [ ] **Step 4: Verify the exact generation request and pending guard**

Open the dialog and click Buat Plan. Confirm the button changes to `Membuat Plan...`, all close/submit controls are disabled, and repeated clicks cannot create a second request. Inspect the request body and confirm it is exactly:

```json
{
  "planningDate": "2026-08-15"
}
```

Confirm `cutoffDate`, `forecastDate`, and `horizon` are absent.

- [ ] **Step 5: Verify successful refresh behavior**

After a successful response, confirm the returned `distributionPlanId` is opened as the active plan. Confirm the page sends a fresh metadata request and the generated date becomes disabled with `Plan sudah ada` according to the refreshed backend response.

- [ ] **Step 6: Verify stale Daily Sales and all-plans-exist states**

With `unavailableReason: "SALES_DATA_OUTDATED"`, confirm the exact stale-sales message appears and Generate Plan is disabled. With no available entry and another/null reason, confirm `Semua tanggal planning yang tersedia sudah memiliki plan.` appears and Generate Plan remains disabled.

- [ ] **Step 7: Verify HTTP 409 recovery**

Cause `POST /forecasts` to return HTTP 409 with a backend message. Confirm the message appears, exactly one fresh `GET /forecasts/planning-metadata` follows, and no locally calculated replacement date is selected beyond the first available entry in the refreshed response.

- [ ] **Step 8: Verify timezone stability**

Run the browser in at least one timezone west of UTC, such as `America/Los_Angeles`, and one east of UTC, such as `Asia/Jakarta`. Reload the same metadata and confirm `2026-08-15` always displays as `15 Agustus 2026` and is submitted unchanged as `2026-08-15`.

- [ ] **Step 9: Verify existing Distribution Planning behavior**

Open an existing DRAFT plan, edit and save a final quantity, finalize the plan, and create orders. Also verify deleting an eligible active plan still works. Confirm these flows retain their existing notices and request endpoints.

- [ ] **Step 10: Run final repository checks**

Run:

```bash
git diff --check
npm run build
git status --short
```

Expected: no whitespace errors, Vite completes successfully, and only intended implementation files are changed or committed. Record any backend-dependent acceptance checks that could not be exercised before claiming full completion.
