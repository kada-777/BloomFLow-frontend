# Distribution History Ship Button Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Head Office Ship All action into a full-width row below each distribution plan's orders while keeping one button per plan.

**Architecture:** Keep the existing `firstDraftOrderByPlan` eligibility map and `shipPlan(planId)` handler. Change only the table render to use keyed `Fragment` groups and insert one action row after the last visible row for each plan; leave Detail actions in the original order rows.

**Tech Stack:** React 19, Vite, JavaScript, existing Distribution History styles and service.

## Global Constraints

- Keep one `Ship All Plan #...` button per distribution plan.
- Render the button in a full-width row immediately below that plan's order rows.
- Keep the existing `shipPlan(planId)` request, loading state, and visibility rules.
- Leave the `Detail` action in each order row.
- Do not add a bulk shipment endpoint or change backend behavior.

---

### Task 1: Move Ship All Into Plan Action Rows

**Files:**
- Modify: `src/pages/Distribution/index.jsx:1,258-298`
- Modify: `src/pages/Distribution/distribution.css:12-24`

**Interfaces:**
- Consumes the existing `orders`, `firstDraftOrderByPlan`, `shipPlan`, and `shippingPlanId` state.
- Produces the same shipment request behavior with a new `distribution-plan-action-row` table row.

- [ ] **Step 1: Add keyed fragment rendering for grouped rows**

Import `Fragment` from React and change the `orders.map` callback to receive `orderIndex`. Keep the existing order row contents and Detail button unchanged:

```jsx
{orders.map((order, orderIndex) => {
  const isFirstDraftPlanOrder =
    order.distributionPlanId &&
    firstDraftOrderByPlan.get(order.distributionPlanId) === order.id;
  const isLastOrderInPlan = order.distributionPlanId && !orders
    .slice(orderIndex + 1)
    .some((nextOrder) => nextOrder.distributionPlanId === order.distributionPlanId);

  return (
    <Fragment key={order.id}>
      {/* existing order row */}
      {isLastOrderInPlan && isFirstDraftPlanOrder && (
        <tr className="distribution-plan-action-row">
          <td colSpan={6}>
            {/* Ship All button */}
          </td>
        </tr>
      )}
    </Fragment>
  );
})}
```

The `isLastOrderInPlan` check places the action after the final order for that plan even if the API result contains another plan afterward.

- [ ] **Step 2: Remove Ship All from the Actions cell**

Leave only the existing Detail button in `.distribution-row-actions`. Move the existing primary shipment button, including its icon, `onClick`, disabled condition, loading label, and plan label, into the full-width action row:

```jsx
<td colSpan={6}>
  <div className="distribution-plan-action-content">
    <span>Ready to ship all orders in Plan #{order.distributionPlanId}</span>
    <button
      type="button"
      className="distribution-primary-button"
      onClick={() => shipPlan(order.distributionPlanId)}
      disabled={shippingPlanId === order.distributionPlanId}
    >
      <PackageCheck size={15} />
      {shippingPlanId === order.distributionPlanId
        ? "Shipping..."
        : `Ship All Plan #${order.distributionPlanId}`}
    </button>
  </div>
</td>
```

- [ ] **Step 3: Add full-width action-row styling**

Add styles in `distribution.css` without changing shared button styles:

```css
.distribution-plan-action-row td {
  background: color-mix(in srgb, var(--accent) 5%, var(--card));
  border-top: 0;
  padding: 8px 10px 14px;
  text-align: left !important;
}
.distribution-plan-action-content {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.distribution-plan-action-content span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 720px) {
  .distribution-plan-action-content {
    align-items: stretch;
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Verify the implementation statically**

Search the page:

```bash
rg -n "distribution-plan-action-row|distribution-plan-action-content|Ship All Plan|distribution-row-actions" src/pages/Distribution/index.jsx src/pages/Distribution/distribution.css
```

Expected: `Ship All Plan` exists only inside the new plan action row, while `distribution-row-actions` contains only Detail.

- [ ] **Step 5: Run the frontend production build**

```bash
npm run build
```

Expected: Vite completes successfully. Existing bundle-size warnings are acceptable.

- [ ] **Step 6: Review and commit the implementation**

```bash
git diff -- src/pages/Distribution/index.jsx src/pages/Distribution/distribution.css
git status --short
git add src/pages/Distribution/index.jsx src/pages/Distribution/distribution.css
git commit -m "feat: move ship all below distribution plans"
```

Confirm no backend or shipment-service files changed.

### Task 2: Acceptance Verification

**Files:**
- Verify: `src/pages/Distribution/index.jsx`
- Verify: `src/pages/Distribution/distribution.css`

**Interfaces:**
- Consumes the grouped table render from Task 1.
- Produces the existing shipment behavior with the requested layout.

- [ ] **Step 1: Verify one button per eligible plan**

Open Distribution History as Head Office with multiple DRAFT orders belonging to one plan. Confirm one Ship All button appears in a full-width row directly below the plan's last order.

- [ ] **Step 2: Verify plan separation**

With orders from multiple plans, confirm each eligible plan has exactly one action row below its own order group and the button uses that plan's ID.

- [ ] **Step 3: Verify non-draft behavior**

Confirm received, in-transit, cancelled, and unplanned orders do not produce a Ship All row, while every order row still has its Detail button.

- [ ] **Step 4: Verify responsive layout and loading state**

Confirm the action row stacks cleanly on narrow screens and changes to `Shipping...` while the existing request is in progress.

- [ ] **Step 5: Run the production build again**

```bash
npm run build
```
