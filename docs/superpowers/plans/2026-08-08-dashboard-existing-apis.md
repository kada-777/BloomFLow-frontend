# BloomFlow Dashboard Existing APIs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, componentized Dashboard using only currently available backend APIs and explicit `Awaiting backend support` states for unsupported widgets.

**Architecture:** `Dashboard/index.jsx` only orchestrates layout and passes props from `useDashboard`. The hook owns all dashboard state and calls `dashboardService.js`, which reuses the existing Axios client. Components under `src/components/dashboard/` are presentation-focused and accept future-compatible data props. Dashboard styles are isolated in `src/style.css`.

**Tech Stack:** React functional components and hooks, existing Axios client, Recharts, Framer Motion conventions already used by the project, existing CSS variables.

## Global Constraints

- Do not modify or create backend code or endpoints.
- Do not modify `src/layouts/AppLayout.jsx`, `src/nav.css`, Sidebar, or Navbar.
- Reuse `src/services/api.js`; do not create another Axios client.
- `useDashboard` is the single source of truth for all Dashboard data.
- Use `Promise.allSettled()` for the dashboard resource fetches.
- Do not use mock data, hardcoded statistics, or fake chart values.
- Unsupported widgets remain visible and display exactly `Awaiting backend support`.
- Flower status charts may contain only `Fresh`, `Grade C`, and `Damaged`.

---

### Task 1: Add Dashboard API Service and Hook

**Files:**
- Create: `src/services/dashboardService.js`
- Create: `src/hooks/useDashboard.js`

**Interfaces:**
- Consumes: `src/services/api.js`, `user.role`, `user.branchId`, and existing backend endpoint response envelopes.
- Produces: `useDashboard()` returning `data`, `loading`, `error`, `resourceErrors`, `selectedBranch`, `setSelectedBranch`, and `refresh`.

- [ ] **Step 1: Define service methods using the existing API client**

Create a small unwrapping helper that handles both `{ data: ... }` and direct payloads, then export:

```js
import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const dashboardService = {
  async getBranches() {
    return unwrap(await api.get("/branches", { params: { limit: "100" } }));
  },
  async getFarms() {
    return unwrap(await api.get("/farms", { params: { limit: "100" } }));
  },
  async getHeadOfficeInventory() {
    return unwrap(await api.get("/inventory/head-office", { params: { limit: "100" } }));
  },
  async getBranchInventory() {
    return unwrap(await api.get("/inventory/branches", { params: { limit: "100" } }));
  },
  async getMyBranchInventory() {
    return unwrap(await api.get("/inventory/my-branch", { params: { limit: "100" } }));
  },
  async getDailySales() {
    return unwrap(await api.get("/daily-sales", { params: { limit: "100" } }));
  },
  async getReceivings() {
    return unwrap(await api.get("/receivings", { params: { limit: "100" } }));
  },
};
```

- [ ] **Step 2: Add pure normalization helpers inside the hook**

Normalize pagination envelopes to arrays, decimal strings to numbers only for display aggregation, and statuses only through this whitelist:

```js
const FLOWER_STATUSES = [
  { key: "FRESH", label: "Fresh" },
  { key: "GRADE_C", label: "Grade C" },
  { key: "DAMAGED", label: "Damaged" },
];
```

Aggregate branch stock by selected branch and status, aggregate HO stock from `totalAvailable`, and merge daily sales/receiving rows into newest-first activities. Do not derive revenue, forecast, transit, top sales, or distribution status without API fields.

- [ ] **Step 3: Implement `useDashboard()` with `Promise.allSettled()`**

Use the authenticated user role to select permitted requests. For Super Admin and Head Office, request branches, farms, HO inventory, branch inventory, daily sales, and receivings. For Branch Staff, request my-branch inventory and daily sales; do not call `/branches`, `/farms`, `/inventory/head-office`, or `/receivings` because the backend rejects that role.

Store each fulfilled resource separately and each rejected resource in `resourceErrors`, so supported widgets still render. Expose `refresh()` by incrementing a request key or rerunning the fetch callback. Keep `selectedBranch` in hook state; reset it to `all` if the selected branch no longer exists.

- [ ] **Step 4: Run the production build**

Run from `BloomFLow-frontend`:

```bash
npm run build
```

Expected: Vite builds successfully with the new service and hook.

- [ ] **Step 5: Commit the data layer**

```bash
git add -- src/services/dashboardService.js src/hooks/useDashboard.js
git commit -m "feat: add dashboard data hook"
```

### Task 2: Create Reusable Dashboard Components

**Files:**
- Create: `src/components/dashboard/DashboardHeader.jsx`
- Create: `src/components/dashboard/SummaryCard.jsx`
- Create: `src/components/dashboard/SummaryCards.jsx`
- Create: `src/components/dashboard/BranchSelector.jsx`
- Create: `src/components/dashboard/FlowerStatusPieChart.jsx`
- Create: `src/components/dashboard/TopFlowerSalesChart.jsx`
- Create: `src/components/dashboard/RevenueChart.jsx`
- Create: `src/components/dashboard/DistributionStatusChart.jsx`
- Create: `src/components/dashboard/RecentActivityTable.jsx`
- Create: `src/components/dashboard/DashboardSkeleton.jsx`

**Interfaces:**
- Consumes: normalized props from `useDashboard()`.
- Produces: responsive presentation components with loading, empty, error, and unsupported states.

- [ ] **Step 1: Implement shared card and unsupported states**

`SummaryCard` accepts `{ label, value, note, status, icon }`. For unsupported summary metrics, render the value area as `Awaiting backend support` instead of a number. Chart components accept `{ data, loading, error, unsupported }` and share the same card shell and retry/error presentation.

- [ ] **Step 2: Implement `SummaryCards` with all six required cards**

Render cards for Total Branches, Total Farms, Head Office Stock, Forecast Harvested, Total Branch Stock, and Flowers In Transit. Pass only hook-provided values. Forecast Harvested and Flowers In Transit receive `unsupported: true` and never receive fallback numeric values.

- [ ] **Step 3: Implement BranchSelector**

Accept `{ branches, selectedBranch, onChange, disabled, loading, error }`. Authorized roles render an `All Branches` option plus real branch names from the API. Branch Staff renders a disabled select with `My Branch`. Do not hardcode branch names.

- [ ] **Step 4: Implement the Flower Status Pie Chart**

Use Recharts `ResponsiveContainer`, `PieChart`, `Pie`, `Cell`, `Tooltip`, and `Legend`. Render exactly the normalized three-status data entries. Never create entries for Grade A, Grade B, or Reject. Show an empty state when inventory has no rows and a backend-support note only if the inventory resource is unavailable.

- [ ] **Step 5: Implement unsupported chart components**

`TopFlowerSalesChart`, `RevenueChart`, and `DistributionStatusChart` remain reusable cards that accept future data props but render `Awaiting backend support` when `unsupported` is true. Do not insert placeholder series or fake axes values.

- [ ] **Step 6: Implement RecentActivityTable and DashboardSkeleton**

`RecentActivityTable` accepts normalized activities and renders the newest entries only, with loading, error, and empty states. `DashboardSkeleton` renders card and chart skeleton blocks without hardcoded business values.

### Task 3: Compose the Dashboard Page

**Files:**
- Modify: `src/pages/Dashboard/index.jsx`

**Interfaces:**
- Consumes: `useDashboard()` and all dashboard components.
- Produces: page content only, without changing Sidebar/Navbar or route definitions.

- [ ] **Step 1: Replace the current API placeholder page**

Keep the existing role-aware title/subtitle behavior, call `useDashboard()` once, and render `DashboardHeader`, `SummaryCards`, branch selector plus pie chart, unsupported charts, and recent activities. Pass the hook's values directly into components; do not call `api` from the page.

- [ ] **Step 2: Render loading and retry states**

While the first request is loading, render `DashboardSkeleton` below the existing page header. For resource failures, let individual widgets show their error state and pass `refresh` to a retry button. Keep the page usable when only unsupported or unauthorized resources fail.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: Vite builds successfully and no existing route/layout file is changed.

### Task 4: Add Dashboard-Only Responsive Styling

**Files:**
- Modify: `src/style.css` by appending Dashboard-specific selectors only.

**Interfaces:**
- Consumes: class names emitted by `src/pages/Dashboard/index.jsx` and `src/components/dashboard/*`.
- Produces: responsive desktop, tablet, and mobile Dashboard layout without changing Navbar or Sidebar selectors.

- [ ] **Step 1: Add isolated Dashboard selectors**

Use a `.dashboard-page` root and scoped descendants for the summary grid, chart grid, chart cards, selector, table, loading skeleton, empty state, and unsupported state. Reuse `var(--card)`, `var(--border)`, `var(--soft)`, `var(--text)`, `var(--muted)`, `var(--accent)`, and `var(--shadow)`.

- [ ] **Step 2: Add responsive breakpoints**

Use CSS grid changes to move from six summary cards across desktop to two columns on tablet and one column on narrow mobile. Chart cards should use `minmax(0, 1fr)` and keep Recharts containers at a defined height so `ResponsiveContainer` can measure them.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: Vite builds successfully and existing Navbar/Sidebar selectors remain unchanged.

### Task 5: Verify API Boundaries and Dashboard States

**Files:**
- Verify: `src/pages/Dashboard/index.jsx`
- Verify: `src/hooks/useDashboard.js`
- Verify: `src/services/dashboardService.js`
- Verify: `src/components/dashboard/*`
- Verify: `src/style.css`

- [ ] **Step 1: Verify only existing API paths are used**

Search the Dashboard implementation and confirm all requests are exactly `/branches`, `/farms`, `/inventory/head-office`, `/inventory/branches`, `/inventory/my-branch`, `/daily-sales`, and `/receivings`. Confirm no `/dashboard`, distribution, forecast, revenue, or invented endpoint is referenced.

- [ ] **Step 2: Verify no fake data exists**

Search Dashboard files for hardcoded flower names, branch names, numeric chart series, and prohibited status labels. Confirm unsupported widgets contain only the explicit `Awaiting backend support` state.

- [ ] **Step 3: Verify the pie chart whitelist**

Confirm the only chart status keys are `FRESH`, `GRADE_C`, and `DAMAGED`, with visible labels `Fresh`, `Grade C`, and `Damaged`.

- [ ] **Step 4: Run final checks**

```bash
git diff --check
npm run build
git status --short
```

Expected: no whitespace errors, build succeeds, and no Sidebar/Navbar/backend files are modified by this Dashboard work.
