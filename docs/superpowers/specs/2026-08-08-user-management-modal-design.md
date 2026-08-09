# BloomFlow User Management Modal Design

## Scope

Refactor the User Management page to use reusable modal UI components without changing backend code, route definitions, authentication, or the existing API client behavior. Use only the User APIs defined in `docs/API_Contract.yaml` and implemented by the backend.

## API Boundaries

- `GET /users` loads the user list.
- `POST /users` creates a user with `email`, `password`, `role`, and optional `branchId`.
- `PATCH /users/:id` updates `isActive`, `password`, `role`, and `branchId`.
- There is no DELETE endpoint. The Delete confirmation performs account deactivation with `PATCH /users/:id` and `{ isActive: false }`, preserving historical data as required by the contract.
- The backend has no persisted `name` or `username` field. The UI uses the email local-part as the display name and does not render a duplicate name input.

## Components

- `components/common/Modal/Modal.jsx` and `Modal.css` provide the generic overlay, focusable dialog shell, Escape/outside-close behavior, body scroll lock, and fade/scale animation.
- `components/common/ConfirmDialog/ConfirmDialog.jsx` and `ConfirmDialog.css` compose `Modal` for deactivation confirmation with a warning icon and danger action.
- `components/users/UserFormCard/UserFormCard.jsx` and `UserFormCard.css` compose `Modal` for create/edit. It uses controlled fields for email, password, role, branch, and status, with create/edit copy and API-compatible submit payloads.

## User Management Integration

The page owns modal visibility, selected user, form mode, loading/error state, users, branches, and API calls. It opens `UserFormCard` for Add/Edit and `ConfirmDialog` for deactivation. After successful create, update, or deactivation, it reloads the list. Existing validation behavior is preserved and expanded only for API rules: `STAFF_BRANCH` requires a branch, non-branch roles submit `branchId: null`, and edit password is optional.

## Visual Language

The components use existing BloomFlow variables: `--card`, `--bg`, `--soft`, `--border`, `--text`, `--muted`, `--accent`, and `--shadow`. The form modal is a white/theme card around 850px wide, with 20–24px radius, a sticky visual header divider, spacious 52–56px controls, two-column branch/status row, and responsive one-column mobile layout. ConfirmDialog uses the existing danger red family. CSS transitions cover overlay opacity, card scale, buttons, inputs, and icon hover states.

## Accessibility and States

- Dialogs use `role="dialog"`, `aria-modal`, labelled title, and close buttons with accessible labels.
- Escape closes the modal; clicking the overlay closes it unless a submit/delete request is active.
- Submit and confirm buttons disable while requests are pending.
- API errors appear inside the active modal/dialog without losing the form values.
- Empty user and branch responses render clean empty/select states rather than fabricated values.

## Verification

Run the frontend production build and verify create, edit, deactivation, validation, loading, error, Escape, overlay click, responsive layout, and that only the intended User Management and reusable component files changed.
