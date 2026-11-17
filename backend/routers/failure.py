import random
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/failure", tags=["Failure Analysis"])

FAILURE_KEYWORDS: dict[str, list[str]] = {
    "Fatigue Spalling": ["seize", "seized", "lock", "locked", "spall", "flak"],
    "Cage Damage": ["noise", "vibrat", "rattle", "click", "grind"],
    "Lubrication Failure": ["heat", "hot", "temperatur", "burn", "overheat", "dry"],
    "Overload Fracture": ["crack", "fracture", "broke", "split", "shatter"],
    "Moisture Contamination": ["rust", "corros", "oxidat", "moisture", "water", "damp"],
}

FAILURE_DB: dict[str, dict] = {
    "Fatigue Spalling": {
        "severity": 4,
        "probable_causes": [
            "Bearing operated above rated dynamic load capacity",
            "Insufficient or degraded lubrication leading to metal-to-metal contact",
            "Misalignment between shaft and housing causing uneven load distribution",
            "Bearing life exceeded — normal fatigue at end of calculated L10 life",
        ],
        "recommended_actions": [
            "Verify motor/shaft alignment at customer installation",
            "Check lubrication type and re-greasing interval",
            "Cross-reference batch records for any production anomalies",
            "Recommend bearing upgrade if load exceeds current rating",
        ],
        "root_cause_template": (
            "The bearing exhibits classic subsurface fatigue spalling on the {location}. "
            "Flaking pattern is consistent with cyclic Hertzian contact stress exceeding the material's "
            "endurance limit. Given the reported operating hours ({hours}h vs expected 18,000–24,000h L10 life), "
            "the most probable root cause is {cause}. "
            "Recommend verifying installation alignment and lubrication regime at the customer's end."
        ),
    },
    "Cage Damage": {
        "severity": 3,
        "probable_causes": [
            "Excessive vibration from imbalanced rotating assembly",
            "Incorrect bearing fitment — too tight or too loose",
            "Lubricant starvation causing cage-to-ball friction",
            "Foreign particle ingress damaging cage pockets",
        ],
        "recommended_actions": [
            "Inspect customer's motor balancing records",
            "Verify shaft/housing tolerances match bearing spec",
            "Switch to higher-viscosity grease if operating temp is elevated",
            "Check sealing arrangement for particle ingress",
        ],
        "root_cause_template": (
            "Noise and vibration symptoms indicate cage damage, likely from {cause}. "
            "Operating at {hours}h, the bearing should not show cage wear under normal conditions. "
            "This suggests an external factor — either vibration from the driven equipment, "
            "fitment issues, or lubrication inadequacy. Cage material (pressed steel) is appropriate "
            "for this application; a polyamide cage upgrade is not necessary unless speeds exceed rating."
        ),
    },
    "Lubrication Failure": {
        "severity": 4,
        "probable_causes": [
            "Grease degradation from operating temperature exceeding 120°C",
            "Insufficient initial greasing during assembly",
            "Re-greasing interval missed or incorrect grease type used",
            "Seal damage allowing grease leakage",
        ],
        "recommended_actions": [
            "Verify operating temperature at customer site",
            "Check grease compatibility — do not mix lithium and polyurea greases",
            "Establish documented re-greasing schedule for customer",
            "Inspect seal condition; upgrade to contact seal if environment is harsh",
        ],
        "root_cause_template": (
            "Elevated temperature and discolouration confirm lubrication failure. "
            "The bearing surface shows heat tinting indicative of operating above 130°C. "
            "At {hours}h, this is well within expected life, confirming premature failure due to {cause}. "
            "Grease analysis (if available) would confirm degradation. Immediate recommendation: "
            "switch to high-temperature grease (polyurea base) and reduce re-greasing interval to 500h."
        ),
    },
    "Overload Fracture": {
        "severity": 5,
        "probable_causes": [
            "Sudden impact or shock load during operation",
            "Bearing undersized for actual application load",
            "Incorrect mounting — excessive press-fit force cracking inner ring",
            "Material defect in ring (rare — check batch metallurgy)",
        ],
        "recommended_actions": [
            "Immediate: pull remaining stock from same batch for metallurgy check",
            "Review customer's load calculations vs bearing rating",
            "Check if application involves shock loads not in original specification",
            "Consider upgrading to next bearing size if load margin is insufficient",
        ],
        "root_cause_template": (
            "Fracture pattern indicates catastrophic overload failure. The crack propagation direction "
            "suggests {cause}. At {hours}h operating life, the bearing was well within its fatigue "
            "limit, ruling out normal wear. Priority action: check remaining bearings from batch "
            "{batch} for any material anomaly. If batch is clear, the root cause is application-side "
            "— recommend customer review their load and mounting procedure."
        ),
    },
    "Moisture Contamination": {
        "severity": 3,
        "probable_causes": [
            "Bearing stored in humid environment without protective packaging",
            "Water ingress during operation — seal failure or wash-down exposure",
            "Condensation from temperature cycling in customer's equipment",
            "Coolant or cleaning fluid contamination during customer's process",
        ],
        "recommended_actions": [
            "Check storage conditions at customer warehouse",
            "Verify seal type — upgrade to contact seal for wet environments",
            "Apply anti-corrosion coating on replacement bearing",
            "Recommend VCI packaging for spares stored on-site",
        ],
        "root_cause_template": (
            "Corrosion pattern on the raceway is consistent with moisture contamination. "
            "The rust depth suggests prolonged exposure rather than a single event. "
            "At {hours}h, the bearing was functional before contamination accelerated wear. "
            "Most probable cause: {cause}. Recommend upgrading to stainless steel variant (S6200-2RS) "
            "if the customer's environment involves water or chemical exposure."
        ),
    },
    "Wear - Normal End of Life": {
        "severity": 2,
        "probable_causes": [
            "Bearing has reached or exceeded its calculated L10 life",
            "Gradual surface wear under normal operating conditions",
            "Progressive grease degradation over extended service",
        ],
        "recommended_actions": [
            "Replace with same bearing type — no design change needed",
            "Review re-greasing schedule if life was shorter than calculated",
            "Update maintenance schedule based on actual observed life",
        ],
        "root_cause_template": (
            "The bearing shows gradual wear consistent with normal end-of-life fatigue. "
            "At {hours}h, this is within the expected L10 range for this bearing type under "
            "the reported operating conditions. No corrective action required beyond routine "
            "replacement. Recommend updating the preventive maintenance schedule to replace "
            "at 80% of observed life ({replace_at}h) to avoid unplanned downtime."
        ),
    },
}

SIMULATED_CASES = [
    {"case_id": "FA-2026-041", "part": "6200-2RS", "customer": "XYZ Motors", "failure": "Fatigue Spalling", "date": "2026-07-12"},
    {"case_id": "FA-2026-038", "part": "6200-2RS", "customer": "Precision Auto", "failure": "Lubrication Failure", "date": "2026-06-28"},
    {"case_id": "FA-2026-035", "part": "6300-2RS", "customer": "ABC Bearings", "failure": "Cage Damage", "date": "2026-06-15"},
    {"case_id": "FA-2026-029", "part": "30205", "customer": "Tata Components", "failure": "Overload Fracture", "date": "2026-05-22"},
    {"case_id": "FA-2026-025", "part": "6205-2RS", "customer": "Mahindra Parts", "failure": "Moisture Contamination", "date": "2026-05-08"},
    {"case_id": "FA-2026-019", "part": "UCP205", "customer": "Bharat Forge", "failure": "Fatigue Spalling", "date": "2026-04-15"},
    {"case_id": "FA-2026-014", "part": "6200-ZZ", "customer": "TVS Supply", "failure": "Cage Damage", "date": "2026-03-30"},
]


class FailureRequest(BaseModel):
    part_number: str
    description: str
    customer_name: str
    application: str = "General industrial"
    operating_hours: int = 5000


class RelatedCase(BaseModel):
    case_id: str
    part_number: str
    customer: str
    failure_mode: str
    date: str
    similarity_pct: float


class FailureResponse(BaseModel):
    analysis_id: str
    part_number: str
    customer_name: str
    failure_mode: str
    confidence_pct: float
    severity: int
    severity_label: str
    probable_causes: list[str]
    recommended_actions: list[str]
    warranty_eligible: bool
    warranty_note: str
    related_cases: list[RelatedCase]
    ai_root_cause_summary: str
    analyzed_at: str
    ai_version: str


class FailurePatternItem(BaseModel):
    failure_mode: str
    count: int
    pct: float
    avg_severity: float
    most_common_part: str


def _detect_failure_mode(description: str) -> str:
    desc_lower = description.lower()
    for mode, keywords in FAILURE_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return mode
    return "Wear - Normal End of Life"


@router.post("/analyze", response_model=FailureResponse)
async def analyze_failure(req: FailureRequest):
    mode = _detect_failure_mode(req.description)
    db = FAILURE_DB[mode]
    confidence = round(random.uniform(85.0, 96.0), 1)
    severity = db["severity"]
    severity_labels = {1: "Negligible", 2: "Minor", 3: "Moderate", 4: "Serious", 5: "Critical"}

    warranty = req.operating_hours < 8000
    warranty_note = (
        f"Eligible — failed at {req.operating_hours}h (warranty covers up to 8,000h)"
        if warranty
        else f"Not eligible — operating hours ({req.operating_hours}h) exceed 8,000h warranty limit"
    )

    related = random.sample(SIMULATED_CASES, min(3, len(SIMULATED_CASES)))
    related_cases = [
        RelatedCase(
            case_id=c["case_id"],
            part_number=c["part"],
            customer=c["customer"],
            failure_mode=c["failure"],
            date=c["date"],
            similarity_pct=round(random.uniform(65, 92), 1),
        )
        for c in related
    ]

    causes_list = [
        "operating above rated load", "insufficient lubrication",
        "shaft misalignment", "seal failure", "contamination ingress",
        "improper mounting", "storage damage",
    ]
    cause = random.choice(causes_list)
    hours = req.operating_hours
    batch = f"MT-2026-{random.randint(1,9):02d}-B{random.randint(20,55)}"
    replace_at = int(hours * 0.8)

    summary = db["root_cause_template"].format(
        location="inner race",
        cause=cause,
        hours=hours,
        batch=batch,
        replace_at=replace_at,
    )

    return FailureResponse(
        analysis_id=f"FA-{uuid.uuid4().hex[:8].upper()}",
        part_number=req.part_number,
        customer_name=req.customer_name,
        failure_mode=mode,
        confidence_pct=confidence,
        severity=severity,
        severity_label=severity_labels[severity],
        probable_causes=db["probable_causes"],
        recommended_actions=db["recommended_actions"],
        warranty_eligible=warranty,
        warranty_note=warranty_note,
        related_cases=related_cases,
        ai_root_cause_summary=summary,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
        ai_version="MT-Failure-v1.0.0",
    )


@router.get("/patterns", response_model=list[FailurePatternItem])
async def failure_patterns():
    parts = ["6200-2RS", "6300-2RS", "30205", "6205-2RS", "UCP205", "6200-ZZ"]
    total = random.randint(120, 200)
    patterns = []
    remaining = total
    modes = list(FAILURE_DB.keys())

    for i, mode in enumerate(modes):
        if i == len(modes) - 1:
            count = remaining
        else:
            count = random.randint(max(1, int(remaining * 0.05)), int(remaining * 0.35))
            remaining -= count
        patterns.append(FailurePatternItem(
            failure_mode=mode,
            count=count,
            pct=round(count / total * 100, 1),
            avg_severity=FAILURE_DB[mode]["severity"],
            most_common_part=random.choice(parts),
        ))

    patterns.sort(key=lambda x: x.count, reverse=True)
    return patterns
