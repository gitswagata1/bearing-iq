<div align="center">

# 🔩 Bearing IQ

### AI-powered intelligence platform for bearing manufacturing

Visual inspection · Quotation · Failure analysis · Predictive maintenance · Sourcing intelligence — unified in one executive command center.

![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)

*Built for Micro Turner Group by [Swagata Banerjee](https://github.com/gitswagata1)*

</div>

> **Problem:** plant teams find out a bearing or spindle is failing only when the machine stops.
> **Solution:** turn a sensor trend into a health score, a failure probability and hours-to-failure *with an uncertainty range*, and put it next to quality, sales and sourcing views.
>
> **Key features:** ① Remaining-life model (exponential degradation fit + bootstrap P10/P50/P90) with a backtest · ② one-screen prediction story: sensor trend → health → P(failure) → hours left · ③ executive command center over six typed FastAPI modules
>
> **Tech stack:** FastAPI · Pydantic · NumPy · Next.js 16 · React 19 · Tailwind 4 · plain-SVG charts
>
> **Status: prototype.** All data is simulated or synthetic (labelled on screen). Not connected to plant sensors.
>
> **How this maps to battery-lifespan prediction:** health indicator → degradation curve → threshold crossing → remaining useful life. Swap RMS vibration for capacity/SoH and the 7.1 mm/s alarm for 80 % capacity, and the same pipeline predicts remaining cycles with an uncertainty band.

<p align="center">
  <a href="#-why-this-exists">Why</a> ·
  <a href="#-whats-inside">Modules</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-demo-walkthrough">Demo</a> ·
  <a href="#-api-reference">API</a> ·
  <a href="#-troubleshooting">Troubleshooting</a> ·
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🎯 Why this exists

A bearing plant makes decisions in five disconnected places: the inspection line, the sales desk, the customer-complaint file, the shop floor and the purchase office. Bearing IQ puts an AI assistant in each of them and rolls the results into a single screen a plant head can read in 30 seconds.

## 🧩 What's inside

| Module | Question it answers | Key output |
|---|---|---|
| 📊 **Executive Command Center** | *How is the plant doing right now?* | First-pass yield, plant health, downtime cost avoided, quote pipeline, defect mix, stock vs demand |
| 🔍 **Visual Inspection** | *Is this bearing shippable?* | Pass/defect, defect type, severity grade, location, disposition |
| 💰 **Quotation Assistant** | *What should we quote, and to whom?* | Price with GST, lead time, customer history, upsell hint |
| 🔧 **Failure Analysis** | *Why did this bearing fail in the field?* | Root-cause ranking, corrective actions, fleet-wide failure patterns |
| ⚙️ **Predictive Maintenance** | *Which machine fails next, and what does it cost?* | Health score, failure probability, hours-to-failure, prevention vs breakdown cost |
| 📉 **Remaining Life** | *How many hours until this bearing crosses its alarm level, and how sure are we?* | Fitted degradation curve, P10/P50/P90 RUL, P(failure ≤ 72 h), backtest metrics |
| 📦 **Sourcing Intelligence** | *What should we buy this quarter?* | Demand forecast, stock cover, supplier scorecards, buy-now list |

## 🏗 Architecture

```mermaid
flowchart LR
    UI["Next.js 16 + React 19<br/>Tailwind 4 · SVG charts"] -- REST / JSON --> API["FastAPI"]
    API --> D["/api/dashboard<br/>roll-up of all modules"]
    D --> I["/api/inspect"]
    D --> M["/api/maintenance"]
    D --> S["/api/sourcing"]
    D --> Q["/api/quote"]
    API --> F["/api/failure"]
    UI -. API offline .-> DEMO["Built-in sample data"]
```

- **Single roll-up endpoint** — `GET /api/dashboard/overview` serves the whole command center in one round trip; the UI refreshes every 30 s.
- **Offline-safe frontend** — if the API is unreachable, the UI falls back to sample data and shows a clear "Sample data" indicator, so demos never break.
- **Zero chart dependencies** — donut, bar and stock charts are plain SVG: tiny bundle, no supply-chain surface.
- **Typed contracts** — every endpoint is a Pydantic model, browsable at `/docs`.

## 📉 How the remaining-life model works

Code: [`backend/routers/rul.py`](backend/routers/rul.py) · UI: `/remaining-life`

| | |
|---|---|
| **Data** | Synthetic hourly RMS vibration (mm/s): exponential degradation + noise, fixed seeds. *Not plant data.* |
| **Features** | Last 120 h of vibration, baseline (median of first 48 h), time since install |
| **Model** | `v(t) = v0 + exp(a + b·t)`, least-squares fit on `log(v − v0)`; failure = crossing 7.1 mm/s (demo alarm level) |
| **Outputs** | Health score (0–100), P(failure within 72 h), RUL point estimate and P10/P50/P90 |
| **Uncertainty** | Residual bootstrap, 300 refits |
| **Validation** | Backtest on 20 held-out synthetic run-to-failure histories, predicting at 60/75/90 % of life (60 predictions): **MAE 27.6 h** on a mean true RUL of 309 h; **62 %** of true RULs fall inside the P10–P90 band (the band is too narrow, because the bootstrap captures noise but not model error) |
| **Limitations** | Single sensor; assumes monotonic exponential degradation; validated only on synthetic data from the same model family, so these numbers are optimistic |

## 🔬 What is real vs simulated (honest scope)

| Module | What the code does today |
|---|---|
| Remaining Life | **Real algorithm** (curve fit, bootstrap, backtest) on **synthetic** sensor data |
| Predictive Maintenance | Values drawn at random from status-based ranges (normal / warning / critical) |
| Visual Inspection | Accepts an image upload; verdict is **simulated** (no vision model yet) |
| Failure Analysis | **Keyword rules** map the description to a failure mode and a curated root-cause table; confidence value is simulated |
| Quotation | Rule-based pricing from a parts table; history is simulated |
| Sourcing | Simulated demand forecast and supplier scores |

## 🚀 Quick start

**Prerequisites:** Python 3.11+ and Node.js 20+

```bash
# 1 · Backend  → http://localhost:8000/docs
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload

# 2 · Frontend → http://localhost:3000
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the status chip in the top-right shows **API connected** when the backend is running.

## 🎬 Demo walkthrough

A 5-minute tour for stakeholders:

1. **Command Center (`/`)** — read the four KPI cards, then the defect mix and machine-health bars. Hit **Refresh**: values change because the API is live.
2. **Remaining Life** — pick HT-01: sensor trend → health 21 → 27 % P(failure ≤ 72 h) → 76 h (80 % range 68–85 h). Scroll to *How the model works* and the backtest.
3. **Predictive Maintenance** — open the machine at risk; compare *cost of prevention* vs *cost of breakdown*.
4. **Sourcing** — check which parts need reorder and the supplier scorecard.
5. **Inspection** — upload any bearing photo to see the inspection workflow (verdict is simulated; no vision model yet).
6. **Quotation** — generate a quote and review the AI notes and upsell hint.
7. **Kill the backend** — the UI keeps working on sample data and flags it with a yellow banner.

## 📸 Screenshots

| Command center | Remaining-life prediction | Model explanation |
|---|---|---|
| ![](docs/screenshots/01-command-center.png) | ![](docs/screenshots/02-maintenance-prediction.png) | ![](docs/screenshots/03-model-explanation.png) |

## 📡 API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/overview` | Aggregated KPIs and chart data for the command center |
| POST | `/api/inspect` | Upload a bearing image, get an inspection verdict |
| GET | `/api/inspect/stats` | Inspection totals, defect rate, defect-type mix |
| POST | `/api/quote` | Generate an AI-assisted quotation |
| GET | `/api/quote/history` | Recent quotes and statuses |
| POST | `/api/failure/analyze` | Diagnose a field failure |
| GET | `/api/failure/patterns` | Failure-mode statistics |
| GET | `/api/maintenance/machines` | Health of every machine |
| GET | `/api/maintenance/alerts` | Active predictive alerts |
| GET | `/api/sourcing/forecast` | Demand forecast and stock cover |
| GET | `/api/sourcing/suppliers` | Supplier scorecards |
| GET | `/api/sourcing/recommendation` | Quarterly procurement recommendation |
| GET | `/api/rul/assets` | Remaining-life prediction for each monitored asset (history, fit, P10/P50/P90) |
| GET | `/api/rul/model-card` | Model description, features, backtest metrics, limitations |

## ⚙️ Configuration

| File | Variable | Purpose |
|---|---|---|
| `backend/.env` | `CORS_ORIGINS` | Comma-separated origins allowed to call the API (default `http://localhost:3000`) |
| `backend/.env` | `ANTHROPIC_API_KEY` | Reserved for LLM-backed modules |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | API base URL (default `http://localhost:8000`) |

## 📁 Project structure

```
bearing-iq/
├── backend/
│   ├── main.py              # app, CORS, timing middleware, routers
│   └── routers/             # dashboard · inspection · quotation · failure · maintenance · sourcing
└── frontend/
    └── src/
        ├── app/             # command center + one page per module
        ├── components/      # Sidebar, StatCard, StatusBadge, Charts (SVG)
        └── lib/             # API client, demo data
```

## 🩺 Troubleshooting

| Symptom | Fix |
|---|---|
| `localhost:3000` refuses to connect | The frontend isn't running — run `npm run dev` in `frontend/` |
| Yellow "Prototype · sample data — API offline" banner | Backend isn't running or `NEXT_PUBLIC_API_URL` is wrong |
| Browser console shows CORS errors | Add your frontend origin to `CORS_ORIGINS` in `backend/.env` and restart |
| PowerShell blocks `activate` | `Set-ExecutionPolicy -Scope Process Bypass`, then activate again |
| `pip install` fails on Pillow / NumPy | Use `pillow>=11` and `numpy>=2.1` for newer Python versions |
| Port already in use | `uvicorn main:app --port 8001` and update `NEXT_PUBLIC_API_URL` |

## 🗺 Roadmap

> ⚠️ **Prototype.** The inspection, maintenance and sourcing engines currently generate realistic *simulated* data behind production-shaped APIs. Numbers on screen are not live plant data.

- [x] Executive command center with live roll-up API
- [x] Five module UIs with offline sample-data fallback
- [x] Remaining-life model with uncertainty and backtest (synthetic data)
- [ ] Validate RUL model on a public run-to-failure bearing dataset
- [ ] Vision model for real defect detection
- [ ] Persistent database and historical trends
- [ ] Authentication and role-based access
- [ ] ERP / MES / sensor integrations
- [ ] Docker + CI/CD deployment

## 🤝 Contributing

Branch from `main`, keep changes focused, and open a pull request describing the module touched and how you tested it.

## 👤 Author

**Swagata Banerjee** — Forward Deployed Engineering, Micro Turners · [@gitswagata1](https://github.com/gitswagata1)
