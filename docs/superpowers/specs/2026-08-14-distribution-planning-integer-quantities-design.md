# Distribution Planning Integer Quantities

## Goal

Make `Forecast Recommendation` and `Final Quantity` integer values throughout the Head Office Distribution Planning frontend, using normal rounding for existing decimal values.

## Scope

- Round displayed forecast recommendations with `Math.round`.
- Normalize final quantities to rounded integer values when a plan is loaded.
- Restrict editable final quantity input to non-negative integer digits.
- Send the normalized integer as the `finalQuantity` update payload.
- Use the same normalized integer values when detecting changes and requiring an adjustment reason.

The backend and database remain unchanged. Integer payloads are already accepted by the backend quantity parser and continue to be stored in the existing Decimal columns as values such as `12.00`. Other inventory and receiving quantities are out of scope.

## Design

The Distribution Planning page will use one quantity normalization helper for both display and editing. Null or undefined quantities continue to render as `0`; valid numeric values are converted with normal rounding and rendered without a decimal portion. Invalid values use the existing safe zero fallback.

When hydrating editable inputs, `finalQuantity` takes precedence over `recommendedQuantity`, matching current behavior, and the selected value is normalized to an integer string. The recommendation shown in the table and add-flower selector uses the same formatting helper.

The final quantity input changes from decimal mode to numeric mode and validates with a non-negative integer pattern. Save requests send the trimmed normalized integer string. Change detection compares normalized current and input values so a backend value such as `12.40` and an input value of `12` do not create a false adjustment after rounding.

## Error Handling

Values that are empty, negative, non-numeric, or contain a decimal entered manually fail client-side validation with an integer-specific message. Existing adjustment-reason validation remains unchanged and only applies when the normalized final quantity differs from the normalized recommendation.

## Testing

- Run the frontend production build.
- Manually verify decimal recommendations render as normally rounded integers.
- Verify the final quantity input rejects decimal and negative values.
- Verify saving sends an integer quantity and that unchanged rounded values do not require an adjustment reason.
