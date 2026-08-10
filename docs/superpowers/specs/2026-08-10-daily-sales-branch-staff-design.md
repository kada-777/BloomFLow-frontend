# BloomFlow Branch Staff Daily Sales Design

## Scope

Implement the frontend `/daily-sales` page for Branch Staff. Add a Daily Sales entry to the Branch Staff sidebar, a Most Recent Sales table, an Add Sales modal, and a read-only View Detail modal. Extend the existing daily-sales list response to include its item summaries, without adding a damage-reason field.

## Existing API and Access

- `GET /daily-sales?limit=100` lists daily-sale summaries with item flower names and sold/damaged quantities. Branch Staff results are restricted by the authenticated user's branch.
- `GET /daily-sales/:id` returns the selected daily sale and its flower items. Branch Staff can only access records for their branch.
- `POST /daily-sales` creates one daily sale for the authenticated Branch Staff user's branch.
- `GET /flowers?limit=100` supplies flower options for Add Sales.
- All requests reuse `src/services/api.js` for Bearer authentication.

The daily-sales list service includes the same item summary fields used by the detail view so the frontend can render one table row per flower without issuing a detail request for every sale.

The backend already enforces one daily sale per branch/date, valid flowers, non-negative decimal quantities, positive total quantity per item, and available stock. The frontend mirrors basic input validation but treats backend responses as authoritative.

## API Fields

The Add Sales payload is exactly:

```json
{
  "salesDate": "YYYY-MM-DD",
  "items": [
    {
      "flowerId": 1,
      "soldQuantity": "10",
      "damagedQuantity": "2"
    }
  ]
}
```

Daily-sale detail items use `flower.name` and include `soldQuantity` and `damagedQuantity`. No damage explanation or notes are collected or persisted.

## Architecture

- `dailySalesService.js` wraps list, detail, create, and flower-option requests.
- `useDailySales` owns list loading, detail loading, Add Sales form state, modal state, submit state, errors, and refresh behavior.
- `DailySales` orchestrates the page header, table, Add Sales modal, and detail modal.
- `DailySalesForm` renders the date and repeatable flower quantity rows.
- `DailySalesDetail` renders the selected daily sale read-only.
- Existing `GenericDataTable`, `ActionNotice`, modal conventions, theme variables, and responsive styles are reused where practical.

## List UI

The Branch Staff sidebar adds `Daily Sales` under `DAILY OPERATIONS` with route `/daily-sales`. The page title is `Most Recent Sales`, with an `Add Sales` button.

The table columns are exactly:

- Date
- Flower
- Sold Qty
- Damaged Qty
- Action

Because the list endpoint returns one record with multiple items, the frontend flattens each item into a table row while retaining the parent daily-sale ID. Dates are formatted using the existing Indonesian locale conventions. Each Action cell contains `View Detail`, which opens the complete daily-sale detail for that record.

The page includes loading, empty, and error states. Successful creation refreshes the list and closes the form modal.

## Add Sales Form

The modal defaults `salesDate` to today but allows another date to be selected. It contains at least one dynamic item row. Each row has a unique Flower selector, Sold Qty input, Damaged Qty input, and a remove action when more than one row exists. An Add Flower control appends one row.

Client validation requires a date, a selected unique flower per row, non-negative decimal quantities, and a sold-plus-damaged total greater than zero. Submit sends the exact API payload. Backend validation errors, including duplicate date and insufficient stock, are displayed in the modal without discarding the entered values.

## Detail Modal

View Detail opens a read-only modal with the sales date and all flower items. Each item displays Flower, Sold Qty, and Damaged Qty. A damaged quantity of zero is shown clearly as zero; no damage reason is implied or displayed.

## Visual Language and Responsive Behavior

Use the existing BloomFlow warm beige background, white cards, muted text, pink accent, sage actions, rounded borders, subtle shadows, Inter and Plus Jakarta Sans typography, and existing modal/table conventions. The table remains horizontally scrollable on narrow screens. Form rows stack on mobile, and modal content remains usable within the viewport.

## Verification

Verify the Branch Staff sidebar link, `/daily-sales` route, list/detail/create request payloads, item flattening, date default and selection, unique flower rows, add/remove row behavior, validation, loading/error states, detail modal, refresh after creation, responsive layout, and production build. Confirm no backend files or database schema are changed.
