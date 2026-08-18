# Distribution History Ship Button Layout

## Goal

Move the Head Office `Ship All Plan` action from the order action cell to a full-width row below the orders belonging to each distribution plan.

## Scope

- Keep one `Ship All Plan #...` button per distribution plan.
- Render the button in a full-width row immediately below that plan's order rows.
- Keep the existing `shipPlan(planId)` request, loading state, and visibility rules.
- Leave the `Detail` action in each order row.
- Do not add a bulk shipment endpoint or change backend behavior.

## Design

The order table will render a plan action row after the last visible order for each plan. The existing `firstDraftOrderByPlan` map will continue to identify plans eligible for shipment, while the render loop will determine whether the current row is the final row for that plan in the current result set. The action row spans all table columns and contains the existing shipment button.

Orders without a `distributionPlanId` will render normally without a shipment action row. A plan action row appears only when the plan's eligible draft order is present in the current page. Shipment success and failure behavior remain unchanged.

## Testing

- Verify each order row retains its `Detail` button.
- Verify one full-width shipment row appears below each eligible plan's order group.
- Verify no shipment button appears for received, in-transit, cancelled, or unplanned orders.
- Run the frontend production build.
