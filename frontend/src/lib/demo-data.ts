export type InspectionResult = {
  id: string;
  part_number: string;
  batch: string;
  result: "PASS" | "DEFECT";
  confidence: number;
  defect_type: string | null;
  location: string | null;
  severity: string | null;
  recommendation: string;
  scan_time_ms: number;
  timestamp: string;
};

export const demoInspectionResult: InspectionResult = {
  id: "INS-2026-04872",
  part_number: "6200-2RS",
  batch: "MT-2026-09-B47",
  result: "DEFECT",
  confidence: 94.2,
  defect_type: "Surface Pitting",
  location: "Outer race, Quadrant 3",
  severity: "Grade 2 — Moderate",
  recommendation: "Reject. Route to rework or scrap. Do not ship.",
  scan_time_ms: 800,
  timestamp: new Date().toISOString(),
};

export const demoInspectionPass: InspectionResult = {
  id: "INS-2026-04873",
  part_number: "6200-2RS",
  batch: "MT-2026-09-B47",
  result: "PASS",
  confidence: 97.8,
  defect_type: null,
  location: null,
  severity: null,
  recommendation: "Approved for packaging and dispatch.",
  scan_time_ms: 650,
  timestamp: new Date().toISOString(),
};

export const demoInspectionStats = {
  total_inspected: 4872,
  total_passed: 4691,
  total_defects: 181,
  defect_rate_pct: 3.72,
  avg_scan_time_ms: 740,
};

export const demoQuoteResult = {
  id: "QT-2026-0892",
  part_number: "6200-2RS",
  description: "Deep Groove Ball Bearing, Sealed",
  quantity: 5000,
  unit_price: 42.5,
  gst_percent: 18,
  total_before_gst: 212500,
  gst_amount: 38250,
  total_with_gst: 250750,
  lead_time_days: 12,
  delivery: "FOR Pune",
  payment_terms: "30 days from invoice",
  validity_days: 7,
  customer: "ABC Bearings",
  ai_notes: "Price held from August 2026 quote. Customer ordered 3 times in last 4 months. Growing account — recommend retaining at current rate.",
  generated_at: new Date().toISOString(),
};

export const demoQuoteHistory = [
  { quote_id: "QT-2026-0892", customer_name: "ABC Bearings", part_number: "6200-2RS", quantity: 5000, total_amount: 250750, created_at: "2026-09-23T09:30:00+00:00", status: "Pending" },
  { quote_id: "QT-2026-0891", customer_name: "XYZ Motors", part_number: "30205", quantity: 2000, total_amount: 178000, created_at: "2026-09-22T09:30:00+00:00", status: "Approved" },
  { quote_id: "QT-2026-0890", customer_name: "PQR Industries", part_number: "6300-2RS", quantity: 10000, total_amount: 495000, created_at: "2026-09-21T09:30:00+00:00", status: "Approved" },
  { quote_id: "QT-2026-0889", customer_name: "ABC Bearings", part_number: "UCP205", quantity: 500, total_amount: 162500, created_at: "2026-09-20T09:30:00+00:00", status: "Approved" },
  { quote_id: "QT-2026-0888", customer_name: "LMN Engg", part_number: "6200-ZZ", quantity: 3000, total_amount: 138000, created_at: "2026-09-19T09:30:00+00:00", status: "Rejected" },
];

export const demoFailureResult = {
  id: "FA-2026-0147",
  failure_mode: "Fatigue Spalling",
  confidence: 91.7,
  severity: "HIGH",
  evidence: "Flaking/pitting pattern on inner race consistent with subsurface fatigue. Discolouration near cage suggests elevated operating temperature.",
  probable_causes: [
    "Bearing operated above rated load capacity",
    "Insufficient or degraded lubrication",
    "Possible contamination ingress through damaged seal",
    "Misalignment in motor assembly",
  ],
  recommended_actions: [
    "Check motor assembly alignment at customer end",
    "Verify lubrication type, quantity, and re-greasing interval",
    "Inspect seal condition on remaining stock from same batch",
    "Cross-reference with batch MT-2026-06-B31 (previous failure, same customer)",
    "If batch-related: initiate production hold on remaining inventory",
  ],
  warranty_eligible: true,
  related_cases: [
    { id: "FA-2026-0098", customer: "XYZ Motors", failure: "Fatigue Spalling", date: "2026-06-14" },
    { id: "FA-2026-0112", customer: "PQR Industries", failure: "Contamination", date: "2026-07-22" },
  ],
  expected_life_months: 24,
  actual_life_months: 3,
};

export const demoFailurePatterns = [
  { failure_mode: "Fatigue Spalling", count: 42, pct: 35 },
  { failure_mode: "Contamination", count: 28, pct: 23 },
  { failure_mode: "Misalignment", count: 22, pct: 18 },
  { failure_mode: "Overload", count: 15, pct: 13 },
  { failure_mode: "Corrosion", count: 8, pct: 7 },
  { failure_mode: "Other", count: 5, pct: 4 },
];

export const demoMachines = [
  { machine_id: "GRD-01", name: "Grinding #1", status: "normal", health_score: 96, vibration_level_mm_s: 2.1, temperature_celsius: 42, power_draw_kw: 7.8, ai_prediction: { failure_probability_pct: 2, estimated_time_to_failure_hours: null as number | null, cost_of_prevention: 1200, cost_of_breakdown: 45000 } },
  { machine_id: "GRD-02", name: "Grinding #2", status: "normal", health_score: 92, vibration_level_mm_s: 2.4, temperature_celsius: 44, power_draw_kw: 8.1, ai_prediction: { failure_probability_pct: 5, estimated_time_to_failure_hours: 1800 as number | null, cost_of_prevention: 1500, cost_of_breakdown: 45000 } },
  { machine_id: "GRD-03", name: "Grinding #3", status: "warning", health_score: 34, vibration_level_mm_s: 5.8, temperature_celsius: 68, power_draw_kw: 16.9, ai_prediction: { failure_probability_pct: 87, estimated_time_to_failure_hours: 72 as number | null, cost_of_prevention: 2500, cost_of_breakdown: 50000 } },
  { machine_id: "HT-01", name: "Heat Treatment", status: "normal", health_score: 88, vibration_level_mm_s: 1.8, temperature_celsius: 380, power_draw_kw: 12.2, ai_prediction: { failure_probability_pct: 8, estimated_time_to_failure_hours: 1200 as number | null, cost_of_prevention: 3200, cost_of_breakdown: 85000 } },
  { machine_id: "LTH-01", name: "Turning Lathe", status: "warning", health_score: 61, vibration_level_mm_s: 3.9, temperature_celsius: 52, power_draw_kw: 11.6, ai_prediction: { failure_probability_pct: 38, estimated_time_to_failure_hours: 360 as number | null, cost_of_prevention: 1800, cost_of_breakdown: 35000 } },
  { machine_id: "POL-01", name: "Polishing", status: "normal", health_score: 94, vibration_level_mm_s: 1.5, temperature_celsius: 38, power_draw_kw: 5.5, ai_prediction: { failure_probability_pct: 3, estimated_time_to_failure_hours: null as number | null, cost_of_prevention: 800, cost_of_breakdown: 22000 } },
];

export const demoAlerts = [
  { machine_id: "GRD-03", machine_name: "Grinding #3", status: "warning", alert_type: "PREDICTIVE_WARNING", message: "Spindle vibration +23% over 48h. Bearing failure predicted within 72 hours.", detected_at: new Date(Date.now() - 2 * 3600000).toISOString(), ai_prediction: { recommended_action: "Schedule spindle bearing replacement during shift change tonight.", cost_of_prevention: 2500, cost_of_breakdown: 50000 } },
  { machine_id: "LTH-01", machine_name: "Turning Lathe", status: "warning", alert_type: "TREND_WARNING", message: "Power draw trending up 12% this week. Belt tension may be degrading.", detected_at: new Date(Date.now() - 6 * 3600000).toISOString(), ai_prediction: { recommended_action: "Inspect drive belt during next scheduled maintenance.", cost_of_prevention: 1800, cost_of_breakdown: 35000 } },
];

export const demoForecast = [
  { part_number: "6200-2RS", current_stock: 3200, forecast_demand: 12500, trend: "up", percentage_change: 18, reorder_needed: true },
  { part_number: "6300-ZZ", current_stock: 5600, forecast_demand: 8200, trend: "flat", percentage_change: 0, reorder_needed: false },
  { part_number: "30205", current_stock: 1800, forecast_demand: 4800, trend: "up", percentage_change: 25, reorder_needed: true },
  { part_number: "UCP205", current_stock: 900, forecast_demand: 2200, trend: "up", percentage_change: 10, reorder_needed: false },
  { part_number: "6205-2RS", current_stock: 4100, forecast_demand: 6800, trend: "flat", percentage_change: 2, reorder_needed: false },
];

export const demoSuppliers = [
  { name: "Supplier A — Ludhiana", score: 92, on_time_delivery_pct: 95, quality_rejection_pct: 1.5, price_competitiveness: "Competitive", status: "preferred" },
  { name: "Supplier B — Jaipur", score: 78, on_time_delivery_pct: 82, quality_rejection_pct: 3.2, price_competitiveness: "Average", status: "approved" },
  { name: "Supplier C — Rajkot", score: 61, on_time_delivery_pct: 68, quality_rejection_pct: 6.8, price_competitiveness: "Low", status: "under_review" },
];

export const demoSourcingRecommendation = {
  summary: "Q4 demand is projected to increase 12-18% overall. Chrome steel (GCr15) spot prices are currently 8% below the 6-month average, creating a favourable procurement window.",
  buy_now: [
    "GCr15 Chrome Steel — 8% below 6-month avg. Lock Q4 supply. Est. saving: ₹1.8L.",
    "6200-2RS raw stock — demand up 18%. Current inventory covers only 22 days. Reorder immediately.",
  ],
  watch_list: [
    "Supplier C — rejection rate 3.2% vs 1.5% industry avg. If next batch exceeds 2%, switch to Supplier B.",
    "6200-ZZ demand trending down (-8%). Reduce Q4 order by 10% to avoid overstocking.",
  ],
  risk_alerts: [
    "6200-2RS stock cover at 22 days — below 30-day safety threshold. Reorder trigger activated.",
  ],
  estimated_savings: "₹1.8-2.5L",
};

export const demoOverview = {
  generated_at: new Date().toISOString(),
  period: "September 2026",
  kpis: {
    total_inspected: 4872, defect_rate_pct: 3.7, first_pass_yield_pct: 96.3, plant_health_pct: 77,
    machines_at_risk: 2, downtime_cost_avoided: 83500, reorders_needed: 2, avg_supplier_score: 77, open_quote_value: 4210000,
  },
  defect_types: [
    { defect_type: "Surface Pitting", count: 62, pct: 34.3 }, { defect_type: "Contamination", count: 41, pct: 22.7 },
    { defect_type: "Grinding Burn", count: 33, pct: 18.2 }, { defect_type: "Micro-crack", count: 27, pct: 14.9 },
    { defect_type: "Dimensional Drift", count: 18, pct: 9.9 },
  ],
  machines: demoMachines.map((m) => ({
    machine_id: m.machine_id, name: m.name, status: m.status, health_score: m.health_score,
    failure_probability_pct: m.ai_prediction.failure_probability_pct, hours_to_failure: m.ai_prediction.estimated_time_to_failure_hours,
  })),
  forecast: demoForecast.map((f) => ({
    part_number: f.part_number, current_stock: f.current_stock, forecast_demand: f.forecast_demand,
    stock_cover_days: Math.round(f.current_stock / (f.forecast_demand / 90)), reorder_needed: f.reorder_needed, percentage_change: f.percentage_change,
  })),
  suppliers: demoSuppliers.map((s) => ({ name: s.name, score: s.score, status: s.status })),
};
export type Overview = typeof demoOverview;
