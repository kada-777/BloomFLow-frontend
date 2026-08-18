# Remove Add Flower From Distribution Planning

## Goal

Remove the `Add Flower` feature from Head Office Distribution Planning and display every flower in each branch group by default.

## Scope

- Remove the Add Flower button and flower selector from the branch group UI.
- Remove the hidden/visible item split used only by that feature.
- Display all items in `detail.items` directly in their branch group.
- Remove related UI state and the reveal handler.
- Keep plan loading, quantity editing, saving, finalization, order creation, and API contracts unchanged.

## Design

`branchGroups` will group items by branch and expose one `items` collection. Every grouped item will render in the table, including items whose recommendation and final quantity are zero. The branch header will show the total number of flowers displayed and will no longer show a “not added yet” count.

The component will remove `revealedItems`, `addingBranchId`, and `revealFlower`. Opening or refreshing a plan will no longer reset those states. The branch header will no longer render the Add Flower action, and the selector panel will be deleted. The empty table message will be updated to a neutral message because there is no longer an action that can add hidden flowers.

No backend or service changes are needed. Existing plan items are still loaded from the same endpoint and remain editable according to the current plan status and user role.

## Error Handling

Existing plan loading, save, finalize, delete, and order-creation errors remain unchanged. Removing the UI action introduces no new request or validation path.

## Testing

- Run the frontend production build.
- Verify every flower returned for a branch is rendered, including zero-quantity flowers.
- Verify the Add Flower button, selector, and “not added yet” text are absent.
- Verify quantity editing and plan workflow controls still render and function unchanged.
