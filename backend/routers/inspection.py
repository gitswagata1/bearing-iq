import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel

router = APIRouter(prefix="/api/inspect", tags=["Visual Inspection"])

DEFECT_TYPES = [
    "Surface Pitting",
    "Micro-crack",
    "Dimensional Drift",
    "Grinding Burn",
    "Contamination",
]

QUADRANTS = ["Outer Race - Q1", "Outer Race - Q2", "Inner Race - Q3", "Inner Race - Q4"]

SEVERITY_MAP = {
    "Surface Pitting": {"range": (1, 3), "desc": "Flaking or pitting on raceway surface"},
    "Micro-crack": {"range": (2, 3), "desc": "Subsurface crack propagation detected"},
    "Dimensional Drift": {"range": (1, 2), "desc": "Outer diameter exceeds tolerance band"},
    "Grinding Burn": {"range": (2, 3), "desc": "Thermal damage from grinding process"},
    "Contamination": {"range": (1, 2), "desc": "Foreign particle embedded in surface"},
}

RECOMMENDATIONS = {
    1: "Minor defect — rework possible. Route to finishing station.",
    2: "Moderate defect — will cause premature failure under load. Reject and scrap.",
    3: "Critical defect — immediate rejection. Investigate batch for systemic issue.",
}


class DefectDetail(BaseModel):
    defect_type: str
    description: str
    severity: int
    severity_label: str
    location: str
    confidence_pct: float
    recommendation: str


class InspectionResult(BaseModel):
    bearing_id: str
    part_number: str
    batch_id: str
    scan_time_ms: int
    result: str
    confidence_pct: float
    defect: DefectDetail | None = None
    recommendation: str
    inspector_ai_version: str
    timestamp: str


class InspectionStats(BaseModel):
    total_inspected: int
    total_passed: int
    total_defects: int
    defect_rate_pct: float
    avg_scan_time_ms: int
    common_defect_types: list[dict]
    period: str


@router.post("", response_model=InspectionResult)
async def inspect_bearing(
    image: UploadFile = File(...),
    part_number: str = "6200-2RS",
):
    await image.read()

    scan_time = random.randint(600, 1200)
    is_defect = random.random() < 0.15
    bearing_id = f"MT-{part_number}-{uuid.uuid4().hex[:5].upper()}"
    batch_id = f"MT-2026-09-B{random.randint(40, 60)}"
    now = datetime.now(timezone.utc).isoformat()

    if is_defect:
        defect_type = random.choice(DEFECT_TYPES)
        sev_range = SEVERITY_MAP[defect_type]["range"]
        severity = random.randint(*sev_range)
        confidence = round(random.uniform(88.0, 97.0), 1)
        location = random.choice(QUADRANTS)
        severity_labels = {1: "Minor", 2: "Moderate", 3: "Critical"}

        defect = DefectDetail(
            defect_type=defect_type,
            description=SEVERITY_MAP[defect_type]["desc"],
            severity=severity,
            severity_label=severity_labels[severity],
            location=location,
            confidence_pct=confidence,
            recommendation=RECOMMENDATIONS[severity],
        )
        return InspectionResult(
            bearing_id=bearing_id,
            part_number=part_number,
            batch_id=batch_id,
            scan_time_ms=scan_time,
            result="DEFECT_DETECTED",
            confidence_pct=confidence,
            defect=defect,
            recommendation=RECOMMENDATIONS[severity],
            inspector_ai_version="MT-Vision-v1.2.0",
            timestamp=now,
        )

    confidence = round(random.uniform(95.0, 99.5), 1)
    return InspectionResult(
        bearing_id=bearing_id,
        part_number=part_number,
        batch_id=batch_id,
        scan_time_ms=scan_time,
        result="PASS",
        confidence_pct=confidence,
        defect=None,
        recommendation="Ship — meets quality standards",
        inspector_ai_version="MT-Vision-v1.2.0",
        timestamp=now,
    )


@router.get("/stats", response_model=InspectionStats)
async def inspection_stats():
    total = random.randint(4200, 5800)
    defect_rate = round(random.uniform(2.8, 4.5), 1)
    total_defects = int(total * defect_rate / 100)
    total_passed = total - total_defects

    type_counts = []
    remaining = total_defects
    for i, dt in enumerate(DEFECT_TYPES):
        if i == len(DEFECT_TYPES) - 1:
            count = remaining
        else:
            count = random.randint(int(remaining * 0.1), int(remaining * 0.4))
            remaining -= count
        type_counts.append({"defect_type": dt, "count": count, "pct": round(count / total_defects * 100, 1)})

    type_counts.sort(key=lambda x: x["count"], reverse=True)

    return InspectionStats(
        total_inspected=total,
        total_passed=total_passed,
        total_defects=total_defects,
        defect_rate_pct=defect_rate,
        avg_scan_time_ms=random.randint(780, 950),
        common_defect_types=type_counts,
        period="September 2026",
    )
