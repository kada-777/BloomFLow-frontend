# Head Office Dashboard Date Filter and Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7/30/60-day filtering to the Head Office Dashboard and export the filtered dashboard as PDF/print or CSV.

**Architecture:** Add a role-protected backend dashboard endpoint that aggregates daily sales, receivings, and inventory movements for an explicit UTC date range. The frontend requests one normalized dashboard payload whenever the selected range changes, renders all supported widgets from that payload, and passes the same payload to print and CSV exporters.

**Tech Stack:** Express, Prisma, PostgreSQL, React, Axios, browser print API, Vite.

## Global Constraints

- The filter applies only to Head Office Dashboard.
- Supported ranges are exactly 7, 30, and 60 days.
- The selected range must affect every supported dashboard metric, chart, and activity list.
- Stock KPIs represent inventory activity within the selected range, not current snapshot stock.
- Export must support both browser print/save-to-PDF and CSV download.
- Exported reports must include the selected date range.
- Do not fabricate unsupported forecast, revenue, top-sales, or distribution values.
- Preserve existing role authorization and branch filtering behavior.

---

### Task 1: Define Backend Dashboard Aggregation Contract

**Files:**
- Create: `BloomFlow-backend/src/routes/dashboard.routes.js`
- Create: `BloomFlow-backend/src/controllers/dashboard.controller.js`
- Create: `BloomFlow-backend/src/services/dashboard.service.js`
- Modify: `BloomFlow-backend/src/routes/index.js`
- Modify: `BloomFlow-backend/src/utils/pagination.js` or create a date-range utility beside it

**Interfaces:**
- Endpoint: `GET /dashboard/head-office?days=7|30|60`.
- Response: `{ success: true, data: { period, summary, flowerStatus, activities } }`.
- Access: `STAFF_HEAD_OFFICE` only.

- [ ] Validate `days` as one of `7`, `30`, or `60`; return HTTP 422 for invalid values.
- [ ] Build an inclusive UTC range ending on the current UTC date, with `dateFrom` and `dateTo` returned in `period`.
- [ ] Query `DailySale.salesDate`, `Receiving.receivedDate`, and `InventoryMovement.createdAt` inside the range.
- [ ] Aggregate stock activity from movement types: receiving/distribution-in as additions, sale/damaged/distribution-out as reductions, and expose additions, reductions, and net activity explicitly.
- [ ] Aggregate flower status using movement-backed data only; leave unsupported metrics null rather than inventing values.
- [ ] Normalize recent activities newest-first and include receiving, sales, and stock movement records.
- [ ] Register the route behind authentication and `STAFF_HEAD_OFFICE` authorization.

### Task 2: Add Backend Contract Tests and Verification

**Files:**
- Create or modify: `BloomFlow-backend/test/dashboard.test.js`

**Interfaces:**
- Consumes: the endpoint from Task 1.
- Produces: coverage for validation, authorization, date boundaries, and aggregation semantics.

- [ ] Test valid `days=7`, `days=30`, and `days=60` responses include the selected period.
- [ ] Test invalid or missing values resolve to the documented behavior, with invalid explicit values rejected.
- [ ] Test records outside the date range are excluded.
- [ ] Test Head Office access succeeds and non-Head-Office roles receive authorization failure.
- [ ] Run the backend test command available in the repository; if no test script exists, run syntax checks for all changed JS files.

### Task 3: Connect Frontend Dashboard to the Filtered Backend Payload

**Files:**
- Modify: `BloomFLow-frontend/src/services/dashboardService.js`
- Modify: `BloomFLow-frontend/src/hooks/useDashboard.js`
- Modify: `BloomFLow-frontend/src/pages/Dashboard/index.jsx`
- Create: `BloomFLow-frontend/src/components/dashboard/DashboardRangeFilter.jsx`
- Create or modify: `BloomFLow-frontend/src/components/dashboard/DashboardRangeFilter.css`

**Interfaces:**
- `dashboardService.getHeadOfficeDashboard(days)` returns the normalized dashboard payload.
- `useDashboard()` exposes `rangeDays`, `setRangeDays`, `period`, and filtered dashboard data.

- [ ] Add a default Head Office range of `7` days and render the filter only when `role === "Head Office"`.
- [ ] Refetch the aggregated payload whenever the range changes or the user retries.
- [ ] Keep Branch Staff and Super Admin behavior unchanged unless their existing dashboard path is still required by shared components.
- [ ] Replace Head Office’s mixed unfiltered resource aggregation with the filtered payload for supported summary, status, and activity widgets.
- [ ] Keep unsupported widgets visibly marked as unsupported.

### Task 4: Implement Filtered Dashboard Export

**Files:**
- Create: `BloomFLow-frontend/src/services/dashboardExport.js`
- Create: `BloomFLow-frontend/src/components/dashboard/DashboardReport.jsx`
- Create: `BloomFLow-frontend/src/components/dashboard/DashboardReport.css`
- Modify: `BloomFLow-frontend/src/components/dashboard/DashboardHeader.jsx`
- Modify: `BloomFLow-frontend/src/pages/Dashboard/index.jsx`

**Interfaces:**
- `exportDashboardCsv(report)` downloads a CSV file containing period, summary metrics, and activity rows.
- `printDashboardReport(report)` opens a print-friendly report view and calls `window.print()`.

- [ ] Generate CSV values from the same filtered payload currently displayed; escape commas, quotes, and line breaks.
- [ ] Include `Period`, `Date From`, and `Date To` in the CSV and print report.
- [ ] Make `Export report` open a small action menu with `Print / Save as PDF` and `Download CSV`.
- [ ] Disable export while filtered data is loading or unavailable.
- [ ] Ensure the print view excludes navigation, filters, and interactive controls.

### Task 5: Style Responsive Filter and Report

**Files:**
- Modify: `BloomFLow-frontend/src/style.css`
- Modify: `BloomFLow-frontend/src/components/dashboard/DashboardRangeFilter.css`
- Modify: `BloomFLow-frontend/src/components/dashboard/DashboardReport.css`

- [ ] Use existing theme variables for light/dark mode.
- [ ] Keep the range selector aligned with the Dashboard header on desktop and stacked on mobile.
- [ ] Ensure report tables remain readable in print and do not clip activity text.
- [ ] Hide report-only controls during printing using `@media print`.

### Task 6: End-to-End Verification

**Files:**
- Verify all backend and frontend files from Tasks 1-5.

- [ ] Run backend syntax/tests and confirm the dashboard route returns the expected date-filtered shape.
- [ ] Run frontend `git diff --check` and `npm run build`.
- [ ] Manually verify Head Office 7/30/60 changes all supported widgets together.
- [ ] Manually verify CSV contains the selected period and filtered rows.
- [ ] Manually verify print opens a report that can be saved as PDF and does not print app chrome.
- [ ] Verify Branch Staff and Super Admin dashboards retain their existing behavior.
