# BloomFlow Head Office Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution requested by the user). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Head Office Inventory frontend page using the existing aggregate inventory API while preserving the PRD layout and explicitly marking unavailable batch data.

**Architecture:** `inventoryService.js` wraps the existing `/inventory/head-office` API. `useHeadOfficeInventory` owns loading, error, client-side search, status filter, and summary aggregation. The page composes existing PageHeader/StatisticCard/StatusBadge/GenericDataTable/SearchBar patterns and a scoped Inventory toolbar.

**Tech Stack:** React functional components/hooks, existing Axios client, existing reusable components, CSS variables, React Router.

## Global Constraints

- Do not create or modify backend code, database schema, migration, or endpoint.
- Use only `GET /inventory/head-office`.
- Real API fields are `flowerId`, `flowerName`, `variety`, and `totalAvailable`.
- Do not fabricate batch number, farm, received date, initial quantity, used quantity, status, or batch counts.
- Unavailable values render `Data belum tersedia`.
- Preserve the existing Head Office Sidebar menu entry and only add the missing frontend route.
- Use existing BloomFlow design system and reusable components.

---

### Task 1: Add Inventory Service and Hook

**Files:**
- Create: `src/services/inventoryService.js`
- Create: `src/hooks/useHeadOfficeInventory.js`

**Interfaces:**
- Consumes: existing `src/services/api.js` and `/inventory/head-office` response.
- Produces: inventory rows, summary values, search/status filter state, loading/error, and refresh.

- [ ] **Step 1: Implement the service**

Use the existing Axios client:

```js
import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const inventoryService = {
  async getHeadOfficeInventory() {
    return unwrap(await api.get("/inventory/head-office", { params: { limit: "100" } }));
  },
};
```

- [ ] **Step 2: Implement the hook state and normalization**

Normalize the response to an array. Expose `rows`, `filteredRows`, `searchTerm`, `setSearchTerm`, `statusFilter`, `setStatusFilter`, `loading`, `error`, and `refresh`. Search only `flowerName` and `variety`. Since the active endpoint returns available-only aggregate rows and no `status`, do not infer status; `Available` uses returned rows, `Depleted` returns an empty unsupported state, and `All` returns the returned rows.

Compute only:

```js
totalAvailableStock = rows.reduce((sum, row) => sum + Number(row.totalAvailable), 0);
```

Return `totalBatches`, `depletedBatches`, and `utilizationRate` as unavailable values rather than calculations.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: build succeeds with the service and hook added.

### Task 2: Implement Head Office Inventory Page

**Files:**
- Create: `src/pages/HeadOfficeInventory/index.jsx`
- Create: `src/pages/HeadOfficeInventory/head-office-inventory.css`
- Modify: `src/App.jsx` to register `/head-office-inventory`.

**Interfaces:**
- Consumes: `useHeadOfficeInventory`, PageHeader, StatisticCard, StatusBadge, GenericDataTable, SearchBar, and existing state patterns.
- Produces: PRD-shaped Inventory page with real aggregate rows and explicit unavailable placeholders.

- [ ] **Step 1: Register the protected route**

Import `HeadOfficeInventory` and add:

```jsx
<Route path="/head-office-inventory" element={<HeadOfficeInventory />} />
```

Do not alter `AppLayout.jsx` because the Head Office menu already contains this path.

- [ ] **Step 2: Render Page Header and Summary Cards**

Use the existing PageHeader pattern with an inventory-specific title/subtitle. Render four reusable cards:

- Total Available Stock: actual sum from `totalAvailable`.
- Total Batches: `Data belum tersedia`.
- Depleted Batches: `Data belum tersedia`.
- Utilization Rate: `Data belum tersedia`.

Do not use a zero, percentage estimate, or derived batch count as a fallback.

- [ ] **Step 3: Render Toolbar**

Reuse SearchBar and add a scoped status select with `All`, `Available`, and `Depleted`. Display a small unavailable hint when `Depleted` is selected because the active endpoint excludes depleted rows.

- [ ] **Step 4: Render GenericDataTable**

Render API-backed columns:

- Flower from `flowerName`.
- Variety from `variety`.
- Available Quantity from `totalAvailable`.

Keep the PRD batch columns in the table structure only when represented as unavailable placeholders: Batch Number, Farm, Received Date, Initial Quantity, Used Quantity, and Status. Use `Data belum tersedia` for those cells and do not create a status badge from guessed data. Keep long Flower/Variety names ellipsized with `title` for full text.

- [ ] **Step 5: Add loading, error, and empty states**

Use GenericDataTable loading/empty behavior and an error notice with retry. If status is Depleted, show a clear `Data belum tersedia` state instead of pretending the API returned no depleted batches.

- [ ] **Step 6: Add scoped responsive styling**

Use existing cards, table, toolbar, spacing, typography, borders, shadows, and palette variables. Use a responsive summary grid and horizontal table scrolling on narrow screens. Do not modify Sidebar/Navbar CSS.

- [ ] **Step 7: Run the production build**

```bash
npm run build
```

Expected: route compiles and the page uses only existing aggregate inventory data.

### Task 3: Verify API and Data Boundaries

**Files:**
- Verify: `src/services/inventoryService.js`
- Verify: `src/hooks/useHeadOfficeInventory.js`
- Verify: `src/pages/HeadOfficeInventory/*`
- Verify: `src/App.jsx`

- [ ] **Step 1: Verify endpoint whitelist**

Confirm the feature references only `/inventory/head-office`; no batch endpoint, database access, or new API path exists.

- [ ] **Step 2: Verify field whitelist**

Confirm real values come only from `flowerId`, `flowerName`, `variety`, and `totalAvailable`. Confirm no batch data is calculated or fabricated.

- [ ] **Step 3: Verify filter behavior**

Confirm search matches Flower/Variety, `All` and `Available` show API rows, and `Depleted` displays unavailable state.

- [ ] **Step 4: Run final checks**

```bash
npm run build
```

Expected: no whitespace errors, build succeeds, and no backend/database/schema files are modified.
