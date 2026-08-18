# Planning Date Forecast Horizon

## Goal

Require Head Office Staff to select and confirm a backend-provided planning date before generating a Distribution Plan. The selected date determines the forecast horizon, but the frontend must treat the backend planning metadata as authoritative and must not calculate server dates, Daily Sales cutoff dates, planning-date bounds, horizons, or existing-plan availability.

## API Contract

Add `distributionService.getPlanningMetadata()` for `GET /forecasts/planning-metadata` and change `distributionService.generatePlan(planningDate)` to call `POST /forecasts` with exactly:

```json
{
  "planningDate": "2026-08-15"
}
```

The frontend must not send `cutoffDate`, `forecastDate`, or `horizon`.

The metadata response provides `serverDate`, `cutoffDate`, `minimumPlanningDate`, `maximumPlanningDate`, `planningDates`, and `unavailableReason`. Each planning-date entry provides `date`, `horizon`, `available`, and `reason`.

## Architecture

`DistributionPlanning` owns planning metadata, metadata loading state, selected planning date, confirmation-dialog state, and generation submission state. Existing plan detail, editing, finalization, deletion, and order-creation behavior remains on the same page.

A focused `GeneratePlanDialog` component renders the structured confirmation content. It uses the existing `Modal` foundation but does not broaden the shared plain-message `ConfirmDialog` API for this specialized workflow.

`distributionService` remains the page's API boundary. It unwraps planning metadata and generation responses using the existing response convention.

## Metadata And Selection

Load planning metadata from the backend when the Distribution Planning page loads. Populate the Planning Date selector only from `planningDates`, preserving the date values as `YYYY-MM-DD` strings.

After each successful metadata load, automatically select the first entry in response order whose `available` value is `true`. Entries with `reason: "PLAN_ALREADY_EXISTS"` remain visible but disabled and display the label `Plan sudah ada` alongside their formatted date. Any other unavailable entry also remains disabled; the frontend does not infer or replace its backend reason.

Generate Plan is disabled while metadata is loading, while generation is pending, or when no available selected entry exists.

## Date Handling

Planning dates and cutoff dates are calendar-date strings, not timestamps. The generation workflow must not pass these values to `new Date("YYYY-MM-DD")` or otherwise parse them as instants.

For Indonesian display labels, split a valid `YYYY-MM-DD` string into year, month, and day numbers and format a locally constructed calendar date, or use an equivalent formatter that cannot shift the calendar day because of browser timezone. API requests retain the original selected string without transformation.

The existing plan-detail timestamp/date formatting is outside this feature except where a shared helper can be made safe without changing its intended display.

## Confirmation Flow

Clicking Generate Plan opens `GeneratePlanDialog` and does not send a request. The dialog displays values from the currently selected metadata entry and metadata response:

- `Planning Date`: selected entry `date`, formatted in Indonesian.
- `Cutoff Daily Sales`: metadata `cutoffDate`, formatted in Indonesian.
- `Forecast Horizon`: `Hari ke-{selectedEntry.horizon}`.

The dialog title is `Buat Distribution Plan?`, with `Batalkan` and `Buat Plan` actions. Batalkan, Escape, overlay close, and the close button close the dialog without a request when no request is pending.

Confirming sets the pending state before calling `generatePlan(selectedEntry.date)`. While pending, all dismissal paths and both actions are disabled so the request cannot be submitted twice. The primary action shows a loading label.

## Success And Conflict Handling

After successful generation, open the newly created plan using the returned `distributionPlanId`, refresh the Distribution Plan list without replacing that detail, and refresh planning metadata. The refreshed metadata becomes authoritative and is expected to mark the submitted date as unavailable with `PLAN_ALREADY_EXISTS`.

Any HTTP 409 response from `POST /forecasts` is treated as a duplicate or stale-metadata conflict. Display the backend message through the existing page notice, with a clear fallback if no backend message exists, and refresh planning metadata before allowing another generation attempt. Do not calculate a replacement date locally.

Other generation errors use the existing API error presentation and retain backend authority. Metadata loading errors appear in the existing `ActionNotice` path with retry behavior; the page does not fabricate metadata or dates.

## Unavailable States

When `unavailableReason` is `SALES_DATA_OUTDATED`, display exactly:

> Tidak ada tanggal planning yang tersedia. Data Daily Sales perlu diperbarui sebelum membuat plan baru.

When no planning-date entry is available for any other reason, display exactly:

> Semua tanggal planning yang tersedia sudah memiliki plan.

Generate Plan remains disabled in both conditions.

## Styling And Responsiveness

Add the Planning Date field to the existing generate area in the page header and preserve the current BloomFlow visual language. The selector, status/help text, and Generate button stack cleanly on mobile. The confirmation dialog uses existing theme variables and remains readable on narrow screens.

## Verification

Follow the repository's current verification approach without adding a test framework. Run the production build and perform explicit manual/browser-network verification for:

1. Planning metadata loads from the backend.
2. The earliest available entry in response order is selected automatically.
3. Existing-plan entries are disabled and labeled `Plan sudah ada`.
4. The dialog displays planning date, cutoff, and backend-provided horizon.
5. Cancel sends no request.
6. Confirm sends only `planningDate`.
7. No frontend code calculates cutoff or horizon.
8. The stale Daily Sales message appears exactly.
9. Generate is disabled when no date is available.
10. An HTTP 409 displays feedback and refreshes metadata.
11. Calendar dates do not shift when the browser runs in a timezone other than UTC.

Also verify existing plan opening, quantity editing, finalization, deletion, and order creation remain functional.
