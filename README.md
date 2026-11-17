# Bearing IQ — AI Bearing Manufacturing Intelligence Platform

An executive command center and five AI modules for a bearing manufacturer, built for Micro Turner Group.

| Module | What it does |
|---|---|
| **Executive Dashboard** | One-screen KPIs: first-pass yield, plant health, downtime cost avoided, quote pipeline, defect mix, stock vs demand |
| **Visual Inspection** | Upload a bearing image → defect type, severity, location, disposition |
| **Quotation** | AI-assisted pricing with customer history and upsell hints |
| **Failure Analysis** | Failure-mode diagnosis and fleet-wide pattern statistics |
| **Predictive Maintenance** | Machine health, failure probability, cost of prevention vs breakdown |
| **Sourcing Intelligence** | Demand forecast, supplier scorecards, procurement recommendations |

**Stack:** FastAPI (Python) · Next.js 16 / React 19 · Tailwind CSS 4 · dependency-free SVG charts

> The current AI engines are simulation layers with realistic data contracts, so the UI and API are production-shaped and ready to plug in real models. The frontend falls back to sample data automatically if the API is offline.

## Quick start

```bash
# Backend  (http://localhost:8000/docs)
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload

# Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

## Key endpoints

- `GET /api/dashboard/overview` — aggregated KPIs for the command center (auto-refreshes every 30 s)
- `POST /api/inspect` · `GET /api/inspect/stats`
- `POST /api/quote` · `GET /api/quote/history`
- `POST /api/failure/analyze` · `GET /api/failure/patterns`
- `GET /api/maintenance/machines` · `/alerts`
- `GET /api/sourcing/forecast` · `/suppliers` · `/recommendation`

## Configuration

`backend/.env`: `CORS_ORIGINS` (comma-separated allowed origins), `ANTHROPIC_API_KEY`.
`frontend/.env.local`: `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Roadmap

Real vision model for inspection · persistent database · authentication & roles · ERP/MES integrations · Docker deployment.
