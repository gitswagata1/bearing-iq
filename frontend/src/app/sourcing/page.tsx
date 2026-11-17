"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { apiGet } from "@/lib/api";
import { demoForecast, demoSuppliers, demoSourcingRecommendation } from "@/lib/demo-data";

type Forecast = (typeof demoForecast)[0];
type Supplier = (typeof demoSuppliers)[0];
type Recommendation = typeof demoSourcingRecommendation;

function trendIcon(t: string) {
  if (t === "up") return "↑";
  if (t === "down") return "↓";
  return "→";
}

function trendColor(t: string) {
  if (t === "up") return "text-green-400";
  if (t === "down") return "text-red-400";
  return "text-slate-400";
}

function scoreColor(s: number) {
  if (s >= 80) return "bg-green-500";
  if (s >= 65) return "bg-blue-500";
  return "bg-yellow-500";
}

export default function SourcingPage() {
  const [demo, setDemo] = useState(true);
  const [forecast, setForecast] = useState<Forecast[]>(demoForecast);
  const [suppliers, setSuppliers] = useState<Supplier[]>(demoSuppliers);
  const [rec, setRec] = useState<Recommendation>(demoSourcingRecommendation);

  useEffect(() => {
    Promise.all([
      apiGet<Forecast[]>("/api/sourcing/forecast"),
      apiGet<Supplier[]>("/api/sourcing/suppliers"),
      apiGet<Recommendation>("/api/sourcing/recommendation"),
    ]).then(([f, s, r]) => {
      if (!f.demo && f.data) { setForecast(f.data); setDemo(false); }
      if (!s.demo && s.data) setSuppliers(s.data);
      if (!r.demo && r.data) setRec(r.data);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <h1 className="mb-1 text-2xl font-black text-white">Sourcing Intelligence</h1>
      <p className="mb-6 text-sm text-slate-400">AI-powered demand forecasting, supplier scoring, and procurement recommendations</p>

      {/* AI Recommendation */}
      <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <p className="text-sm font-bold uppercase tracking-wider text-green-400">AI Procurement Recommendation</p>
        </div>
        <p className="text-sm text-green-300 mb-3">{rec.summary}</p>

        {rec.buy_now.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-1">Buy Now</p>
            <ul className="space-y-1">
              {rec.buy_now.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-300">
                  <span className="mt-0.5 text-green-500">▸</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rec.watch_list.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1">Watch List</p>
            <ul className="space-y-1">
              {rec.watch_list.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-yellow-300">
                  <span className="mt-0.5 text-yellow-500">⚠</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {rec.risk_alerts.length > 0 && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Risk Alerts</p>
            <ul className="space-y-1">
              {rec.risk_alerts.map((item, i) => (
                <li key={i} className="text-xs text-red-400">⚠️ {item}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm font-bold text-green-400">Estimated Savings: {rec.estimated_savings}</p>
      </div>

      {/* Demand Forecast */}
      <h2 className="mb-3 text-lg font-bold text-slate-300">Q4 2026 Demand Forecast</h2>
      <div className="mb-6 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Part Number</th>
              <th className="px-4 py-3">Current Stock</th>
              <th className="px-4 py-3">Q4 Forecast</th>
              <th className="px-4 py-3">Trend</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f) => (
              <tr key={f.part_number} className="border-b border-slate-800 text-slate-300">
                <td className="px-4 py-3 font-mono font-bold">{f.part_number}</td>
                <td className="px-4 py-3">{f.current_stock.toLocaleString()} pcs</td>
                <td className="px-4 py-3 font-bold">{f.forecast_demand.toLocaleString()} pcs</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${trendColor(f.trend)}`}>
                    {trendIcon(f.trend)} {f.percentage_change > 0 ? `+${f.percentage_change}%` : f.percentage_change === 0 ? "Flat" : `${f.percentage_change}%`}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={f.reorder_needed ? "Order Now" : "Adequate"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Supplier Scorecard */}
      <h2 className="mb-3 text-lg font-bold text-slate-300">Supplier Scorecard</h2>
      <div className="space-y-4">
        {suppliers.map((s) => (
          <div key={s.name} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${scoreColor(s.score)} bg-opacity-20`}>
                  <span className={`text-lg font-black ${s.score >= 80 ? "text-green-400" : s.score >= 65 ? "text-blue-400" : "text-yellow-400"}`}>{s.score}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{s.name}</p>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Delivery On-Time</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.on_time_delivery_pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{s.on_time_delivery_pct}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Quality (Pass Rate)</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${100 - s.quality_rejection_pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{(100 - s.quality_rejection_pct).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Price Competitiveness</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.price_competitiveness === "Low" ? "Approved" : s.price_competitiveness === "Competitive" ? "Preferred" : "Monitor"} />
                  <span className="text-xs font-bold text-slate-400">{s.price_competitiveness}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-600">
        Scoring: Delivery on-time (40%) + Quality pass rate (30%) + Price competitiveness (20%) + Payment flexibility (10%)
      </p>
    </div>
  );
}
