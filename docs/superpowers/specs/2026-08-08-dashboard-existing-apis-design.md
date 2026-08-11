# BloomFlow Dashboard Existing APIs Design

## Scope

Implement only the frontend Dashboard page. Do not modify or create backend code, routes, API contracts, Sidebar, or Navbar. Reuse the existing `src/services/api.js` Axios client and current project styling conventions.

## Data Flow

`Dashboard/index.jsx` calls `useDashboard()` and orchestrates the page layout. `useDashboard` is the single source of truth for dashboard data, loading state, resource errors, selected branch, and `refresh()`. `dashboardService.js` contains all endpoint calls. The hook uses `Promise.allSettled()` so unavailable or unauthorized resources do not prevent supported widgets from rendering.

Available data sources:

- `GET /branches` for authorized Super Admin and Head Office users.
- `GET /farms` for authorized Super Admin and Head Office users.
- `GET /inventory/head-office` for Super Admin and Head Office users.
- `GET /inventory/branches` for Super Admin and Head Office users.
- `GET /inventory/my-branch` for Branch Staff users.
- `GET /daily-sales` for recent daily sales activity.
- `GET /receivings` for recent receiving activity where the role is authorized.

## Components

Create reusable components under `src/components/dashboard/` for the header, summary cards, branch selector, each chart, recent activities, and loading skeleton. Create `src/hooks/useDashboard.js` and `src/services/dashboardService.js`. Dashboard-specific CSS belongs in `src/style.css`; existing `nav.css` must not change.

## Supported Widgets

- Total Branches uses the branches response count.
- Total Farms uses the farms response count.
- Head Office Stock aggregates `totalAvailable` from head-office inventory.
- Total Branch Stock aggregates branch inventory quantities.
- Flower Status Pie aggregates only `FRESH`, `GRADE_C`, and `DAMAGED` from branch inventory. Labels are rendered as `Fresh`, `Grade C`, and `Damaged`.
- Recent Activities merges receiving and daily-sales rows, normalizes their display fields, sorts newest first, and displays the latest entries.

The branch selector uses `GET /branches` for authorized roles and filters the branch inventory data client-side. Branch Staff automatically use `GET /inventory/my-branch`; their selector displays `My Branch` and is disabled.

## Unsupported Widgets

Forecast Harvested, Flowers In Transit, Top Flower Sales, Monthly Revenue, and Distribution Status remain in the layout but render a clean `Awaiting backend support` state. They must not use dummy values. Their components accept data props shaped for future API responses so a later endpoint can populate them without changing the page structure.

## States and Responsive Behavior

The Dashboard shows a skeleton during the initial fetch, resource-level error messaging where a supported endpoint fails, and a retry action through `refresh()`. Empty supported responses use an empty state. Charts use Recharts `ResponsiveContainer` and resize across desktop, tablet, and mobile. API errors are presented without exposing raw implementation details.

## Verification

Run the frontend production build. Confirm no Sidebar or Navbar files changed, all API calls use the existing client, no mock statistics are introduced, the pie chart has exactly three allowed statuses, and all unsupported widgets visibly say `Awaiting backend support`.
