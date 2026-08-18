# BloomFlow Frontend

Web application for BloomFlow, a flower distribution planning system that helps head-office and branch teams manage inventory, sales, forecasting, distribution, and operational reporting.

## Technology Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS
- Axios
- Framer Motion
- Lucide React
- Recharts

## Core Features

- JWT authentication and protected routes
- Role-aware interfaces for Super Admin, Head Office, and Branch Staff
- Head-office and branch dashboards with operational reports
- Inventory summaries and flower batch details
- Head-office receiving and quality-control workflows
- Branch daily-sales recording
- Forecast-driven distribution planning
- Distribution order, shipment, and branch receiving workflows
- Farm, branch, flower, user, and system configuration management
- Light and dark themes

## Local Setup

### Prerequisites

- Node.js
- npm
- A running BloomFlow backend API

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows Command Prompt, use `copy .env.example .env`.

3. Set `VITE_API_BASE_URL` in `.env` to the BloomFlow backend URL.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Create and preview a production build when needed:

   ```bash
   npm run build
   npm run preview
   ```

Vite prints the local application URL when the development server starts.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:8000` | Base URL of the BloomFlow backend API |

Refer to [`.env.example`](.env.example) for the environment template.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Application Architecture

The application uses React Router for navigation and protected routes. Context providers restore authentication state and manage the active theme. Pages compose reusable components and hooks, while service modules use a shared Axios client to communicate with the backend.

The frontend handles presentation, user input, and client-side feedback. The backend remains authoritative for authentication, authorization, business rules, branch scope, inventory transactions, and forecasting orchestration.

## Backend Integration

API requests use `VITE_API_BASE_URL`. The shared Axios client reads the JWT from browser storage and automatically adds it as a Bearer token to authenticated requests.

See the [API contract](docs/API_Contract.yaml) for endpoint definitions, roles, request formats, and response formats.

## Project Structure

```text
Bloom-FLow-frontend/
|-- docs/                 Project documentation and RFCs
|-- public/               Static public assets
|-- src/
|   |-- assets/           Application images and assets
|   |-- components/       Reusable UI and feature components
|   |-- contexts/         Authentication and theme state
|   |-- hooks/            Reusable page and data hooks
|   |-- layouts/          Shared application layout
|   |-- pages/            Route-level application screens
|   `-- services/         Backend API clients
|-- .env.example          Environment variable template
|-- vite.config.js        Vite and Tailwind configuration
`-- package.json          Dependencies and npm scripts
```

## Documentation

- [API Contract](docs/API_Contract.yaml)
- [Entity Relationship Diagram](docs/ERD.md)
- [Product Requirements Document](docs/PRD_BloomFlow.md)
- [System Architecture RFC](docs/RFC/RFC-001-System-Architecture.md)
- [Feature RFCs](docs/RFC/)

## License

No license is currently declared in `package.json`. Add a license file and update this section before distributing the project under a specific license.
