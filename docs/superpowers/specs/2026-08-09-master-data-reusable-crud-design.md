# BloomFlow Master Data Reusable CRUD Design

## Scope

Refactor User Management into reusable table/search/action patterns and implement Superadmin master-data pages for Farms, Flower Catalog, and Branches. Do not create or modify backend code, database schema, migration, or API endpoints. Preserve the current User Management visual design.

## Available Data and API Boundaries

- Branch fields: `id`, `name`, `location`.
- Farm fields: `id`, `name`, `location`.
- Flower fields: `id`, `name`, `variety`.
- Branch APIs: `GET /branches`, `POST /branches`, `PATCH /branches/:id`.
- Farm APIs: `GET /farms`, `POST /farms`, `PATCH /farms/:id`.
- Flower APIs: `GET /flowers`, `POST /flowers`, `PATCH /flowers/:id`.
- All writes require Superadmin authorization through the existing API client.
- No DELETE endpoint or soft-delete field exists for these resources.
- Delete buttons remain visible. Confirmation calls no API and shows a clear unsupported-backend notice with a TODO comment identifying the future DELETE request insertion point.

## Reusable Architecture

- `GenericDataTable` accepts columns, rows, loading, empty state, and row actions.
- `SearchBar` provides controlled client-side search.
- `ActionButtons` standardizes Edit/Delete visuals.
- Existing `ConfirmDialog` is reused for all delete confirmations.
- `ResourceFormCard` is a configurable Add/Edit modal for field definitions and API-compatible payloads.
- `masterDataService` provides generic list/create/update methods for resource endpoints.
- `useMasterDataResource` owns list loading, errors, search, modal selection, create/update requests, refresh, and unsupported-delete notice state.

## Page Integration

`Users/index.jsx` keeps its current layout and API behavior while replacing inline table/search/action rendering with reusable components. `Farms/index.jsx`, `FlowerCatalog/index.jsx`, and `Branches/index.jsx` use the same page pattern: header, Add button, search, generic table, form card, confirmation dialog, loading, empty, error, and action notice.

Farm and Branch forms contain only Name and Location. Flower form contains only Name and Variety. No status, created date, category, phone, address, or other unavailable fields are added.

## Delete UI Behavior

Delete buttons are rendered for visual and UX consistency. Confirming a delete must not mutate local rows or call an invented endpoint. It shows a notice such as `Delete API backend belum tersedia.` and leaves server data unchanged. The handler is isolated so a future `masterDataService.remove(resource, id)` call can be added when the backend endpoint exists.

## Styling and Responsive Behavior

Reuse existing User Management styles and BloomFlow variables. Generic components use scoped class names and preserve the existing table/card appearance. Farm, Flower, and Branch forms use the existing modal style with responsive fields and the same Add/Edit interaction. Tables remain horizontally scrollable at narrower widths.

## Verification

Run the frontend build and confirm only existing API paths are referenced, no DELETE request is generated, all forms submit only database-backed fields, User Management appearance remains stable, and all three master-data pages expose Add/Edit/Delete UI with clear unsupported-delete feedback.
