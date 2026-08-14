# Remove Add Flower From Distribution Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Add Flower feature from Head Office Distribution Planning so every flower in each branch group is displayed by default.

**Architecture:** Simplify the existing `branchGroups` derived state in `src/pages/DistributionPlanning/index.jsx` to group each branch's items without hidden/visible filtering. Remove the feature-specific state, handler, controls, selector, and copy while leaving all API calls and plan workflow behavior unchanged.

**Tech Stack:** React 19, Vite, JavaScript, existing Lucide icon imports.

## Global Constraints

- Display every item in `detail.items`, including zero-quantity flowers.
- Remove the Add Flower button and flower selector from the branch group UI.
- Keep plan loading, quantity editing, saving, finalization, order creation, and API contracts unchanged.
- Make no backend or service changes.

---

### Task 1: Remove Add Flower UI and Filtering

**Files:**
- Modify: `src/pages/DistributionPlanning/index.jsx:1-5,50-55,79-88,264-289,299-327,395-450,459-475`

**Interfaces:**
- Consumes the existing `detail.items` API response and branch grouping logic.
- Produces `branchGroups`, where each group has `{ branchId, branchName, items }` and no feature-specific hidden/revealed state.

- [ ] **Step 1: Remove the feature-only icon and state**

Keep the `Plus` import because it is still used by the existing `Create Orders` action. Delete these state values:

```js
const [revealedItems, setRevealedItems] = useState({});
const [addingBranchId, setAddingBranchId] = useState(null);
```

- [ ] **Step 2: Remove feature state resets from plan lifecycle handlers**

Delete `setRevealedItems({})` and `setAddingBranchId(null)` from `openPlan`, the create-orders branch of `transitionPlan`, and `deleteActivePlan`. Keep all other state resets and API calls intact.

- [ ] **Step 3: Simplify branch grouping to include all items**

Replace the `branchGroups` calculation with grouping that pushes every item into `items`:

```js
const branchGroups = useMemo(() => {
  const groups = new Map();
  for (const item of detail?.items || []) {
    const branchId = item.branchId;
    if (!groups.has(branchId)) {
      groups.set(branchId, {
        branchId,
        branchName: item.branch?.name || `Branch #${branchId}`,
        items: [],
      });
    }
    groups.get(branchId).items.push(item);
  }
  return [...groups.values()];
}, [detail]);
```

This makes zero-quantity items visible without changing the source data or API response.

- [ ] **Step 4: Remove the reveal handler**

Delete `revealFlower`. No replacement handler is needed because all items are rendered immediately.

- [ ] **Step 5: Remove Add Flower controls and render all group items**

In the branch group markup:

- Change the header count to use `group.items.length` and remove the `not added yet` suffix.
- Remove the conditional Add Flower button.
- Remove the `addingBranchId` selector panel.
- Change the empty-state condition from `!group.visibleItems.length` to `!group.items.length` and use neutral text such as `No flowers are available for this branch.`
- Change the table mapping from `group.visibleItems.map(...)` to `group.items.map(...)`.

The resulting header and table structure should be equivalent to:

```jsx
<span>{group.items.length} flowers displayed</span>
...
{!group.items.length && (
  <tr>
    <td colSpan={4} className="distribution-empty-row">
      No flowers are available for this branch.
    </td>
  </tr>
)}
{group.items.map((item) => {
  // Keep the existing row and quantity editing logic unchanged.
})}
```

- [ ] **Step 6: Remove unused CSS only if it has no other consumers**

Search the frontend stylesheet for `.distribution-add-flower-button` and `.distribution-add-flower-panel`. If they are only used by the removed markup, delete those selectors from `src/pages/DistributionPlanning/distribution-planning.css`. Do not alter shared or unrelated distribution styles.

- [ ] **Step 7: Verify no Add Flower implementation references remain**

Run from `BloomFLow-frontend`:

```bash
rg -n "Add Flower|addingBranchId|revealedItems|revealFlower|hiddenItems|visibleItems|distribution-add-flower" src/pages/DistributionPlanning
```

Expected: no matches.

- [ ] **Step 8: Run the frontend production build**

```bash
npm run build
```

Expected: Vite completes successfully. Existing chunk-size warnings are acceptable if no build error occurs.

- [ ] **Step 9: Review and commit the implementation**

```bash
git diff -- src/pages/DistributionPlanning/index.jsx src/pages/DistributionPlanning/distribution-planning.css
git status --short
git add src/pages/DistributionPlanning/index.jsx src/pages/DistributionPlanning/distribution-planning.css
git commit -m "feat: remove add flower from distribution planning"
```

Confirm the diff contains no backend, service, quantity, or workflow changes before committing.

### Task 2: Acceptance Verification

**Files:**
- Verify: `src/pages/DistributionPlanning/index.jsx`
- Verify: `src/pages/DistributionPlanning/distribution-planning.css`

**Interfaces:**
- Consumes the simplified branch group shape from Task 1.
- Produces verified UI behavior without changing the backend contract.

- [ ] **Step 1: Verify all flowers render**

Open Distribution Planning with a plan containing a zero-quantity flower and confirm that flower appears in the branch table without any user action.

- [ ] **Step 2: Verify Add Flower controls are absent**

Confirm the page has no Add Flower button, flower selector, `not added yet` count, or Add Flower empty-state instruction.

- [ ] **Step 3: Verify existing workflows remain available**

Confirm editable DRAFT plans still show final quantity and adjustment reason inputs, and the existing Save Changes, Finalize Plan, Delete Plan, and Create Orders controls remain present according to their existing status and role conditions.

- [ ] **Step 4: Re-run the build after acceptance checks**

```bash
npm run build
```
