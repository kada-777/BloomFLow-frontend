# BloomFlow Branch Inventory and Batch Detail Design

## Scope

Implement the Branch Staff Inventory experience using the inventory rules in `docs/RFC/RFC-002-Inventory-Management.md`, `docs/ERD.md`, and `docs/PRD_BloomFlow.md`. The existing Branch Staff `Inventory` sidebar item will lead to a real `/inventory` summary page. Clicking a flower opens `/inventory/:flowerId`, a read-only `Batch Detail` page showing the source batches and aging status for that flower in the authenticated user's branch.

Do not add manual stock adjustment, mutation controls, or database schema fields. Staff Branch remains restricted to its own branch.

## Business Rules From Project Docs

- Branch inventory is stored as `BranchStockLot` records grouped by flower and distribution source.
- Flower age starts at `shippedAt`, not at Head Office `receivedDate`.
- Default aging is `FRESH` for days 0–7, `GRADE_C` for days 8–11, and `DAMAGED` after day 11. Periods are configurable through `FRESH_PERIOD` and `GRADE_C_PERIOD`.
- Damaged flowers cannot be sold.
- Only received quantity enters branch inventory; damaged/missing in-transit quantity does not.
- Staff Branch can only access its own branch data.
- FIFO and batch provenance are represented by `BranchStockLot.sourceOrderId`, `DistributionBatchAllocation`, and `FlowerBatch`.

## Backend Contract

Keep `GET /inventory/my-branch` as the Branch Staff summary endpoint. Its existing response remains the source for the summary table and includes grouped flower entries with `flowerId`, `flowerName`, `variety`, `totalQuantity`, and `lots` containing `quantity`, `shippedAt`, and `flowerStatus`.

Add `GET /inventory/my-branch/:flowerId`, authenticated and authorized for `STAFF_BRANCH`. The controller derives `branchId` from the JWT and never accepts a branch ID from the client. The service validates the flower ID, queries only non-zero lots for that branch and flower, and resolves provenance through the existing relations:

`BranchStockLot.sourceOrderId -> DistributionBatchAllocation.distributionOrderId -> DistributionBatchAllocation.batch -> FlowerBatch`.

The detail response includes:

```json
{
  "flower": { "id": 1, "name": "Rose", "variety": "Red" },
  "lots": [
    {
      "id": 10,
      "quantity": "12",
      "shippedAt": "2026-08-01T10:00:00.000Z",
      "ageDays": 9,
      "flowerStatus": "GRADE_C",
      "sourceBatches": [
        {
          "batchNumber": "BATCH-001",
          "receivedDate": "2026-07-29"
        }
      ]
    }
  ]
}
```

If a lot has multiple matching allocated batches, return every source batch and received date in FIFO allocation order. Do not change the Prisma schema or invent a direct `batchId` on `BranchStockLot`.

## Inventory Summary UI

The Branch Staff sidebar keeps `Inventory` under `DAILY OPERATIONS` at `/inventory`.

The page title is `Branch Inventory`. It displays a table with exactly these columns:

- `Flower`
- `Fresh`
- `Grade C`
- `Damaged`
- `Available`

Each row represents one flower from `GET /inventory/my-branch`. The frontend sums the row's `lots` by `flowerStatus`:

- Fresh: `FRESH` quantities
- Grade C: `GRADE_C` quantities
- Damaged: `DAMAGED` quantities
- Available: all active lot quantities

The Flower cell is an accessible link/button to `/inventory/:flowerId`. No mutation action is shown. The page has loading, empty, API-error, and responsive horizontal-scroll states consistent with existing BloomFlow tables.

## Batch Detail UI

The `/inventory/:flowerId` page is read-only and contains a back control to `/inventory`, a `Batch Detail` title, and the flower name/variety.

The detail table has exactly these columns:

- `Source Batch`
- `Received Date`
- `Age`
- `Status`

Each row represents one branch stock lot. If the lot has multiple source batches, `Source Batch` renders all batch numbers and `Received Date` renders all corresponding dates in the same order. `Age` renders the lot age in days from `shippedAt`; `Status` renders the backend-calculated `FRESH`, `GRADE_C`, or `DAMAGED` status. Quantity may be shown in a compact summary/context line, but it is not a replacement for any requested table column.

The page handles loading, empty, 404, and generic API errors. It does not expose edit, delete, sell, damage, or adjustment actions.

## Frontend Architecture

- `src/services/inventoryService.js` wraps `getMyBranchStock()` and `getMyBranchFlowerDetail(flowerId)`.
- `src/hooks/useBranchInventory.js` owns summary loading, detail loading, API errors, aggregation, and selected detail state.
- `src/pages/Inventory/index.jsx` renders the summary page and navigable flower rows.
- `src/pages/Inventory/BatchDetail.jsx` renders the detail route.
- `src/pages/Inventory/inventory.css` contains scoped summary/detail styles and mobile table behavior.
- `src/App.jsx` registers `/inventory/:flowerId` before the generic fallback behavior as needed by React Router.
- `src/layouts/AppLayout.jsx` preserves Inventory as a Branch Staff menu item and does not add new access for other roles.

Reuse `DataTable`, existing `ActionNotice`, `PageHeader`, `StatusBadge`, API wrapper, theme variables, and responsive table conventions where they fit. Avoid duplicate backend status calculations in the frontend.

## Error Handling and Verification

- A Branch Staff request must always use the JWT-derived branch on the backend.
- Invalid or missing `flowerId` returns the existing API error shape and renders a safe detail error state.
- Empty summary and empty detail data render explicit empty states.
- Verify summary aggregation for all three statuses and Available.
- Verify clicking a flower navigates with the correct ID.
- Verify multiple source batches and dates render in order.
- Verify age/status come from the backend aging rules.
- Run the frontend production build and backend JavaScript syntax checks. The backend currently has no test script; live API/browser checks require a running backend and Branch Staff account.
