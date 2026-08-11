# BloomFlow Head Office Receiving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution requested by the user). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Head Office Receiving page at `/receiving` using existing APIs and reusable BloomFlow components, with create/view form modes and dynamic receiving items.

**Architecture:** `receivingService.js` wraps `/receivings`, `/receivings/:id`, `/farms`, and `/flowers`. `useReceiving` owns list, filters, detail, form, and request state. `ReceivingPage` composes the existing GenericDataTable/SearchBar/Modal patterns, while `ReceivingFormCard` and `FlowerItemCard` provide the reusable form and dynamic item row.

**Tech Stack:** React functional components/hooks, existing Axios client, React Router, existing GenericDataTable/SearchBar/Modal/Empty/Loading patterns, CSS variables, lucide-react.

## Global Constraints

- Do not create or modify backend code, database schema, migration, or API endpoint.
- Use only existing `GET /receivings`, `GET /receivings/:id`, `POST /receivings`, `GET /farms`, and `GET /flowers` APIs.
- Head Office creates Receiving; Superadmin and Head Office may list/view according to backend access.
- Do not expose Edit/Delete actions until PATCH/DELETE Receiving endpoints exist.
- The item add button adds exactly one item group containing Flower, Accepted Quantity, and Unusable Quantity plus the API-required shipment fields.
- Use only API-backed fields and no dummy IDs, Farms, Flowers, quantities, or statuses.
- Preserve existing Sidebar/Navbar structure; only add the missing frontend route if needed.

---

### Task 1: Add Receiving Service and Hook

**Files:**
- Create: `src/services/receivingService.js`
- Create: `src/hooks/useReceiving.js`

**Interfaces:**
- Consumes: existing `src/services/api.js`, `masterDataService` or its existing API patterns, and role-safe backend paths.
- Produces: list/detail/create methods and hook state for records, filters, detail, form mode, loading, errors, and refresh.

- [ ] **Step 1: Implement service methods**

Use the existing Axios client and response envelope unwrapping:

```js
export const receivingService = {
  async list() {
    return unwrap(await api.get("/receivings", { params: { limit: "100" } }));
  },
  async getById(id) {
    return unwrap(await api.get(`/receivings/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post("/receivings", payload));
  },
  async listFarms() {
    return unwrap(await api.get("/farms", { params: { limit: "100" } }));
  },
  async listFlowers() {
    return unwrap(await api.get("/flowers", { params: { limit: "100" } }));
  },
};
```

Do not add `update` or `remove` methods because the backend has no PATCH/DELETE Receiving endpoints.

- [ ] **Step 2: Implement useReceiving state and filters**

The hook returns `receivings`, `filteredReceivings`, `farms`, `flowers`, `searchTerm`, `selectedFarm`, `selectedDate`, setters, `loading`, `error`, `refresh`, `detail`, `detailLoading`, `detailError`, `openDetail`, `closeDetail`, `formMode`, `formOpen`, `openCreate`, `closeForm`, `submitCreate`, and `submitting`.

Load Receiving list, Farms, and Flowers through `Promise.allSettled()` so a farm/flower resource error is reported without hiding an already-loaded list. Filter client-side by Receiving ID, farm name/ID, date, and selected farm because the current backend list service only consumes pagination.

- [ ] **Step 3: Normalize and validate the create payload**

Create state must use this exact shape:

```js
{
  farmId: "",
  receivedDate: "",
  items: [{
    flowerId: "",
    shippedQuantity: "",
    actualReceivedQuantity: "",
    acceptedQuantity: "",
    unusableQuantity: "",
    unusableNotes: "",
  }],
}
```

Before submit, validate farm/date, at least one item, unique flower IDs, decimal quantities, `actualReceivedQuantity <= shippedQuantity`, and `acceptedQuantity + unusableQuantity === actualReceivedQuantity`. Send numeric IDs and decimal strings expected by the backend; send `unusableNotes` as trimmed text or `null`.

- [ ] **Step 4: Run the production build**

```bash
npm run build
```

Expected: build succeeds with the new service and hook unused by routes.

### Task 2: Implement Reusable Receiving Form Components

**Files:**
- Create: `src/components/receiving/FlowerItemCard/FlowerItemCard.jsx`
- Create: `src/components/receiving/FlowerItemCard/FlowerItemCard.css`
- Create: `src/components/receiving/ReceivingFormCard/ReceivingFormCard.jsx`
- Create: `src/components/receiving/ReceivingFormCard/ReceivingFormCard.css`

**Interfaces:**
- Consumes: Receiving form state, Farms, Flowers, validation errors, mode, and submit/close callbacks.
- Produces: create/view/edit-compatible form UI and dynamic item groups.

- [ ] **Step 1: Implement FlowerItemCard**

Accept `{ index, item, flowers, errors, readOnly, canRemove, onChange, onRemove }`. Render Flower dropdown, Shipped Quantity, Actual Received Quantity, Accepted Quantity, Unusable Quantity, and Unusable Notes. In read-only mode render values without editable controls. Render the remove button only when `canRemove` is true, which is when the parent has more than one item.

- [ ] **Step 2: Implement ReceivingFormCard header and main fields**

Compose the existing Modal. Render Receiving ID as backend readonly value or `Generated after submit`, Received Date as a date input, and Farm as a real Farm dropdown. In view mode all controls are readonly. Edit mode uses the same structure but is not opened by the current list because no PATCH API exists.

- [ ] **Step 3: Implement dynamic item array**

Render `items.map()` using `FlowerItemCard`. The `+ Tambah Jenis Bunga` button appends exactly one new item object. It must not add a second form or duplicate header fields. Removing an item updates the array and leaves at least one item.

- [ ] **Step 4: Implement submit, loading, error, and success states**

Submit is disabled while pending. Display field-level validation errors, API error feedback, and a success notice after POST completion. Close the form only after a successful response and refresh the list.

- [ ] **Step 5: Add themed responsive CSS**

Use existing `--card`, `--bg`, `--soft`, `--border`, `--text`, `--muted`, `--accent`, and `--sage` variables. Keep warm beige header accents, 18–20px radius, subtle shadow, mobile one-column stacking, and consistent input/button sizes.

- [ ] **Step 6: Run the production build**

```bash
npm run build
```

Expected: form components compile without route integration errors.

### Task 3: Add Receiving Page and Frontend Route

**Files:**
- Create: `src/pages/Receiving/index.jsx`
- Create: `src/pages/Receiving/receiving.css`
- Modify: `src/App.jsx` to register `/receiving`.

**Interfaces:**
- Consumes: `useReceiving`, GenericDataTable, SearchBar, Modal, ReceivingFormCard, FlowerItemCard, and existing notice/empty/loading patterns.
- Produces: Head Office Receiving list with filters and view/create interactions.

- [ ] **Step 1: Register the missing route**

Import the new page in `App.jsx` and add `<Route path="/receiving" element={<Receiving />} />` inside the existing protected routes. Do not change the existing sidebar menu because the Head Office menu already points to `/receiving`.

- [ ] **Step 2: Implement page header and filter area**

Render title, subtitle, and `+ New Receiving` button. Reuse SearchBar for search, a real date input for date filtering, and a Farm select populated from `useReceiving.farms`. Do not hardcode Farm options.

- [ ] **Step 3: Implement Receiving GenericDataTable columns**

Use only list response fields:

- Receiving ID from `id`.
- Received Date from `receivedDate`.
- Farm from `farm.id`/`farm.name` and `farmId`.
- Flower Summary from `_count.items` or an API-backed count summary.
- Action only `View Detail`; do not render Edit/Delete because no corresponding backend endpoints exist.

When the Farm name or summary is long, constrain it with CSS ellipsis and provide the full value through `title`.

- [ ] **Step 4: Integrate create and view modes**

New Receiving opens `ReceivingFormCard` in create mode. View Detail calls `openDetail(id)` and opens the same component in view mode with `GET /receivings/:id` data. Pass real Farms and Flowers into the form.

- [ ] **Step 5: Add page loading, empty, error, and success feedback**

Use existing reusable states. Allow retry through `refresh()`. Display a success notice after a successful POST and keep the list synchronized by refreshing from the API.

- [ ] **Step 6: Add page-specific responsive styling**

Keep the BloomFlow page header/card/table visual language. Stack filters and form fields on mobile, preserve table horizontal scrolling, and avoid changing Sidebar/Navbar selectors.

- [ ] **Step 7: Run the production build**

```bash
npm run build
```

Expected: `/receiving` compiles, route is protected, and Head Office menu navigation resolves correctly.

### Task 4: Verify PRD/API Behavior and Final Scope

**Files:**
- Verify: `src/pages/Receiving/index.jsx`
- Verify: `src/components/receiving/ReceivingFormCard/*`
- Verify: `src/components/receiving/FlowerItemCard/*`
- Verify: `src/hooks/useReceiving.js`
- Verify: `src/services/receivingService.js`
- Verify: `src/App.jsx`
- Verify: `src/layouts/AppLayout.jsx`

- [ ] **Step 1: Verify endpoint whitelist and roles**

Confirm only `/receivings`, `/receivings/:id`, `/farms`, and `/flowers` are referenced by the Receiving feature. Confirm no PATCH/DELETE Receiving request exists and no backend files changed.

- [ ] **Step 2: Verify PRD validation**

Confirm the UI validates `acceptedQuantity + unusableQuantity = actualReceivedQuantity`, `actualReceivedQuantity <= shippedQuantity`, unique flowers, non-negative decimals, and that only accepted quantity is described as inventory-producing in the UI copy if such copy is shown.

- [ ] **Step 3: Verify dynamic items and mode behavior**

Confirm Add Item adds one item group, remove appears only with more than one item, view mode is readonly, create mode submits, and edit mode exists structurally without an unavailable PATCH action.

- [ ] **Step 4: Run final checks**

```bash
npm run build
```

Expected: no whitespace errors, build succeeds, no backend/database/schema changes, and no dummy values.
