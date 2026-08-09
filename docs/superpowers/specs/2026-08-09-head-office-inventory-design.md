# BloomFlow Head Office Inventory Design

## Scope

Add the frontend Head Office Inventory page at `/head-office-inventory` using the existing Head Office menu entry and the existing `GET /inventory/head-office` API. Do not create or modify backend code, database schema, migration, or endpoint. Keep the page structure aligned with the inventory PRD even where the current API cannot provide values.

## Current API Contract

The active endpoint returns aggregate rows with:

- `flowerId`
- `flowerName`
- `variety`
- `totalAvailable`

It currently filters to available stock and does not return batch-level fields. The frontend must not derive missing batch data or fabricate values.

## Page Structure

- Add the missing protected route `/head-office-inventory`.
- Preserve the existing Head Office Sidebar menu entry.
- Render a Page Header, PRD summary cards, Toolbar, and GenericDataTable.
- Use existing Search Bar, Summary Card, Status Badge, Empty State, Loading State, and table components where compatible.

## Real Data

- `Total Available Stock` sums `totalAvailable` from API rows.
- Inventory table renders `Flower`, `Variety`, and `Available Quantity` from API rows.
- Search filters Flower and Variety client-side.
- API errors, empty data, and loading states are rendered explicitly.

## Unavailable Data

The following remain visible as PRD structure but show `Data belum tersedia` without dummy values or derived estimates:

- Total Batches
- Depleted Batches
- Utilization Rate
- Batch Number
- Farm
- Received Date
- Initial Quantity
- Used Quantity
- Status

The Status Filter remains in the Toolbar with All, Available, and Depleted options. Available uses the API's current available-only rows; Depleted shows a clear unavailable/empty state because the endpoint does not expose depleted records. No unsupported status is inferred.

## Architecture

Create `inventoryService.js` for the existing endpoint and `useHeadOfficeInventory.js` for loading, error, search, status filter state, and API normalization. Create a reusable `InventorySummaryCard` only if the existing `StatisticCard` cannot represent unavailable values without fake notes. Create a page-specific table configuration that passes real fields and explicit unavailable placeholders to `GenericDataTable`.

## Visual Language

Reuse BloomFlow's existing page header, card, table, toolbar, status badge, typography, spacing, border, shadow, and color variables. Do not create a separate visual system. Keep the table responsive with horizontal scrolling at narrow widths.

## Verification

Verify route/menu navigation, endpoint whitelist, real available-stock aggregation, search/filter behavior, unavailable placeholders, no batch calculations, no backend changes, and a successful production build.
