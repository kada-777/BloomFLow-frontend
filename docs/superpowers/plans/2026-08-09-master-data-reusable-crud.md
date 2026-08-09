# BloomFlow Master Data Reusable CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution requested by the user). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor User Management around reusable table/search/action primitives and implement API-backed Branches, Farms, and Flower Catalog CRUD UI without adding unsupported delete behavior.

**Architecture:** Shared presentation components handle tables, search, actions, notices, confirmations, and configurable resource forms. A generic `masterDataService` and `useMasterDataResource` hook handle the existing master-data endpoints. Each page supplies only its endpoint name, field configuration, columns, and copy; no database or API changes are made.

**Tech Stack:** React functional components/hooks, existing Axios client, existing Modal and ConfirmDialog, lucide-react, existing CSS variables and page styles.

## Global Constraints

- Do not create or modify backend code, database schema, migrations, or API endpoints.
- Use only `GET`, `POST`, and `PATCH` endpoints already available for users, branches, farms, and flowers.
- Delete actions remain visible and confirmable but must not call an invented endpoint, mutate local data, or optimistically remove rows.
- Delete confirmation must show `Delete API backend belum tersedia.` and include a TODO comment at the future request insertion point.
- Use only database-backed fields: Branch/Farm `name` and `location`; Flower `name` and `variety`.
- Do not add status, createdAt, category, phone, address, username, or other unavailable fields.
- Preserve the current User Management visual appearance while moving repeated behavior into components.

---

### Task 1: Create Shared Table, Search, Actions, Notice, and Resource Form Components

**Files:**
- Create: `src/components/common/GenericDataTable/GenericDataTable.jsx`
- Create: `src/components/common/GenericDataTable/GenericDataTable.css`
- Create: `src/components/common/SearchBar/SearchBar.jsx`
- Create: `src/components/common/SearchBar/SearchBar.css`
- Create: `src/components/common/ActionButtons/ActionButtons.jsx`
- Create: `src/components/common/ActionButtons/ActionButtons.css`
- Create: `src/components/common/ActionNotice/ActionNotice.jsx`
- Create: `src/components/common/ActionNotice/ActionNotice.css`
- Create: `src/components/common/ResourceFormCard/ResourceFormCard.jsx`
- Create: `src/components/common/ResourceFormCard/ResourceFormCard.css`

**Interfaces:**
- Consumes: column definitions, row data, loading/empty/error states, action callbacks, existing `Modal`, and existing `ConfirmDialog`.
- Produces: shared UI primitives used by User Management, Farms, Branches, and Flower Catalog.

- [ ] **Step 1: Implement GenericDataTable**

Accept:

```js
{
  columns: [{ key, label, render }],
  data,
  loading,
  emptyMessage,
  rowKey,
  renderActions,
  className,
}
```

Render a table inside the existing card visual. Render a loading message before empty state, call each column `render(row)` when provided, use `row.id` by default, and render actions in a final column only when `renderActions` exists. Keep the table class names compatible with the existing User Management CSS so visual spacing and borders do not change.

- [ ] **Step 2: Implement SearchBar and ActionButtons**

`SearchBar` accepts `{ value, onChange, placeholder, ariaLabel }` and emits a controlled input using the existing `search-card`/`search-input` visual pattern. `ActionButtons` accepts `{ onEdit, onDelete, deleteDisabled }` and renders the existing Edit/Hapus buttons with lucide icons.

- [ ] **Step 3: Implement ActionNotice**

Accept `{ message, tone = "info", onClose }`, render only when `message` exists, use `role="status"`, and support the unsupported delete message without changing data.

- [ ] **Step 4: Implement ResourceFormCard**

Accept:

```js
{
  open,
  mode,
  title,
  subtitle,
  fields: [{ name, label, type, required, options }],
  initialData,
  onSubmit,
  onClose,
  submitting,
  error,
}
```

Use the existing `Modal`, controlled field state, field-level required validation, API error display, create/edit button copy, and responsive two-column layout only when configured fields include two fields. Emit only configured field names, preserving empty values as strings for page-level normalization.

- [ ] **Step 5: Add shared CSS and run the build**

Use existing BloomFlow variables and reuse the current User Management table/card classes. Add responsive rules without changing Sidebar/Navbar selectors.

```bash
npm run build
```

Expected: build succeeds with shared components unused or minimally integrated.

### Task 2: Add Generic Master Data Service and Hook

**Files:**
- Create: `src/services/masterDataService.js`
- Create: `src/hooks/useMasterDataResource.js`

**Interfaces:**
- Consumes: existing `src/services/api.js` and a resource name of `branches`, `farms`, or `flowers`.
- Produces: list/create/update methods and hook state for list, search, loading, error, selected record, form state, and unsupported delete notice.

- [ ] **Step 1: Implement endpoint mapping**

Use a whitelist to prevent invented paths:

```js
const endpoints = {
  branches: "/branches",
  farms: "/farms",
  flowers: "/flowers",
};
```

Implement `list(resource)`, `create(resource, payload)`, and `update(resource, id, payload)` through the existing Axios client. Do not implement `remove`.

- [ ] **Step 2: Implement useMasterDataResource**

The hook accepts `{ resource, searchableFields }`, fetches the list on mount, filters client-side by those fields, exposes `refresh`, and stores `selectedItem`, `formOpen`, `formMode`, `submitting`, and `error`. `requestDelete(item)` must set a notice only; include this exact future integration marker in the handler:

```js
// TODO: connect masterDataService.remove(resource, item.id) when DELETE is available.
setNotice("Delete API backend belum tersedia.");
```

Create/update handlers call the existing service, refresh after success, and preserve the form on failure.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: build succeeds with no new backend paths.

### Task 3: Refactor User Management to Shared Components

**Files:**
- Modify: `src/pages/Users/index.jsx`
- Modify: `src/pages/Users/user.css`

**Interfaces:**
- Consumes: existing `userService`, `UserFormCard`, `ConfirmDialog`, `GenericDataTable`, `SearchBar`, `ActionButtons`, and `ActionNotice`.
- Produces: the same User Management layout and behavior with repeated table/search/action markup removed.

- [ ] **Step 1: Replace inline search and table markup**

Keep the existing API state and derived email identity. Pass user columns for email identity, role, branch, unavailable last login as `-`, and active status into `GenericDataTable`. Pass the existing `UserFormCard` and `ConfirmDialog` actions through `ActionButtons`.

- [ ] **Step 2: Preserve User Management visual selectors**

Ensure the shared table renders the existing `.table-card`, `table`, `.user-info`, `.role-pill`, `.status`, `.action-buttons`, `.edit-btn`, and `.delete-btn` classes or equivalent scoped classes with identical computed visual values. Keep the current search card spacing and header unchanged.

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected: User Management compiles and its layout remains visually equivalent.

### Task 4: Implement Branches, Farms, and Flower Catalog Pages

**Files:**
- Modify: `src/pages/Branches/index.jsx`
- Modify: `src/pages/Farms/index.jsx`
- Modify: `src/pages/FlowerCatalog/index.jsx`
- Create or modify: page-specific CSS only if shared styles do not cover the layout.

**Interfaces:**
- Consumes: `useMasterDataResource`, `GenericDataTable`, `SearchBar`, `ActionButtons`, `ActionNotice`, `ResourceFormCard`, and `ConfirmDialog`.
- Produces: Superadmin master-data pages with API-backed list/create/update and non-mutating delete UI.

- [ ] **Step 1: Configure Branches**

Use resource `branches`, searchable field `name` and `location`, fields `name` and `location`, and columns `Nama Branch` and `Lokasi`. Add/edit submits only `{ name, location }`. Delete opens confirmation and then shows the unsupported API notice.

- [ ] **Step 2: Configure Farms**

Use resource `farms`, searchable field `name` and `location`, fields `name` and `location`, and columns `Nama Farm` and `Lokasi`. Add/edit submits only `{ name, location }`. Delete opens confirmation and then shows the unsupported API notice.

- [ ] **Step 3: Configure Flower Catalog**

Use resource `flowers`, searchable field `name` and `variety`, fields `name` and `variety`, and columns `Nama Bunga` and `Varietas`. Add/edit submits only `{ name, variety }`. Delete opens confirmation and then shows the unsupported API notice.

- [ ] **Step 4: Add loading, empty, error, and responsive states**

Use shared loading/empty/error table states and retry actions. Keep the existing BloomFlow page header pattern and table card appearance. Do not create status or created-date columns.

- [ ] **Step 5: Run the production build**

```bash
npm run build
```

Expected: all three routes compile and render without dummy data or unsupported fields.

### Task 5: Verify Reusability, API Boundaries, and Visual Regression

**Files:**
- Verify: `src/components/common/*`
- Verify: `src/hooks/useMasterDataResource.js`
- Verify: `src/services/masterDataService.js`
- Verify: `src/pages/Users/index.jsx`
- Verify: `src/pages/Branches/index.jsx`
- Verify: `src/pages/Farms/index.jsx`
- Verify: `src/pages/FlowerCatalog/index.jsx`
- Verify: `src/pages/Users/user.css`

- [ ] **Step 1: Verify endpoint whitelist**

Search the implementation and confirm only `/users`, `/users/:id`, `/branches`, `/farms`, and `/flowers` are used. Confirm no DELETE request, new endpoint, schema, migration, or database file was added.

- [ ] **Step 2: Verify field whitelist**

Confirm forms and columns contain only Branch/Farm `name`, `location` and Flower `name`, `variety`, plus IDs returned by the API. Confirm no status, createdAt, category, phone, address, or username fields were introduced.

- [ ] **Step 3: Verify delete behavior**

Confirm each Delete action opens `ConfirmDialog`, confirmation changes no row and makes no request, and `ActionNotice` displays `Delete API backend belum tersedia.`. Confirm the TODO marker is present in the isolated handler.

- [ ] **Step 4: Run final checks**

```bash
npm run build
```

Expected: no whitespace errors, build succeeds, and no backend/DB/schema files are modified.
