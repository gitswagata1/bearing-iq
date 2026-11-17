import random
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/maintenance", tags=["Predictive Maintenance"])

MACHINES = [
    {"id": "GRD-01", "name": "Grinding Machine #1", "type": "CNC Cylindrical Grinder"},
    {"id": "GRD-02", "name": "Grinding Machine #2", "type": "CNC Cylindrical Grinder"},
    {"id": "GRD-03", "name": "Grinding Machine #3", "type": "CNC Internal Grinder"},
    {"id": "HT-01", "name": "Heat Treatment Furnace #1", "type": "Continuous Mesh Belt Furnace"},
    {"id": "TURN-01", "name": "CNC Turning Center #1", "type": "CNC Lathe"},
    {"id": "WASH-01", "name": "Parts Washing Station", "type": "Ultrasonic Cleaning System"},
]


class AiPrediction(BaseModel):
    failure_probability_pct: float
    estimated_time_to_failure_hours: int | None
    recommended_action: str
    cost_of_prevention: int
    cost_of_breakdown: int
    savings_if_prevented: int


class MachineHealth(BaseModel):
    machine_id: str
    name: str
    type: str
    status: str
    health_score: int
    vibration_level_mm_s: float
    temperature_celsius: float
    power_draw_kw: float
    vibration_baseline_mm_s: float
    temperature_baseline_celsius: float
    next_scheduled_maintenance: str
    last_maintenance: str
    operating_hours_since_maintenance: int
    ai_prediction: AiPrediction


class AlertItem(BaseModel):
    machine_id: str
    machine_name: str
    status: str
    alert_type: str
    message: str
    detected_at: str
    ai_prediction: AiPrediction


def _generate_machine(m: dict, force_status: str | None = None) -> MachineHealth:
    now = datetime.now(timezone.utc)

    if force_status == "warning":
        health = random.randint(45, 65)
        vib_base = round(random.uniform(1.5, 2.5), 2)
        vib = round(vib_base * random.uniform(1.2, 1.5), 2)
        temp_base = round(random.uniform(55, 70), 1)
        temp = round(temp_base + random.uniform(8, 15), 1)
        power = round(random.uniform(12, 18), 1)
        status = "warning"
        hours_to_fail = random.randint(48, 120)
        fail_prob = round(random.uniform(55, 78), 1)
        prevention_cost = random.randint(2000, 5000)
        breakdown_cost = random.randint(35000, 60000)
        action = f"Schedule maintenance within {hours_to_fail}h. Replace spindle bearing during next shift change."
    elif force_status == "critical":
        health = random.randint(15, 35)
        vib_base = round(random.uniform(1.5, 2.5), 2)
        vib = round(vib_base * random.uniform(1.8, 2.5), 2)
        temp_base = round(random.uniform(55, 70), 1)
        temp = round(temp_base + random.uniform(20, 35), 1)
        power = round(random.uniform(18, 25), 1)
        status = "critical"
        hours_to_fail = random.randint(8, 36)
        fail_prob = round(random.uniform(82, 96), 1)
        prevention_cost = random.randint(4000, 8000)
        breakdown_cost = random.randint(50000, 100000)
        action = f"URGENT: Stop machine within {hours_to_fail}h. Spindle bearing replacement required immediately."
    else:
        health = random.randint(78, 98)
        vib_base = round(random.uniform(1.5, 2.5), 2)
        vib = round(vib_base * random.uniform(0.9, 1.1), 2)
        temp_base = round(random.uniform(55, 70), 1)
        temp = round(temp_base + random.uniform(-3, 3), 1)
        power = round(random.uniform(8, 14), 1)
        status = "normal"
        hours_to_fail = None
        fail_prob = round(random.uniform(2, 12), 1)
        prevention_cost = random.randint(800, 1500)
        breakdown_cost = random.randint(30000, 50000)
        action = "No action required. Next scheduled maintenance on track."

    maint_days = random.randint(5, 25)
    last_maint_days = random.randint(15, 60)

    return MachineHealth(
        machine_id=m["id"],
        name=m["name"],
        type=m["type"],
        status=status,
        health_score=health,
        vibration_level_mm_s=vib,
        temperature_celsius=temp,
        power_draw_kw=power,
        vibration_baseline_mm_s=vib_base,
        temperature_baseline_celsius=temp_base,
        next_scheduled_maintenance=(now + timedelta(days=maint_days)).strftime("%Y-%m-%d"),
        last_maintenance=(now - timedelta(days=last_maint_days)).strftime("%Y-%m-%d"),
        operating_hours_since_maintenance=last_maint_days * random.randint(8, 16),
        ai_prediction=AiPrediction(
            failure_probability_pct=fail_prob,
            estimated_time_to_failure_hours=hours_to_fail,
            recommended_action=action,
            cost_of_prevention=prevention_cost,
            cost_of_breakdown=breakdown_cost,
            savings_if_prevented=breakdown_cost - prevention_cost,
        ),
    )


@router.get("/machines", response_model=list[MachineHealth])
async def get_machines():
    results = []
    for i, m in enumerate(MACHINES):
        if i == 2:
            results.append(_generate_machine(m, force_status="warning"))
        elif i == 3 and random.random() < 0.4:
            results.append(_generate_machine(m, force_status="critical"))
        else:
            results.append(_generate_machine(m, force_status="normal"))
    return results


@router.get("/alerts", response_model=list[AlertItem])
async def get_alerts():
    machines = await get_machines()
    alerts = []
    now = datetime.now(timezone.utc)

    for m in machines:
        if m.status == "normal":
            continue

        if m.status == "warning":
            alert_type = "PREDICTIVE_WARNING"
            vib_increase = round((m.vibration_level_mm_s / m.vibration_baseline_mm_s - 1) * 100, 1)
            temp_increase = round(m.temperature_celsius - m.temperature_baseline_celsius, 1)
            message = (
                f"Vibration increased {vib_increase}% above baseline. "
                f"Temperature {temp_increase}°C above normal. "
                f"AI predicts failure within {m.ai_prediction.estimated_time_to_failure_hours}h."
            )
        else:
            alert_type = "CRITICAL_ALERT"
            message = (
                f"CRITICAL: Machine health at {m.health_score}%. "
                f"Immediate intervention required. "
                f"Estimated {m.ai_prediction.estimated_time_to_failure_hours}h to failure."
            )

        alerts.append(AlertItem(
            machine_id=m.machine_id,
            machine_name=m.name,
            status=m.status,
            alert_type=alert_type,
            message=message,
            detected_at=(now - timedelta(hours=random.randint(1, 12))).isoformat(),
            ai_prediction=m.ai_prediction,
        ))

    return alerts
