import random
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/quote", tags=["Quotation Assistant"])

PRICE_DB: dict[str, float] = {
    "6200-2RS": 42.50,
    "6200-ZZ": 38.75,
    "6300-2RS": 55.00,
    "6300-ZZ": 48.50,
    "30205": 125.00,
    "30206": 145.00,
    "UCP205": 210.00,
    "UCP208": 285.00,
    "6205-2RS": 52.00,
    "6206-2RS": 65.00,
}

UPSELL_MAP: dict[str, str] = {
    "6200-2RS": "6200-2RS/C3 (C3 clearance for higher-temp applications)",
    "6200-ZZ": "6200-2RS (rubber seal for dusty environments)",
    "6300-2RS": "6300-2RS/C3 (high-temp variant)",
    "6205-2RS": "6205-2RS/C3 (motor-grade clearance)",
    "30205": "30205-A (higher load rating, same envelope)",
    "UCP205": "UCFL205 (2-bolt flange, easier mounting)",
}

DELIVERY_LOCATIONS = {
    "pune": "FOR Pune",
    "mumbai": "FOR Mumbai",
    "delhi": "FOR Delhi NCR",
    "chennai": "FOR Chennai",
    "bangalore": "FOR Bengaluru",
    "faridabad": "Ex-Works Faridabad",
}

CUSTOMER_NAMES = [
    "ABC Bearings", "XYZ Motors", "Precision Auto", "Tata Components",
    "Ashok Leyland", "Mahindra Parts", "Bharat Forge", "TVS Supply",
]


class QuoteRequest(BaseModel):
    part_number: str
    quantity: int
    customer_name: str
    delivery_location: str = "Pune"


class CustomerHistory(BaseModel):
    last_order_date: str
    total_orders: int
    payment_rating: str
    avg_order_value: float
    is_repeat_customer: bool


class QuoteResponse(BaseModel):
    quote_id: str
    part_number: str
    part_description: str
    quantity: int
    base_unit_price: float
    volume_discount_pct: float
    discounted_unit_price: float
    subtotal: float
    gst_pct: float
    gst_amount: float
    total_amount: float
    lead_time: str
    delivery_terms: str
    payment_terms: str
    validity_days: int
    customer_name: str
    customer_history: CustomerHistory
    ai_notes: list[str]
    upsell_suggestion: str | None
    generated_at: str
    ai_version: str


class QuoteHistoryItem(BaseModel):
    quote_id: str
    part_number: str
    customer_name: str
    quantity: int
    total_amount: float
    status: str
    created_at: str


PART_DESCRIPTIONS: dict[str, str] = {
    "6200-2RS": "Deep Groove Ball Bearing 6200-2RS (10x30x9mm, rubber sealed)",
    "6200-ZZ": "Deep Groove Ball Bearing 6200-ZZ (10x30x9mm, metal shield)",
    "6300-2RS": "Deep Groove Ball Bearing 6300-2RS (10x35x11mm, rubber sealed)",
    "6300-ZZ": "Deep Groove Ball Bearing 6300-ZZ (10x35x11mm, metal shield)",
    "30205": "Taper Roller Bearing 30205 (25x52x16.25mm)",
    "30206": "Taper Roller Bearing 30206 (30x62x17.25mm)",
    "UCP205": "Pillow Block Bearing UCP205 (25mm bore, cast iron housing)",
    "UCP208": "Pillow Block Bearing UCP208 (40mm bore, cast iron housing)",
    "6205-2RS": "Deep Groove Ball Bearing 6205-2RS (25x52x15mm, rubber sealed)",
    "6206-2RS": "Deep Groove Ball Bearing 6206-2RS (30x62x16mm, rubber sealed)",
}


def _get_volume_discount(qty: int) -> float:
    if qty >= 25000:
        return 8.0
    if qty >= 10000:
        return 5.0
    if qty >= 5000:
        return 3.0
    return 0.0


def _get_lead_time(qty: int) -> str:
    if qty <= 2000:
        return "5–7 working days ex-Faridabad"
    if qty <= 10000:
        return "10–12 working days ex-Faridabad"
    if qty <= 25000:
        return "15–18 working days ex-Faridabad"
    return "20–25 working days ex-Faridabad (batch production)"


def _simulate_customer_history(name: str) -> CustomerHistory:
    is_known = name.lower().strip() in [c.lower() for c in CUSTOMER_NAMES]
    if is_known:
        months_ago = random.randint(1, 3)
        last_date = datetime.now(timezone.utc) - timedelta(days=30 * months_ago)
        return CustomerHistory(
            last_order_date=last_date.strftime("%Y-%m-%d"),
            total_orders=random.randint(3, 15),
            payment_rating=random.choice(["Excellent", "Good"]),
            avg_order_value=round(random.uniform(50000, 300000), 2),
            is_repeat_customer=True,
        )
    return CustomerHistory(
        last_order_date="N/A",
        total_orders=0,
        payment_rating="New Customer",
        avg_order_value=0.0,
        is_repeat_customer=False,
    )


def _generate_ai_notes(history: CustomerHistory, discount: float, part: str) -> list[str]:
    notes = []
    if history.is_repeat_customer:
        notes.append(f"Repeat customer — {history.total_orders} orders on record. Price held from last quote.")
        if history.payment_rating == "Excellent":
            notes.append("Payment history: Excellent. Consider priority dispatch.")
    else:
        notes.append("New customer — standard pricing applied. No prior order history.")
        notes.append("Recommend: request advance payment or LC for first order.")

    if discount > 0:
        notes.append(f"Volume discount of {discount}% applied automatically.")

    if part in ("30205", "30206"):
        notes.append("Taper roller demand is trending up (+25% Q3→Q4). Confirm stock allocation.")

    return notes


@router.post("", response_model=QuoteResponse)
async def generate_quote(req: QuoteRequest):
    part = req.part_number.upper().strip()
    base_price = PRICE_DB.get(part)
    if base_price is None:
        available = ", ".join(sorted(PRICE_DB.keys()))
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Part '{part}' not found. Available: {available}")

    discount_pct = _get_volume_discount(req.quantity)
    discounted = round(base_price * (1 - discount_pct / 100), 2)
    subtotal = round(discounted * req.quantity, 2)
    gst = round(subtotal * 0.18, 2)
    total = round(subtotal + gst, 2)

    loc_key = req.delivery_location.lower().strip()
    delivery = DELIVERY_LOCATIONS.get(loc_key, f"FOR {req.delivery_location}")

    history = _simulate_customer_history(req.customer_name)
    notes = _generate_ai_notes(history, discount_pct, part)
    upsell = UPSELL_MAP.get(part)

    return QuoteResponse(
        quote_id=f"QT-{uuid.uuid4().hex[:8].upper()}",
        part_number=part,
        part_description=PART_DESCRIPTIONS.get(part, part),
        quantity=req.quantity,
        base_unit_price=base_price,
        volume_discount_pct=discount_pct,
        discounted_unit_price=discounted,
        subtotal=subtotal,
        gst_pct=18.0,
        gst_amount=gst,
        total_amount=total,
        lead_time=_get_lead_time(req.quantity),
        delivery_terms=delivery,
        payment_terms="Net 30 days from invoice date",
        validity_days=7,
        customer_name=req.customer_name,
        customer_history=history,
        ai_notes=notes,
        upsell_suggestion=upsell,
        generated_at=datetime.now(timezone.utc).isoformat(),
        ai_version="MT-Quote-v1.1.0",
    )


@router.get("/history", response_model=list[QuoteHistoryItem])
async def quote_history():
    statuses = ["Sent", "Approved", "Pending", "Expired", "Order Confirmed"]
    items = []
    for i in range(10):
        part = random.choice(list(PRICE_DB.keys()))
        qty = random.choice([500, 1000, 2000, 5000, 10000, 15000])
        price = PRICE_DB[part]
        total = round(price * qty * 1.18, 2)
        days_ago = random.randint(1, 30)
        items.append(QuoteHistoryItem(
            quote_id=f"QT-{uuid.uuid4().hex[:8].upper()}",
            part_number=part,
            customer_name=random.choice(CUSTOMER_NAMES),
            quantity=qty,
            total_amount=total,
            status=random.choice(statuses),
            created_at=(datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
        ))
    items.sort(key=lambda x: x.created_at, reverse=True)
    return items
