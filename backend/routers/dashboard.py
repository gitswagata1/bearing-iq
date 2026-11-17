"""Executive dashboard: one call that rolls up every module into plant-level KPIs."""
from datetime import datetime, timezone

from fastapi import APIRouter

from routers import inspection, maintenance, quotation, sourcing

router = APIRouter(prefix="/api/dashboard", tags=["Executive Dashboard"])


@router.get("/overview")
async def overview():
    stats = await inspection.inspection_stats()
    machines = await maintenance.get_machines()
    forecast = await sourcing.demand_forecast()
    suppliers = await sourcing.supplier_scorecard()
    quotes = await quotation.quote_history()

    at_risk = [m for m in machines if m.status != "normal"]
    savings = sum(m.ai_prediction.savings_if_prevented for m in at_risk)
    open_quotes = [q for q in quotes if q.status in ("Pending", "Sent", "Approved")]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "kpis": {
            "total_inspected": stats.total_inspected,
            "defect_rate_pct": stats.defect_rate_pct,
            "first_pass_yield_pct": round(stats.total_passed / stats.total_inspected * 100, 1),
            "plant_health_pct": round(sum(m.health_score for m in machines) / len(machines)),
            "machines_at_risk": len(at_risk),
            "downtime_cost_avoided": savings,
            "reorders_needed": sum(1 for f in forecast if f.reorder_needed),
            "avg_supplier_score": round(sum(s.score for s in suppliers) / len(suppliers)),
            "open_quote_value": round(sum(q.total_amount for q in open_quotes)),
        },
        "defect_types": stats.common_defect_types,
        "machines": [
            {
                "machine_id": m.machine_id,
                "name": m.name,
                "status": m.status,
                "health_score": m.health_score,
                "failure_probability_pct": m.ai_prediction.failure_probability_pct,
                "hours_to_failure": m.ai_prediction.estimated_time_to_failure_hours,
            }
            for m in machines
        ],
        "forecast": [
            {
                "part_number": f.part_number,
                "current_stock": f.current_stock,
                "forecast_demand": f.forecast_demand,
                "stock_cover_days": f.stock_cover_days,
                "reorder_needed": f.reorder_needed,
                "percentage_change": f.percentage_change,
            }
            for f in forecast
        ],
        "suppliers": [
            {"name": s.name, "score": s.score, "status": s.status} for s in suppliers
        ],
        "period": stats.period,
    }
