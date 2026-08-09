# BloomFlow User Management Modals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (inline execution requested by the user). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated or missing User Management modal UI with reusable animated Modal, UserFormCard, and ConfirmDialog components wired to the existing User APIs.

**Architecture:** `userService.js` wraps the existing `api.js` client for users and branches. `UserManagement` owns list data, modal visibility, selected user, request state, and refresh behavior. `Modal` provides the generic dialog shell; `UserFormCard` and `ConfirmDialog` compose it and remain presentation-focused.

**Tech Stack:** React functional components and hooks, existing Axios client, lucide-react, CSS modules by component folder, existing BloomFlow CSS variables.

## Global Constraints

- Do not modify backend code or create backend endpoints.
- Use only `GET /users`, `POST /users`, `PATCH /users/:id`, and `GET /branches`.
- Deletion means deactivation through `PATCH /users/:id` with `{ isActive: false }` because the backend has no DELETE endpoint.
- Do not submit unsupported `name`, `username`, or `newPassword` fields.
- Use the email local-part as the display name; do not render duplicate name and username inputs.
- Preserve existing API authentication through `src/services/api.js`.
- Keep all dialog controls responsive and use existing theme variables.

---

### Task 1: Add User API Service

**Files:**
- Create: `src/services/userService.js`

**Interfaces:**
- Consumes: existing `src/services/api.js` Axios instance.
- Produces: `userService.list`, `userService.create`, `userService.update`, and `userService.listBranches`.

- [ ] **Step 1: Add response unwrapping and service methods**

Implement methods using the existing client and contract-compatible payloads:

```js
import api from "./api";

function unwrap(response) {
  return response.data?.data ?? response.data;
}

export const userService = {
  async list() {
    return unwrap(await api.get("/users", { params: { limit: "100" } }));
  },
  async create(payload) {
    return unwrap(await api.post("/users", payload));
  },
  async update(id, payload) {
    return unwrap(await api.patch(`/users/${id}`, payload));
  },
  async listBranches() {
    return unwrap(await api.get("/branches", { params: { limit: "100" } }));
  },
};
```

The service must not expose a delete method because no DELETE API exists.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: build succeeds with the service added.

- [ ] **Step 3: Commit the service**

```bash
git add -- src/services/userService.js
git commit -m "feat: add user management api service"
```

### Task 2: Implement Base Modal

**Files:**
- Create: `src/components/common/Modal/Modal.jsx`
- Create: `src/components/common/Modal/Modal.css`

**Interfaces:**
- Consumes: `{ open, onClose, title, children, labelledBy, closeOnOverlay }`.
- Produces: accessible animated overlay/dialog shell that locks body scroll while open.

- [ ] **Step 1: Implement lifecycle and close behavior**

Use `useEffect` to add `modal-open` behavior to `document.body` while `open`. Restore the previous overflow value on cleanup. Add a document keydown listener for Escape. Overlay click closes only when `closeOnOverlay !== false`; dialog click stops propagation.

- [ ] **Step 2: Implement semantic dialog markup**

Render nothing when closed. When open, render:

```jsx
<div className="modal-overlay" role="presentation" onMouseDown={handleOverlayMouseDown}>
  <section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
    {children}
  </section>
</div>
```

The close button remains the responsibility of composed content so the base modal can be generic.

- [ ] **Step 3: Add animation and responsive CSS**

Use overlay opacity and dialog scale/opacity transitions around `220ms ease`. Center the dialog, cap it at `90vh`, and allow composed content to scroll. Add `modal-open { overflow: hidden; }` and mobile padding rules.

- [ ] **Step 4: Run the production build**

```bash
npm run build
```

Expected: build succeeds and modal styles do not target global `.modal-backdrop` or existing logout styles.

### Task 3: Implement UserFormCard and ConfirmDialog

**Files:**
- Create: `src/components/users/UserFormCard/UserFormCard.jsx`
- Create: `src/components/users/UserFormCard/UserFormCard.css`
- Create: `src/components/common/ConfirmDialog/ConfirmDialog.jsx`
- Create: `src/components/common/ConfirmDialog/ConfirmDialog.css`

**Interfaces:**
- Consumes: `Modal`, `open`, `mode`, `initialData`, `branches`, `onSubmit`, `onClose`, and ConfirmDialog callbacks.
- Produces: controlled create/edit form and reusable deactivation confirmation.

- [ ] **Step 1: Implement UserFormCard state initialization**

Use controlled state for `email`, `password`, `role`, `branchId`, and `isActive`. Reset state when `open`, `mode`, or `initialData` changes. Create defaults to `STAFF_HEAD_OFFICE`, blank password required, and active status. Edit uses `initialData` values and leaves password blank because it is optional.

Do not add a separate full-name or username input. The backend does not persist either; the table derives display name from the email local-part.

- [ ] **Step 2: Implement API-compatible validation and submit payloads**

Validate email and password on create. Validate role. Require `branchId` when role is `STAFF_BRANCH`; normalize it to a numeric ID. Send `branchId: null` for non-branch roles. For edit, include `isActive`, `role`, and `branchId`; include `password` only when non-empty. Do not send empty password, `name`, or `newPassword`.

- [ ] **Step 3: Implement form markup and states**

Use modal title/subtitle/button copy based on `mode`:

- Create: `Tambah Pengguna Baru`, `Buat akun staf baru`, `Buat Akun`.
- Edit: `Edit Pengguna`, `Perbarui informasi pengguna`, `Simpan Perubahan`.

Render email, password, role, branch, and status fields with labels, inline validation errors, submit loading state, API error area, close button, and footer buttons. Branch and status share a two-column row. Disable branch select unless role is `STAFF_BRANCH` and use real branch options.

- [ ] **Step 4: Implement ConfirmDialog**

Compose `Modal`, render a warning/trash icon, title, message, cancel button, and danger confirm button. Accept `confirmText`, `cancelText`, `danger`, `onConfirm`, and `onCancel`. The component must not call an API itself.

- [ ] **Step 5: Add component CSS**

Use `.modal-*`, `.user-form-*`, and `.confirm-dialog-*` scoped classes. Reuse `--card`, `--bg`, `--soft`, `--border`, `--text`, `--muted`, `--accent`, and `--shadow`; use the existing danger red family for destructive actions. Add 850px max width, 20–24px radius, 52–56px controls, 90vh max height, and a one-column mobile layout.

- [ ] **Step 6: Run the production build**

```bash
npm run build
```

Expected: build succeeds with both reusable modal compositions.

### Task 4: Integrate User Management Page

**Files:**
- Modify: `src/pages/Users/index.jsx`
- Modify: `src/pages/Users/user.css`

**Interfaces:**
- Consumes: `userService`, `UserFormCard`, and `ConfirmDialog`.
- Produces: functional user list with add/edit/deactivate actions, loading, errors, search, and refresh after mutations.

- [ ] **Step 1: Replace static users with API-backed state**

Load users and branches on mount using `Promise.allSettled()`. Normalize response arrays. Keep `searchTerm`, filter users locally by email, derived display name, or role. Render loading and error states without fake users.

- [ ] **Step 2: Wire Add and Edit actions**

Add opens `UserFormCard` with `mode="create"` and no initial user. Edit stores the selected user and opens `mode="edit"`. Submit calls `userService.create` or `userService.update`, closes on success, clears the selection, and reloads users. Keep modal open and preserve fields when the API returns an error.

- [ ] **Step 3: Wire deactivation confirmation**

Delete opens `ConfirmDialog`. Confirm calls `userService.update(selectedUser.id, { isActive: false })`, then closes and reloads the list. Label the action as Hapus while the implementation performs the contract-defined account deactivation.

- [ ] **Step 4: Map backend user fields to existing table presentation**

Use `user.email.split("@")[0]` for display name and initials. Use `user.branch?.name` for branch, role labels for enum values, and `user.isActive` for status. Do not fabricate `lastLogin`; display `-` when backend does not provide it.

- [ ] **Step 5: Preserve and extend page styling**

Keep existing User Management table/search styles and add only scoped loading/error/empty/action refinements needed for API-backed states. Do not change Navbar or Sidebar files.

- [ ] **Step 6: Run the production build**

```bash
npm run build
```

Expected: build succeeds and route `/users` renders without JSX or import errors.

### Task 5: Verify User Modal Behavior and API Boundaries

**Files:**
- Verify: `src/pages/Users/index.jsx`
- Verify: `src/services/userService.js`
- Verify: `src/components/common/Modal/*`
- Verify: `src/components/common/ConfirmDialog/*`
- Verify: `src/components/users/UserFormCard/*`
- Verify: `src/pages/Users/user.css`

- [ ] **Step 1: Verify API methods and payload fields**

Search the User implementation and confirm only `/users`, `/users/:id`, and `/branches` are used. Confirm create/update payloads contain only backend-supported fields and no DELETE request exists.

- [ ] **Step 2: Verify modal interactions**

Check Add, Edit, and Hapus flows; Escape; overlay click; close button; validation; API error preservation; disabled submit/confirm while loading; and body scroll lock.

- [ ] **Step 3: Verify responsive styling and display fallbacks**

Check desktop/tablet/mobile form layout, branch/status stacking, display name derived once from email, missing branch handling, and `-` for unavailable last login.

- [ ] **Step 4: Run final checks**

```bash
git diff --check
npm run build
git status --short
```

Expected: no whitespace errors, build succeeds, and no backend, Sidebar, or Navbar files are modified by this feature.
