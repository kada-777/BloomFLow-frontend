# Daily Sales Integer Quantities

## Goal

Make `Sold Qty` and `Damaged Qty` in the Branch Staff Add Sales flow use normal rounding and send integer values to the backend.

## Scope

- Normalize form quantities with normal rounding using `Math.round`.
- Normalize values on blur and again before validation/submission.
- Send `soldQuantity` and `damagedQuantity` as integer strings in the create payload.
- Display the two quantity columns in `Most Recent Sales` without fractional digits.
- Keep the existing positive-total validation after normalization.
- Leave backend validation and Decimal database columns unchanged.

## Design

The daily sales hook will provide one quantity normalization helper that converts nullish or invalid values to `0` and rounds valid numeric values to an integer string. The Add Sales form will use the helper when a quantity input loses focus, while submit will normalize a copy of the form before running validation and constructing the API payload. This allows natural decimal entry while editing but guarantees integer validation and payload values.

The `Most Recent Sales` table formatter will use the same integer normalization so existing Decimal API values are rendered as whole numbers. Existing daily sales detail data and backend response contracts remain unchanged unless they pass through the table formatter.

Examples: `12.4` becomes `12`, `12.5` becomes `13`, and `12.6` becomes `13`. After normalization, `soldQuantity + damagedQuantity` must still be greater than zero.

## Error Handling

Empty or invalid quantity input continues to fail client-side validation. The validation message will describe a non-negative numeric quantity that is rounded to an integer. Backend errors remain displayed through the existing daily sales error handling.

## Testing

- Verify normal rounding examples in the form and Most Recent Sales table.
- Verify blur and submit normalize form values.
- Verify create payload contains integer strings.
- Verify total quantity validation uses normalized values.
- Run the frontend production build.
