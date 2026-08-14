# Daily Sales Integer Quantities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Round Sold Qty and Damaged Qty normally in Branch Staff Add Sales, display whole numbers in Most Recent Sales, and send integer strings to the backend.

**Architecture:** Add one reusable frontend quantity normalizer and use it at the Daily Sales form boundary and table display boundary. The form may temporarily accept decimal text while editing, but blur and submit normalize with `Math.round`; the API service remains unchanged because its payload already forwards the normalized values.

**Tech Stack:** React 19, Vite, JavaScript, existing Daily Sales hook and service.

## Global Constraints

- Normalize form quantities with normal rounding using `Math.round`.
- Normalize values on blur and again before validation/submission.
- Send `soldQuantity` and `damagedQuantity` as integer strings in the create payload.
- Display the two quantity columns in `Most Recent Sales` without fractional digits.
- Keep the existing positive-total validation after normalization.
- Leave backend validation and Decimal database columns unchanged.

---

### Task 1: Add Shared Integer Quantity Normalization

**Files:**
- Create: `src/utils/quantity.js`
- Modify: `src/hooks/useDailySales.js:23-81`

**Interfaces:**
- Produces `normalizeIntegerQuantity(value): string`, returning a non-negative rounded integer string or `"0"` for empty/invalid values.
- `validateDailySalesForm(payload)` continues returning the existing field-error object.

- [ ] **Step 1: Define the shared normalizer**

Create `src/utils/quantity.js`:

```js
export function normalizeIntegerQuantity(value) {
  if (value === null || value === undefined || value === "") return "0";
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0
    ? String(Math.round(quantity))
    : "0";
}
```

- [ ] **Step 2: Replace decimal validation with normalized integer validation**

In `useDailySales.js`, import the helper and replace `decimal` with a quantity parser that recognizes non-negative numeric input before normalization. Validate the normalized values, not raw decimal strings:

```js
const soldQuantity = normalizeDailySalesQuantity(item.soldQuantity);
const damagedQuantity = normalizeDailySalesQuantity(item.damagedQuantity);

if (soldQuantity === null) {
  errors[`${prefix}.soldQuantity`] = "Enter a valid non-negative quantity.";
}
if (damagedQuantity === null) {
  errors[`${prefix}.damagedQuantity`] = "Enter a valid non-negative quantity.";
}
if (soldQuantity !== null && damagedQuantity !== null
  && Number(soldQuantity) + Number(damagedQuantity) <= 0) {
  errors[`${prefix}.soldQuantity`] = "Sold and damaged quantities must total more than zero.";
}
```

The parser must return `null` for blank, negative, or non-numeric values, while valid decimal values return `normalizeIntegerQuantity(value)`.

- [ ] **Step 3: Normalize the create payload explicitly**

In `normalizePayload`, pass both fields through `normalizeIntegerQuantity`:

```js
soldQuantity: normalizeIntegerQuantity(item.soldQuantity),
damagedQuantity: normalizeIntegerQuantity(item.damagedQuantity),
```

Keep `flowerId` conversion and `salesDate` unchanged.

- [ ] **Step 4: Verify hook behavior through the existing build**

Run from `BloomFLow-frontend`:

```bash
npm run build
```

Expected: Vite completes successfully.

### Task 2: Normalize Add Sales Inputs and Most Recent Sales Display

**Files:**
- Modify: `src/components/daily-sales/DailySalesForm.jsx:1-5,34-37,97-105`
- Modify: `src/pages/DailySales/index.jsx:8-16,35-38`

**Interfaces:**
- Consumes `normalizeIntegerQuantity(value)` from `src/utils/quantity.js`.
- Keeps the existing `onChange`, `onSubmit`, and `dailySalesService.create` interfaces unchanged.

- [ ] **Step 1: Normalize quantity fields on blur**

Import `normalizeIntegerQuantity` into `DailySalesForm.jsx`. Add a quantity blur handler that updates the current row with the rounded string and clears the matching field error:

```js
const normalizeQuantityField = (index, field, value) => {
  updateItem(index, field, normalizeIntegerQuantity(value));
};
```

Attach it to both quantity inputs with `onBlur`. Keep `type="number"`, change `step` to `1`, and retain `min="0"` so the browser communicates whole-number intent.

- [ ] **Step 2: Use integer display formatting in Most Recent Sales**

Import `normalizeIntegerQuantity` into `src/pages/DailySales/index.jsx` and replace `formatQuantity` with:

```js
function formatQuantity(value) {
  return Number(normalizeIntegerQuantity(value)).toLocaleString("id-ID");
}
```

Keep the existing Sold Qty and Damaged Qty column definitions and labels unchanged.

- [ ] **Step 3: Verify form and table acceptance behavior**

Run:

```bash
npm run build
```

Then verify in the Branch Staff Daily Sales page:

- Enter `12.4` and blur: the field becomes `12`.
- Enter `12.5` and blur: the field becomes `13`.
- Enter `12.6` and blur: the field becomes `13`.
- Save and inspect the network request: `soldQuantity` and `damagedQuantity` are integer strings such as `"13"`.
- Confirm Most Recent Sales renders whole numbers with no decimal digits.
- Confirm a row with both normalized quantities equal to zero still shows the existing total-quantity validation error.

- [ ] **Step 4: Review and commit the implementation**

```bash
git diff -- src/utils/quantity.js src/hooks/useDailySales.js src/components/daily-sales/DailySalesForm.jsx src/pages/DailySales/index.jsx
git status --short
git add src/utils/quantity.js src/hooks/useDailySales.js src/components/daily-sales/DailySalesForm.jsx src/pages/DailySales/index.jsx
git commit -m "feat: use integer daily sales quantities"
```

Confirm no backend, service, or unrelated page files changed.

### Task 3: Final Verification

**Files:**
- Verify: `src/utils/quantity.js`
- Verify: `src/hooks/useDailySales.js`
- Verify: `src/components/daily-sales/DailySalesForm.jsx`
- Verify: `src/pages/DailySales/index.jsx`

**Interfaces:**
- Consumes the shared normalizer and produces the existing Daily Sales API payload shape with integer quantity strings.

- [ ] **Step 1: Check for remaining decimal form configuration**

Search the Daily Sales form and page:

```bash
rg -n "step=\"0\.01\"|maximumFractionDigits: 2|function decimal|Enter a valid decimal" src/components/daily-sales src/pages/DailySales src/hooks/useDailySales.js
```

Expected: no matches.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: Vite completes successfully. Existing bundle-size warnings are acceptable.

- [ ] **Step 3: Review final status**

```bash
git status --short
```

Expected: the working tree is clean and only the intended commits are present.
