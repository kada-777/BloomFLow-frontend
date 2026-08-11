# Frontend List Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side pagination controls to the primary list tables used by Super Admin, Head Office, and Branch Staff.

**Architecture:** Reuse the backend's existing `{ data, pagination }` response contract. Service methods will preserve both values, page-level hooks will own page state, and a shared `Pagination` component will render controls below `DataTable` and `GenericDataTable`. Dashboard aggregate widgets and reference dropdown datasets remain unchanged because they need full datasets rather than paged list results.

**Tech Stack:** React, existing Axios client, CSS variables, Vite.

## Global Constraints

- Backend pagination already accepts `page` and `limit` and returns `totalItems`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
- Keep role scoping enforced by the backend.
- Use server-side pagination; do not fetch all records and slice them only in the browser.
- Reset the active page to `1` when a server-side search or filter changes.
- Keep existing loading, error, empty, create, edit, delete, and detail behaviors.
- Do not paginate Dashboard aggregate resources or reference option lists used by forms.

---

### Task 1: Add Shared Pagination Presentation

**Files:**
- Create: `src/components/common/Pagination/Pagination.jsx`
- Create: `src/components/common/Pagination/Pagination.css`

**Interfaces:**
- Consumes: `{ pagination, onPageChange, disabled }`.
- Produces: accessible previous/next controls, current page text, and no output when there is only one page.

- [x] Add controls using `pagination.page`, `pagination.totalPages`, `pagination.hasPreviousPage`, and `pagination.hasNextPage`.
- [x] Disable controls while loading and prevent navigation beyond available pages.
- [x] Style the controls with existing CSS variables and responsive wrapping.

### Task 2: Update Generic List Data Flow

**Files:**
- Modify: `src/services/masterDataService.js`
- Modify: `src/services/userService.js`
- Modify: `src/services/receivingService.js`
- Modify: `src/services/dailySalesService.js`
- Modify: `src/services/inventoryService.js`
- Modify: `src/hooks/useMasterDataResource.js`
- Modify: `src/hooks/useReceiving.js`
- Modify: `src/hooks/useDailySales.js`
- Modify: `src/hooks/useBranchInventory.js`
- Modify: `src/pages/Users/index.jsx`

**Interfaces:**
- Services accept `{ page, limit }` and return `{ data, pagination }`.
- Hooks expose `pagination`, `page`, and `setPage` alongside existing list state.

- [x] Replace hardcoded `limit: "100"` list calls with `{ page, limit: "10" }`.
- [x] Normalize both the array and pagination metadata without losing response metadata.
- [x] Reload the current page when CRUD operations complete, and reset to page 1 when search/filter state changes.
- [x] Keep branch and flower option requests unpaged where forms require complete option lists.
- [x] Render the shared `Pagination` below each affected table.

### Task 3: Update Master Data Lists

**Files:**
- Modify: `src/components/common/MasterDataPage/MasterDataPage.jsx`

**Interfaces:**
- Consumes: `useMasterDataResource()` page state and metadata.
- Produces: paginated Branches, Farms, and Flower Catalog tables for authorized roles.

- [x] Pass page state through `MasterDataPage` and render pagination after `GenericDataTable`.
- [x] Preserve client-side row rendering and existing form/modal actions.

### Task 4: Update Operational Lists

**Files:**
- Modify: `src/pages/Inventory/index.jsx`
- Modify: `src/pages/Receiving/index.jsx`
- Modify: `src/pages/DailySales/index.jsx`

**Interfaces:**
- Consumes: paginated hook results.
- Produces: paginated Inventory, Receiving, and Daily Sales tables for Branch Staff and Head Office.

- [x] Pass active page and page-change handlers into the shared `Pagination` component.
- [x] Keep local display filtering only where existing behavior requires it; reset page when filters change.
- [x] Keep modal detail flows independent of list pagination.

### Task 5: Verify Pagination Integration

**Files:**
- Verify all files from Tasks 1-4.

- [x] Run `git diff --check`.
- [x] Run `npm run build` in the frontend repository.
- [x] Confirm requests include `page` and `limit`, and response metadata is consumed.
- [x] Confirm Dashboard aggregate requests remain unchanged and role-specific API access is preserved.
