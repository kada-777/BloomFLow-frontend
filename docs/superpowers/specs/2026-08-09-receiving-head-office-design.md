# BloomFlow Head Office Receiving Design

## Scope

Implement the frontend `/receiving` page for Head Office using only existing APIs and reusable frontend components. Add the missing frontend route. Do not create or modify backend code, database schema, migration, or API endpoint.

## Existing API and Access

- `GET /receivings` lists Receiving summaries for Superadmin and Head Office.
- `GET /receivings/:id` returns Receiving detail for Superadmin and Head Office.
- `POST /receivings` creates a Receiving for Head Office.
- There is no PATCH or DELETE Receiving endpoint, so Edit is represented by the reusable form mode but no edit action is exposed yet, and Delete is not rendered in the table.
- `GET /farms` supplies Farm dropdown options.
- `GET /flowers` supplies Flower dropdown options.
- All requests reuse `src/services/api.js` for Bearer authentication.

## API Fields

Receiving header fields:

- `id`: backend-created, readonly in view mode and shown as a placeholder before creation.
- `farmId`: selected Farm ID.
- `receivedDate`: `YYYY-MM-DD` date input.

Each dynamic item contains the complete API contract:

- `flowerId`
- `shippedQuantity`
- `actualReceivedQuantity`
- `acceptedQuantity`
- `unusableQuantity`
- `unusableNotes`

The `+ Tambah Jenis Bunga` button adds exactly one new item input group. It does not add another form section. The item group prominently includes Flower, Accepted Quantity, and Unusable Quantity, while the required shipment quantities and notes are included in the same reusable item card.

## Architecture

- `receivingService.js` wraps list, detail, create, farms, and flowers requests.
- `useReceiving` owns list/detail/form state, client-side search/date/farm filtering, loading, errors, and refresh.
- `ReceivingPage` orchestrates layout and passes props.
- `ReceivingFormCard` is one reusable component with `create`, `view`, and `edit` modes.
- `FlowerItemCard` renders one item from an array and supports removal only when more than one item exists.
- Existing `GenericDataTable`, `SearchBar`, `Modal`, `EmptyState`, and loading/error patterns are reused.

## List UI

The Head Office sidebar already contains `/receiving`; only the frontend route is added. The page includes a title, subtitle, New Receiving button, search, date filter, Farm dropdown, and GenericDataTable. Columns are limited to Receiving ID, Received Date, Farm ID/name, Flower Summary, and View Detail. Flower Summary uses the API item count from `_count.items`; detail view shows actual flower names and quantities.

The existing list endpoint applies pagination but does not implement date/farm query filtering in the current backend service. The frontend requests the available page size and filters the loaded list client-side.

## Form and Validation

Create mode enables all fields and submits the exact backend payload. View mode renders the same structure readonly with backend detail data. Edit mode is supported structurally but remains unavailable in the list because no PATCH endpoint exists. Client validation mirrors backend rules:

- farm and received date are required.
- at least one item is required.
- each Flower is required and unique within the Receiving.
- numeric quantities are non-negative decimal values.
- `actualReceivedQuantity <= shippedQuantity`.
- `acceptedQuantity + unusableQuantity = actualReceivedQuantity`.
- notes are optional text.

Submit shows loading and success/error feedback. No dummy IDs, Flowers, Farms, quantities, or statuses are generated.

## Visual Language

Use existing BloomFlow palette variables and modal styles: warm beige header accent, olive/sage actions, soft pink accent, neutral borders, white cards, 18–20px radius, subtle shadows, consistent typography, spacing, input heights, and responsive mobile stacking.

## Verification

Verify `/receiving` route, Head Office menu navigation, API endpoint whitelist, form payload fields, dynamic item add/remove behavior, client filters, view detail, validation, loading/error states, and production build. Confirm no backend files changed.
