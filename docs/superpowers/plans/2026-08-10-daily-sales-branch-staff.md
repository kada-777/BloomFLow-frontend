# Branch Staff Daily Sales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Branch Staff Daily Sales page with a Most Recent Sales table, Add Sales workflow, and read-only damaged-quantity detail view.

**Architecture:** Follow the existing Receiving page pattern: a service layer wraps API calls, a `useDailySales` hook owns asynchronous and modal state, and focused page/modal components render the UI. The existing backend contract is used unchanged; list results are flattened into flower-level table rows while detail requests use the parent daily-sale ID.

**Tech Stack:** React 19, React Router, Axios, lucide-react, existing BloomFlow CSS variables and common components, Vite.

## Global Constraints

- Use the existing daily-sales API routes; extend the daily-sales list response to include item summaries without adding a damage-reason field.
- The Add Sales date defaults to today but remains selectable.
- The table columns are exactly `Date`, `Flower`, `Sold Qty`, `Damaged Qty`, and `Action`.
- No damage explanation or notes are collected or persisted.
- Use the existing BloomFlow warm beige background, white cards, muted text, pink accent, sage actions, rounded borders, subtle shadows, Inter and Plus Jakarta Sans typography, and existing modal/table conventions.
- Do not modify the database schema; the daily-sales list service may be extended to select existing item fields.
- Do not create commits for this work.

---

## File Map

| File | Responsibility |
| --- | --- |
| `src/services/dailySalesService.js` | List, detail, create, and flower-option API calls. |
| `src/hooks/useDailySales.js` | Daily-sales list, flattened rows, flower options, form state, modal state, validation, submit, and refresh. |
| `src/pages/DailySales/index.jsx` | Page header, notices, table, and modal composition. |
| `src/pages/DailySales/daily-sales.css` | Daily Sales page, form, and detail modal styles, including mobile layout. |
| `src/components/daily-sales/DailySalesForm.jsx` | Add Sales modal fields and repeatable flower rows. |
| `src/components/daily-sales/DailySalesDetail.jsx` | Read-only daily-sale detail modal. |
| `src/App.jsx` | Protected `/daily-sales` route. |
| `src/layouts/AppLayout.jsx` | Branch Staff sidebar item. |

---

### Task 1: Add the Daily Sales API Service

**Files:**
- Create: `src/services/dailySalesService.js`

**Interfaces:**
- Produces `dailySalesService.list()`, `dailySalesService.getById(id)`, `dailySalesService.create(payload)`, and `dailySalesService.listFlowers()`.
- Each method unwraps `response.data?.data ?? response.data`, matching `receivingService.js`.

- [ ] **Step 1: Define the service methods against the existing API contract**

  Use the shared Axios instance and these exact requests:

  ```js
  import api from "./api";

  function unwrap(response) {
    return response.data?.data ?? response.data;
  }

  export const dailySalesService = {
    async list() {
      return unwrap(await api.get("/daily-sales", { params: { limit: "100" } }));
    },
    async getById(id) {
      return unwrap(await api.get(`/daily-sales/${id}`));
    },
    async create(payload) {
      return unwrap(await api.post("/daily-sales", payload));
    },
    async listFlowers() {
      return unwrap(await api.get("/flowers", { params: { limit: "100" } }));
    },
  };
  ```

- [ ] **Step 2: Verify the service file has no backend or schema changes**

  Run `git status --short` from `BloomFLow-frontend` and confirm only the new frontend service file is changed at this stage.

---

### Task 2: Build the Daily Sales State and Validation Hook

**Files:**
- Create: `src/hooks/useDailySales.js`

**Interfaces:**
- Consumes `dailySalesService` and `getApiError`.
- Produces `useDailySales()` with `sales`, `tableRows`, `flowers`, `loading`, `error`, `refresh`, `openCreate`, `closeCreate`, `formOpen`, `submitCreate`, `submitting`, `formError`, `openDetail`, `closeDetail`, `detail`, `detailLoading`, and `detailError`.
- Produces `emptyDailySalesItem()` and `emptyDailySalesForm()` for the form component.

- [ ] **Step 1: Add pure form helpers and validation**

  Use string values while editing so decimal input is not corrupted. The initial form must be:

  ```js
  {
    salesDate: new Date().toISOString().slice(0, 10),
    items: [{ flowerId: "", soldQuantity: "", damagedQuantity: "" }],
  }
  ```

  Validate a required date, a selected unique flower in every row, decimal values matching `^\d+(\.\d{1,2})?$`, and `Number(soldQuantity) + Number(damagedQuantity) > 0`. Return field errors keyed as `items.${index}.flowerId`, `items.${index}.soldQuantity`, and `items.${index}.damagedQuantity`, plus `salesDate` and `items` as needed.

- [ ] **Step 2: Implement list and flower loading**

  On mount, call `dailySalesService.list()` and `dailySalesService.listFlowers()` with `Promise.allSettled`. Normalize either an array or `{ data: [] }` response. Store the first request error as the page error, store flower loading failures as an error when the list succeeds, and always clear loading in `finally`.

- [ ] **Step 3: Flatten list records into table rows**

  For each daily-sale record, create one row per `items` entry with this shape:

  ```js
  {
    rowId: `${sale.id}-${item.id}`,
    saleId: sale.id,
    salesDate: sale.salesDate,
    flowerName: item.flower?.name || `Flower #${item.flowerId}`,
    soldQuantity: item.soldQuantity,
    damagedQuantity: item.damagedQuantity,
  }
  ```

  Sort source sales in the API order and preserve each item’s API order. An empty item list produces no rows and lets the table empty state render.

- [ ] **Step 4: Implement create and detail modal state**

  `openCreate` resets the form to today, clears form errors, and opens the Add Sales modal. `openDetail(id)` opens the detail modal, clears the previous detail, loads `dailySalesService.getById(id)`, and reports a readable API error. `submitCreate(form)` validates first; when valid, normalize IDs to numbers and quantities to trimmed strings, call `dailySalesService.create`, close the form, refresh the list, and expose a success message. Keep entered values visible when the API rejects the request.

- [ ] **Step 5: Verify hook behavior through the frontend build**

  Run `npm run build` from `BloomFLow-frontend`. Expected result: Vite completes successfully with no import or syntax errors.

---

### Task 3: Implement Add Sales and Detail Components

**Files:**
- Create: `src/components/daily-sales/DailySalesForm.jsx`
- Create: `src/components/daily-sales/DailySalesDetail.jsx`
- Create: `src/pages/DailySales/daily-sales.css`

**Interfaces:**
- `DailySalesForm` accepts `open`, `form`, `flowers`, `onChange`, `onAddItem`, `onRemoveItem`, `onSubmit`, `onClose`, `submitting`, and `error`.
- `DailySalesDetail` accepts `open`, `detail`, `loading`, `error`, and `onClose`.
- Both components use the existing `.modal-backdrop` convention and scoped Daily Sales class names.

- [ ] **Step 1: Render the Add Sales modal fields**

  Render a dialog titled `Add Sales`, a date input bound to `form.salesDate`, one item card per `form.items`, and an Add Flower button. Each item card must render a Flower `<select>`, Sold Qty input, Damaged Qty input, inline field errors, and a remove button disabled or hidden for the final remaining row. Disable form controls during submission and expose `aria-label`s for add/remove actions.

- [ ] **Step 2: Render the read-only detail modal**

  Render a dialog titled `Sales Detail`. Show the formatted sales date and an item table with Flower, Sold Qty, and Damaged Qty. Show `Memuat detail...` while loading, the API error with a retry/close-safe presentation on error, and `-` for missing flower names. Do not render a reason, notes, or implied damage explanation.

- [ ] **Step 3: Add scoped responsive styles**

  Use existing variables for colors, border, shadow, card, and typography. Add styles for the modal shell, item rows, field errors, quantity inputs, detail list, and primary/secondary buttons. At `max-width: 760px`, stack item fields, make modal content fit the viewport, and retain horizontal scrolling for the table.

- [ ] **Step 4: Verify component behavior in the browser after page wiring**

  Confirm Add Flower appends one row, Remove deletes only the selected row, duplicate flowers are rejected, zero-total rows are rejected, and detail shows damaged quantities without any damage-reason field.

---

### Task 4: Wire the Page, Route, and Branch Staff Sidebar

**Files:**
- Create: `src/pages/DailySales/index.jsx`
- Modify: `src/App.jsx:4-16,28-41`
- Modify: `src/layouts/AppLayout.jsx:5-18,84-107`
- Modify: `src/pages/DailySales/daily-sales.css` if page-level styles are needed

**Interfaces:**
- `DailySales` consumes the object returned by `useDailySales` and passes the exact component props from Task 3.
- Route `/daily-sales` renders the page inside the existing protected `AppLayout`.
- Only the `Branch Staff` menu receives the new navigation item.

- [ ] **Step 1: Add the Branch Staff menu item**

  Import a suitable existing `lucide-react` icon such as `ReceiptText` and insert `["Daily Sales", ReceiptText, "/daily-sales"]` in the Branch Staff `DAILY OPERATIONS` items. Do not add the item to Super Admin or Head Office menus.

- [ ] **Step 2: Add the protected route**

  Import `DailySales` and add `<Route path="/daily-sales" element={<DailySales />} />` alongside the existing protected routes.

- [ ] **Step 3: Compose the page**

  Render:

  ```jsx
  <div className="daily-sales-page">
    <header className="daily-sales-page-header">
      <div>
        <p className="daily-sales-page-eyebrow">BRANCH OPERATIONS</p>
        <h1>Most Recent Sales</h1>
        <p>Record and review daily flower sales for your branch.</p>
      </div>
      <button className="button" type="button" onClick={dailySales.openCreate}>Add Sales</button>
    </header>
  </div>
  ```

  Add `ActionNotice` for page errors and success, `GenericDataTable` with exactly the five requested data columns, and a `View Detail` button in the Action column that calls `dailySales.openDetail(row.saleId)`. Pass `rowKey={(row) => row.rowId}`.

- [ ] **Step 4: Run the production build**

  Run `npm run build` from `BloomFLow-frontend`. Expected result: successful Vite build with the new route, service, hook, and component imports resolved.

---

### Task 5: End-to-End Manual Verification

**Files:**
- Verify: `src/App.jsx`, `src/layouts/AppLayout.jsx`, `src/pages/DailySales/index.jsx`, `src/hooks/useDailySales.js`, `src/services/dailySalesService.js`, and Daily Sales component/CSS files.

- [ ] **Step 1: Start the frontend**

  Run `npm run dev` from `BloomFLow-frontend` while the backend is running with a Branch Staff account.

- [ ] **Step 2: Verify role navigation**

  Log in as Branch Staff and confirm Daily Sales appears under DAILY OPERATIONS and opens `/daily-sales`. Confirm the new item is not added to the other role menus.

- [ ] **Step 3: Verify list rendering**

  Confirm recent records load, multi-flower sales become separate rows, dates and quantities render correctly, and each View Detail button targets its parent sale ID. Verify loading, empty, and API-error states.

- [ ] **Step 4: Verify Add Sales**

  Open Add Sales, confirm the date defaults to today but can be changed, add multiple unique flowers, enter sold/damaged quantities, submit, and confirm the new records appear after refresh. Try a duplicate flower, zero-total row, invalid decimal, duplicate date, and insufficient stock; confirm errors are visible and entered values remain.

- [ ] **Step 5: Verify detail and responsive behavior**

  Open View Detail for a sale with damaged quantity and confirm the quantity is shown without a reason field. Resize to mobile width and confirm the form stacks, the modal fits, and the table scrolls horizontally.

- [ ] **Step 6: Confirm worktree scope**

  Run `git status --short` from both frontend and backend repositories. Confirm no backend file changed and do not create a commit.
