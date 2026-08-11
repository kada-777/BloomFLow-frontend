# Branch Staff Dashboard Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Branch Staff Dashboard branch dropdown and identify the assigned branch in the main header.

**Architecture:** Keep the change local to `src/pages/Dashboard/index.jsx`. Read the authenticated user from `useAuth()`, derive the Branch Staff title from `user.branch?.name`, and conditionally omit `BranchSelector` for Branch Staff while preserving existing behavior for other roles.

**Tech Stack:** React, React Router, existing AuthContext, Vite.

## Global Constraints

- Apply the changes only to the Dashboard page.
- Keep the Branch dropdown available for Super Admin and Head Office users.
- Replace the Branch Staff title with `Welcome, <branch name>`.
- Keep the existing Branch Staff subtitle unchanged.
- Do not add an API request or modify shared layout, navigation, or backend code.
- Use `My Branch` when `user.branch?.name` is unavailable.

---

### Task 1: Update Branch Staff Dashboard Header and Filter

**Files:**
- Modify: `src/pages/Dashboard/index.jsx`

**Interfaces:**
- Consumes: `useAuth()` returning `{ user }`, and the existing `useDashboard()` return value including `isBranchStaff`.
- Produces: Branch Staff dashboard title `Welcome, ${user.branch.name}` and no `BranchSelector` element; non-Branch Staff rendering remains unchanged.

- [ ] **Step 1: Import the authenticated-user hook**

Add `useAuth` to the page imports:

```jsx
import { useAuth } from "../../contexts/AuthContext";
```

- [ ] **Step 2: Derive the role-aware title from the authenticated user**

Inside `Dashboard`, read the user and preserve the existing role copy for other roles:

```jsx
const { user } = useAuth();
const isBranchStaffRole = role === "Branch Staff";
const title = isBranchStaffRole
  ? `Welcome, ${user?.branch?.name || "My Branch"}`
  : (roleCopy[role] || ["Account access", "Your assigned workspace"])[0];
const subtitle =
  (roleCopy[role] || ["Account access", "Your assigned workspace"])[1];
```

Do not change the existing subtitle strings.

- [ ] **Step 3: Render the branch selector only for authorized roles**

Wrap the existing filter row so Branch Staff does not receive the disabled dropdown:

```jsx
{!isBranchStaff && (
  <div className="dashboard-filter-row">
    <BranchSelector
      branches={data.branches}
      selectedBranch={selectedBranch}
      onChange={setSelectedBranch}
      disabled={isBranchStaff}
      loading={loading}
      error={resourceErrors.branches}
    />
  </div>
)}
```

The hook still receives `isBranchStaff`; only its presentation is changed. Keep the selector's existing props for non-Branch Staff roles.

- [ ] **Step 4: Review the resulting diff**

Run:

```bash
git diff -- src/pages/Dashboard/index.jsx
```

Expected: only the auth import, title derivation, and conditional filter rendering change. No shared layout, navigation, service, or hook files are modified.

### Task 2: Verify the Dashboard Change

**Files:**
- Verify: `src/pages/Dashboard/index.jsx`
- Verify: `docs/superpowers/specs/2026-08-11-branch-dashboard-header-design.md`

**Interfaces:**
- Consumes: the completed Dashboard page change.
- Produces: a production build with the requested role-specific behavior.

- [ ] **Step 1: Check whitespace errors**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Vite completes successfully and writes the production bundle.

- [ ] **Step 3: Confirm the final worktree scope**

Run:

```bash
git status --short
```

Expected: the existing unrelated `src/pages/Inventory/inventory.css` change remains untouched, and this work adds only the Dashboard source change plus the design/plan documents.
