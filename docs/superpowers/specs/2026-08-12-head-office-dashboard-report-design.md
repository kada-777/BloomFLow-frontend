# Head Office Dashboard Export Report — Design Spec

> Companion to `docs/superpowers/plans/2026-08-12-head-office-dashboard-date-filter-report.md` (Task 4 — Implement Filtered Dashboard Export). This spec covers only the **PDF/print report view** that visually matches the Head Office Dashboard. CSV behaviour is in-scope only as far as it shares the same filtered payload.

## Scope

Make the Head Office "Print / Save as PDF" report reproduce the Head Office Dashboard view exactly: a period/branch header, summary cards with icons, the Flower Status pie chart, the Top Flower Sales bar chart, and the Recent Activities table. App chrome (navbar, sidebar, filters) is hidden in print. **Frontend only — no backend, schema, or API changes.**

## Status

- Filter + payload: already implemented by `useDashboard` for `STAFF_HEAD_OFFICE` (`rangeDays`, `period`, `summary`, `flowerStatus`, `topFlowerSales`, `activities`, `activitiesPagination`, `selectedBranchName`).
- Export surface: `src/services/dashboardExport.js` exposes `exportDashboardCsv(report)` (bland CSV, no period) and `printDashboardReport(report)` (bland `<li>` + table print via `window.open` + `document.write`). Both are replaced/rewired here.

## Data Shape (consumed)

From `useDashboard()` for Head Office:

```
{
  period: { days, dateFrom, dateTo } | null,
  summary: { totalBranches, totalFarms, headOfficeStock, totalBranchStock, forecastHarvested(null), flowersInTransit(null) },
  flowerStatus: [{ key, label, color, value }],
  topFlowerSales: [{ flowerName, soldQuantity }],
  activities: [{ id, type, title, detail, date }],
  activitiesPagination: { page, pages, total },
  selectedBranchName: string,
  resourceErrors: { branches, farms, headOfficeInventory, branchInventory, dailySales, receivings },
}
```

## Architecture

- **`DashboardReport.jsx` (new, presentational):** renders the dashboard widgets from a single `report` prop so the report stays visually identical to the dashboard (single source of truth = reuse existing components). Accepts `{ period, summary, activities, activitiesPagination, flowerStatus, topFlowerSales, branchName, resourceErrors, loading }` plus a `renderControls?` slot for a Print toolbar.
- **`DashboardReport.css` (new):** scoped print-friendly layout reusing existing theme vars (`--card`, `--border`, `--soft`, `--text`, `--muted`, `--accent`, `--shadow`, `--sage`). Fixed chart heights so Recharts `ResponsiveContainer` renders crisp SVG in print.
- **Dedicated route `/dashboard/report`:** renders `DashboardReport` standalone (no layout chrome) so it can be opened in a fresh tab and reliably `window.print()`. Reuses `useDashboard()` — no duplicate fetching logic. On mount it auto-triggers `window.print()` after the charts have laid out.
- **`dashboardExport.js`:** keep `exportDashboardCsv(report)` and extend it to include `Date From`/`Date To` (already in payload via `period`). Replace `printDashboardReport`'s `document.write` implementation with `openDashboardReport()` that navigates to `/dashboard/report?days=<n>&branch=<id>` (carries the active filter so the printed report reflects the current view).
- **`DashboardHeader.jsx`:** replace the single "Export report" button with a small inline action menu (Popover/button group) exposing **Print / Save as PDF** and **Download CSV**. Menu disabled while Head Office data is `loading` or when `period` is null — keeps the dashboard unchanged for Super Admin / Branch Staff.
- **`Dashboard/index.jsx`:** pass the live `data` + `period` + `rangeDays` + `selectedBranch` into the export menu callbacks (CSV uses them directly; Print opens the report route with the matching query).
- **`App.jsx`:** add route `<Route path="/dashboard/report" element={<DashboardReportPage />} />` rendering `<DashboardReport>` wired to `useDashboard()`.
- **`style.css`:** add `@media print` rules: hide `navbar`, `sidebar`, `.sidebar-toggle`, `.dashboard-range-filter`, `.dashboard-export-actions`, `.profile-menu`, `button` controls; keep report content; force `-webkit-print-color-adjust: exact` and background on `.dashboard-card`/`.dashboard-summary-card` so shadows/borders print.

## Components / Reuse

Reuse existing components (no visual drift):

- `SummaryCards` — unchanged props; Head Office sees Total Branches, Total Farms, Head Office Stock, Total Branch Stock (Forecast Harvested + Flowers In Transit marked unsupported/null per spec constraint #19).
- `FlowerStatusPieChart` — `data={flowerStatus}` (print renders as SVG).
- `TopFlowerSalesChart` — `data={topFlowerSales}`.
- `RecentActivityTable` — `activities` + `pagination`; pagination UI hidden in print.

The report's page header mirrors `page-header` styling (eyebrow "BloomFlow Operations", title "Head Office Report", subtitle with period + branch), but is a separate `dashboard-report-header` so print CSS can target it independently.

## Visual Language

- Follow existing `docs/superpowers/plans/2026-08-09-receiving-head-office-design.md` palette: warm beige header accent (`--accent`), olive/sage actions (`--sage`), soft pink accent, neutral borders, white cards, 18–20px radius, subtle shadows, Plus Jakarta Sans headings / Inter body.
- Charts: fixed `min-height: 300px` so `ResponsiveContainer` measures and prints crisp.
- Print: A4-friendly single column, card gutters, no page-break inside cards (`break-inside: avoid`).

## Error / Loading / Edge Cases

- `period` is null (no Head Office data yet): Print/Download disabled.
- `resourceErrors` present per widget: each widget shows its existing error/empty state (no fabricated values).
- Empty `activities` / `topFlowerSales`: existing `DashboardState` empty/unsupported states render in the report.

## Out of Scope

- Backend aggregation contract (Task 1–2 of the existing plan).
- Branch Staff / Super Admin report (dashboard header keeps `showAction={!isHeadOffice}`).
- Real PDF generation libraries (jsPDF/html2canvas) — intentionally avoided; browser "Save as PDF" is the target and is already referenced by existing copy.
- Modifying shared layout, navigation, or `AppLayout`.

## Verification

- `git diff --check` (no whitespace errors).
- `npm run build` (Vite builds, route resolves).
- Manual: as Head Office, select 7/30/60, "Print / Save as PDF" opens report in a new tab and auto-prompts print; saved PDF shows cards (with icons), both charts, and the activity table; "Download CSV" includes Date From/Date To + filtered activities.
- Manual: Super Admin and Branch Staff dashboards keep `showAction={!isHeadOffice}` and see no export menu change.
- Manual print preview hides navbar/sidebar/filters and prints report content + card backgrounds.
