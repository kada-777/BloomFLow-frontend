# Distribution Planning Integer Quantities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Forecast Recommendation and Final Quantity integer values throughout the Head Office Distribution Planning frontend using normal rounding.

**Architecture:** Keep the existing backend Decimal contract and normalize quantities at the Distribution Planning page boundary. Add one frontend formatter that converts numeric API values to rounded integer strings, then use it consistently for display, input hydration, change detection, validation, and save payloads.

**Tech Stack:** React 19, Vite, JavaScript, existing `distributionService` API client.

## Global Constraints

- Use normal rounding with `Math.round` for existing decimal values.
- Keep the backend and database unchanged.
- Final quantity input must be non-negative integer digits.
- Send `finalQuantity` as an integer string in update requests.
- Keep adjustment reasons required only when normalized final quantity differs from normalized recommendation.

---

### Task 1: Normalize Distribution Planning Quantities

**Files:**
- Modify: `src/pages/DistributionPlanning/index.jsx:16-18,61-75,137-147,189-236,438-488`

**Interfaces:**
- Produces a local quantity formatter used by the same page for display and editing.
- Keeps `distributionService.updatePlanItem(planId, itemId, payload)` unchanged; its payload contains `finalQuantity: string`.

- [ ] **Step 1: Define the normalization behavior in the existing quantity helper**

Replace the current string conversion helper with a formatter that treats nullish or invalid values as `"0"`, rounds valid numeric values with `Math.round`, and returns an integer string. Keep `isPositiveQuantity` working through this helper.

```js
function quantityText(value) {
  if (value === null || value === undefined || value === "") return "0";
  const quantity = Number(value);
  return Number.isFinite(quantity) ? String(Math.round(quantity)) : "0";
}
```

- [ ] **Step 2: Normalize hydrated final quantity inputs**

Keep `finalQuantity` precedence over `recommendedQuantity`, but pass the selected value through `quantityText` so an API value such as `"12.40"` loads as `"12"`.

```js
finalQuantity: quantityText(
  item.finalQuantity ?? item.recommendedQuantity,
),
```

- [ ] **Step 3: Compare normalized values when detecting edits**

Update `changedItems` and `changedFromRecommendation` comparisons to compare `quantityText(...)` values rather than raw API strings. This prevents `"12.40"` and the normalized input `"12"` from being treated as a user adjustment.

```js
quantityText(item.finalQuantity ?? item.recommendedQuantity) !==
  quantityText(input.finalQuantity.trim())
```

Use the same normalized comparison inside `saveChanges` when deciding whether an adjustment reason is required and whether to include `adjustmentReason` in the payload.

- [ ] **Step 4: Enforce integer validation and payload normalization**

Change the save validation from the decimal pattern to `/^\d+$/`, update the error text to state that final quantity must be a non-negative integer, and send `quantityText(input.finalQuantity.trim())` in the API payload.

```js
if (!/^\d+$/.test(input.finalQuantity.trim())) {
  setError("Final quantity must be a non-negative integer.");
  return false;
}
```

- [ ] **Step 5: Update the final quantity input semantics**

Change the input from `inputMode="decimal"` to `inputMode="numeric"`, add `type="text"` and `pattern="[0-9]*"`, and retain the existing controlled value and disabled behavior. The save validation remains authoritative for pasted or manually entered decimal/negative values.

- [ ] **Step 6: Verify the frontend build**

Run from `BloomFLow-frontend`:

```bash
npm run build
```

Expected: Vite completes successfully without syntax or import errors.

- [ ] **Step 7: Review the final diff and commit**

Run:

```bash
git diff -- src/pages/DistributionPlanning/index.jsx
git status --short
```

Confirm only the intended page behavior changed, then commit:

```bash
git add src/pages/DistributionPlanning/index.jsx
git commit -m "feat: use integer distribution quantities"
```

### Task 2: Manual Acceptance Verification

**Files:**
- Verify: `src/pages/DistributionPlanning/index.jsx`
- Verify: `docs/superpowers/specs/2026-08-14-distribution-planning-integer-quantities-design.md`

**Interfaces:**
- Consumes the integer normalization and validation behavior from Task 1.
- Produces verified behavior without changing API or database contracts.

- [ ] **Step 1: Verify normal rounding examples**

Open Distribution Planning with data containing decimal recommendations and confirm `12.4` displays as `12`, `12.5` displays as `13`, and `12.6` displays as `13` in both the table and Add Flower selector.

- [ ] **Step 2: Verify final quantity editing**

Confirm an editable final quantity loads as an integer, accepts values such as `0` and `15`, and rejects decimal or negative values when saving with the integer-specific validation message.

- [ ] **Step 3: Verify save payload behavior**

Use the browser network panel while saving and confirm the PATCH request contains an integer string such as `"13"` for `finalQuantity`, not a decimal string.

- [ ] **Step 4: Verify adjustment reason behavior**

Confirm a backend recommendation of `12.40` with final input `12` does not require an adjustment reason, while final input `13` does require the existing minimum five-character reason.

- [ ] **Step 5: Record verification result**

Run the production build again after manual checks and record any failure before claiming completion:

```bash
npm run build
```
