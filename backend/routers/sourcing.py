import random
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/sourcing", tags=["Sourcing Intelligence"])


class ForecastItem(BaseModel):
    part_number: str
    part_description: str
    current_stock: int
    forecast_demand: int
    trend: str
    percentage_change: float
    stock_cover_days: int
    reorder_needed: bool


class SupplierScore(BaseModel):
    supplier_id: str
    name: str
    score: int
    on_time_delivery_pct: float
    quality_rejection_pct: float
    price_competitiveness: str
    payment_terms: str
    status: str
    last_delivery: str
    notes: str


class Recommendation(BaseModel):
    generated_at: str
    quarter: str
    summary: str
    buy_now: list[str]
    watch_list: list[str]
    risk_alerts: list[str]
    estimated_savings: str
    ai_version: str


FORECAST_DATA = [
    {
        "part_number": "6200-2RS",
        "part_description": "Deep Groove Ball Bearing 6200-2RS",
        "stock_range": (2800, 3500),
        "demand_range": (11000, 13500),
        "trend": "up",
        "change": (15, 22),
    },
    {
        "part_number": "6300-2RS",
        "part_description": "Deep Groove Ball Bearing 6300-2RS",
        "stock_range": (1500, 2200),
        "demand_range": (7500, 9000),
        "trend": "flat",
        "change": (-3, 4),
    },
    {
        "part_number": "30205",
        "part_description": "Taper Roller Bearing 30205",
        "stock_range": (600, 1000),
        "demand_range": (4200, 5500),
        "trend": "up",
        "change": (20, 30),
    },
    {
        "part_number": "6205-2RS",
        "part_description": "Deep Groove Ball Bearing 6205-2RS",
        "stock_range": (1800, 2600),
        "demand_range": (6000, 7500),
        "trend": "up",
        "change": (8, 15),
    },
    {
        "part_number": "UCP205",
        "part_description": "Pillow Block Bearing UCP205",
        "stock_range": (300, 600),
        "demand_range": (2000, 3000),
        "trend": "flat",
        "change": (-2, 5),
    },
    {
        "part_number": "6200-ZZ",
        "part_description": "Deep Groove Ball Bearing 6200-ZZ",
        "stock_range": (2000, 2800),
        "demand_range": (5000, 6500),
        "trend": "down",
        "change": (-12, -5),
    },
]

SUPPLIERS = [
    {
        "id": "SUP-001",
        "name": "Jai Steel Industries",
        "score": 92,
        "otd": (90, 96),
        "reject": (0.8, 1.5),
        "price": "Competitive",
        "terms": "Net 45 days",
        "status": "preferred",
        "notes": "Consistently best on delivery and quality. Primary supplier for GCr15 chrome steel.",
    },
    {
        "id": "SUP-002",
        "name": "Rajasthan Alloys Ltd",
        "score": 78,
        "otd": (75, 85),
        "reject": (1.5, 2.5),
        "price": "Average",
        "terms": "Net 30 days",
        "status": "approved",
        "notes": "Good backup supplier. Slightly higher rejection rate on surface finish.",
    },
    {
        "id": "SUP-003",
        "name": "Gupta Metal Works",
        "score": 61,
        "otd": (55, 68),
        "reject": (2.8, 4.0),
        "price": "Low",
        "terms": "Net 30 days",
        "status": "under_review",
        "notes": "Cheapest pricing but quality inconsistent. Last 2 batches had 3.2% rejection. Under review.",
    },
    {
        "id": "SUP-004",
        "name": "Tata Steel (Special Bars)",
        "score": 88,
        "otd": (88, 95),
        "reject": (0.5, 1.2),
        "price": "Premium",
        "terms": "Net 60 days",
        "status": "approved",
        "notes": "Premium quality, higher cost. Use for bearing grades requiring certified metallurgy.",
    },
    {
        "id": "SUP-005",
        "name": "Chennai Forge & Alloys",
        "score": 45,
        "otd": (40, 55),
        "reject": (4.0, 6.5),
        "price": "Low",
        "terms": "Advance payment",
        "status": "probation",
        "notes": "On probation. 3 consecutive batches with >4% rejection. Next batch is final evaluation.",
    },
]


@router.get("/forecast", response_model=list[ForecastItem])
async def demand_forecast():
    results = []
    for item in FORECAST_DATA:
        stock = random.randint(*item["stock_range"])
        demand = random.randint(*item["demand_range"])
        change = round(random.uniform(*item["change"]), 1)
        cover_days = int(stock / (demand / 90)) if demand > 0 else 999
        results.append(ForecastItem(
            part_number=item["part_number"],
            part_description=item["part_description"],
            current_stock=stock,
            forecast_demand=demand,
            trend=item["trend"],
            percentage_change=change,
            stock_cover_days=cover_days,
            reorder_needed=cover_days < 30,
        ))
    return results


@router.get("/suppliers", response_model=list[SupplierScore])
async def supplier_scorecard():
    results = []
    for s in SUPPLIERS:
        results.append(SupplierScore(
            supplier_id=s["id"],
            name=s["name"],
            score=s["score"],
            on_time_delivery_pct=round(random.uniform(*s["otd"]), 1),
            quality_rejection_pct=round(random.uniform(*s["reject"]), 1),
            price_competitiveness=s["price"],
            payment_terms=s["terms"],
            status=s["status"],
            last_delivery=(datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            notes=s["notes"],
        ))
    return results


@router.get("/recommendation", response_model=Recommendation)
async def procurement_recommendation():
    return Recommendation(
        generated_at=datetime.now(timezone.utc).isoformat(),
        quarter="Q4 2026 (Oct–Dec)",
        summary=(
            "Q4 demand is projected to increase 12–18% overall, driven primarily by "
            "6200-2RS (+18%) and Taper Roller 30205 (+25%). Chrome steel (GCr15) spot "
            "prices are currently 8% below the 6-month average, creating a favourable "
            "procurement window. Recommend locking in Q4 supply with Jai Steel Industries "
            "at current rates to capture savings."
        ),
        buy_now=[
            "GCr15 Chrome Steel — 8% below 6-month avg. Lock Q4 supply with SUP-001 (Jai Steel). Est. saving: ₹1.8L.",
            "6200-2RS raw stock — demand up 18%. Current inventory covers only 22 days. Reorder immediately.",
            "30205 Taper Roller blanks — demand up 25%. Stock cover < 15 days. Priority procurement.",
        ],
        watch_list=[
            "SUP-003 (Gupta Metal Works) — rejection rate 3.2% vs 1.5% industry avg. If next batch exceeds 2%, switch to SUP-002.",
            "6200-ZZ demand trending down (-8%). Reduce Q4 order by 10% to avoid overstocking.",
            "Polyurea grease prices rising (+12% in 3 months). Consider bulk purchase if trend continues.",
        ],
        risk_alerts=[
            "SUP-005 (Chennai Forge) on probation — 3 consecutive batches >4% rejection. Final evaluation pending.",
            "6200-2RS stock cover at 22 days — below 30-day safety threshold. Reorder trigger activated.",
            "Taper Roller 30205 — single-source dependency on SUP-001. Qualify SUP-004 as backup.",
        ],
        estimated_savings="₹1.8–2.5L if GCr15 procured at current spot prices vs projected Nov rates",
        ai_version="MT-Sourcing-v1.0.0",
    )
