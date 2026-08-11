# Branch Staff Dashboard Header Design

## Goal

Simplify the Branch Staff Dashboard by removing the non-actionable Branch dropdown and identifying the assigned branch in the page header.

## Scope

- Apply the changes only to the Dashboard page.
- Keep the Branch dropdown available for Super Admin and Head Office users.
- Replace the Branch Staff title with `Welcome, <branch name>`.
- Keep the existing Branch Staff subtitle unchanged.
- Do not add an API request or modify shared layout, navigation, or backend code.

## Design

`src/pages/Dashboard/index.jsx` will use the authenticated user already exposed by `AuthContext`. For a Branch Staff user, the page title will be built from `user.branch?.name`. If the relation is unavailable, the UI will use `My Branch` as a safe display fallback.

The page will conditionally render `BranchSelector` only when `isBranchStaff` is false. This removes the dropdown from the DOM rather than leaving a disabled control visible. Existing branch filtering behavior for other roles remains unchanged.

## Verification

- Run `npm run build`.
- Run `git diff --check`.
- Confirm only `src/pages/Dashboard/index.jsx` and this design document are affected by this work.
