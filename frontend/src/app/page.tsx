"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { Donut, HBar, StockBars } from "@/components/Charts";
import { apiGet } from "@/lib/api";
import { demoOverview, type Overview } from "@/lib/demo-data";
import rulDemo from "@/lib/rul-demo.json";

type RulRow = { asset_id: string; name: string; health_score: number; failure_prob_within_horizon: number;
  horizon_hours: number; rul_hours_p10: number; rul_hours_p50: number; rul_hours_p90: number };

const modules = [
  { href: "/inspection", label: "Inspection", desc: "AI visual defect scan" },
  { href: "/quotation", label: "Quotation", desc: "AI-assisted pricing" },
  { href: "/failure-analysis", label: "Failure Analysis", desc: "Root-cause analysis" },
  { href: "/maintenance", label: "Maintenance", desc: "Predictive machine health" },
  { href: "/remaining-life", label: "Remaining Life", desc: "RUL model + uncertainty" },
  { href: "/sourcing", label: "Sourcing", desc: "Demand & supplier intel" },
];

const inr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${n.toLocaleString("en-IN")}`;
const healthColor = (s: number) => (s >= 80 ? "#4ade80" : s >= 55 ? "#fbbf24" : "#f87171");

export default function Dashboard() {
  const [demo, setDemo] = useState(true);
  const [data, setData] = useState<Overview>(demoOverview);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [rul, setRul] = useState<RulRow[]>(rulDemo.assets as RulRow[]);

  const load = useCallback(async () => {
    const rr = await apiGet<RulRow[]>("/api/rul/assets");
    if (!rr.demo && rr.data) setRul(rr.data);
    const r = await apiGet<Overview>("/api/dashboard/overview");
    if (!r.demo && r.data) { setData(r.data); setDemo(false); } else setDemo(true);
    setUpdated(new Date());
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 30000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [load]);

  const k = data.kpis;
  const risky = data.machines.filter((m) => m.status !== "normal");

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-white">Executive Command Center</h1>
          <p className="mt-1 text-sm text-slate-400">
            Micro Turner Group — live intelligence across quality, maintenance, sourcing &amp; sales · {data.period}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${demo ? "bg-yellow-500" : "bg-green-500 animate-pulse"}`} />
            {demo ? "Sample data" : "API connected · simulated values"}{updated && ` · ${updated.toLocaleTimeString()}`}
          </span>
          <button onClick={load} className="rounded-lg border border-slate-700 px-3 py-1.5 font-semibold text-slate-300 hover:border-purple-500 hover:text-white">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="✅" value={`${k.first_pass_yield_pct}%`} label="First-Pass Yield" color="green" trend={`${k.total_inspected.toLocaleString()} scanned`} />
        <StatCard icon="🏭" value={`${k.plant_health_pct}%`} label="Plant Health" color="purple" trend={`${k.machines_at_risk} at risk`} />
        <StatCard icon="🛡️" value={inr(k.downtime_cost_avoided)} label="Downtime Cost Avoided" color="cyan" />
        <StatCard icon="💼" value={inr(k.open_quote_value)} label="Open Quote Pipeline" color="blue" />
      </div>


      <section className="mt-4 rounded-xl border border-purple-500/40 bg-slate-900 p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Remaining Useful Life <span className="ml-2 rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300">model · synthetic sensor data</span></h3>
            <p className="text-xs text-slate-500">Degradation-curve fit with bootstrap uncertainty: median hours left and 80% range</p>
          </div>
          <Link href="/remaining-life" className="text-xs font-semibold text-purple-400 hover:underline">Open model view →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...rul].sort((a, b) => a.rul_hours_p50 - b.rul_hours_p50).map((a) => {
            const c = a.health_score >= 70 ? "#4ade80" : a.health_score >= 40 ? "#fbbf24" : "#f87171";
            const max = 800, lo = Math.min(a.rul_hours_p10, max), hi = Math.min(a.rul_hours_p90, max), mid = Math.min(a.rul_hours_p50, max);
            return (
              <Link key={a.asset_id} href="/remaining-life" className="rounded-lg bg-slate-800/60 p-3 transition-colors hover:bg-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{a.asset_id}</span>
                  <span style={{ color: c }}>health {a.health_score}</span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">{Math.round(a.rul_hours_p50)} h</p>
                <p className="text-[11px] text-slate-500">80% range {Math.round(a.rul_hours_p10)}–{Math.round(a.rul_hours_p90)} h · P(fail ≤ {a.horizon_hours} h) {Math.round(a.failure_prob_within_horizon * 100)}%</p>
                <div className="relative mt-2 h-1.5 rounded bg-slate-700">
                  <div className="absolute h-1.5 rounded" style={{ left: `${(lo / max) * 100}%`, width: `${Math.max(1, ((hi - lo) / max) * 100)}%`, background: c, opacity: 0.45 }} />
                  <div className="absolute -top-0.5 h-2.5 w-0.5 rounded" style={{ left: `${(mid / max) * 100}%`, background: c }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Defect Mix" sub={`${k.defect_rate_pct}% defect rate`}>
          <Donut
            data={data.defect_types.map((d) => ({ label: d.defect_type, value: d.count }))}
            centerValue={`${k.defect_rate_pct}%`}
            centerLabel="defect rate"
          />
        </Panel>
        <Panel title="Machine Health" sub="Simulated status score (model-based RUL is above)">
          <HBar rows={data.machines.map((m) => ({ label: m.name, value: m.health_score, color: healthColor(m.health_score), suffix: "%" }))} />
        </Panel>
        <Panel title="Stock vs Forecast Demand" sub={`${k.reorders_needed} part(s) need reorder`}>
          <StockBars rows={data.forecast.map((f) => ({ label: f.part_number, stock: f.current_stock, demand: f.forecast_demand }))} />
          <div className="mt-2 flex gap-4 text-[11px] text-slate-400">
            <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-blue-400" />Stock</span>
            <span><i className="mr-1 inline-block h-2 w-2 rounded-sm bg-purple-400" />Q4 demand</span>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Needs Attention" sub="Flagged machines & stock (simulated)">
          <ul className="space-y-2">
            {risky.length === 0 && <li className="text-sm text-slate-500">All machines healthy.</li>}
            {risky.map((m) => (
              <li key={m.machine_id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 text-sm">
                <span className="text-slate-200">{m.name}
                  <span className="ml-2 text-xs text-slate-500">
                    {m.failure_probability_pct}% failure risk{m.hours_to_failure ? ` · ~${m.hours_to_failure}h left` : ""}
                  </span>
                </span>
                <StatusBadge status={m.status} />
              </li>
            ))}
            {data.forecast.filter((f) => f.reorder_needed).map((f) => (
              <li key={f.part_number} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2 text-sm">
                <span className="text-slate-200">{f.part_number}
                  <span className="ml-2 text-xs text-slate-500">{f.stock_cover_days} days cover · demand {f.percentage_change > 0 ? "+" : ""}{f.percentage_change}%</span>
                </span>
                <StatusBadge status="Order Now" />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Supplier Scorecard" sub={`Average ${k.avg_supplier_score}/100`}>
          <HBar rows={data.suppliers.map((s) => ({ label: s.name, value: s.score, color: healthColor(s.score) }))} />
        </Panel>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-300">Modules</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {modules.map((m) => (
          <Link key={m.href} href={m.href} className="rounded-xl border border-slate-700 bg-slate-900 p-4 transition-colors hover:border-purple-500">
            <p className="text-sm font-bold text-white">{m.label} →</p>
            <p className="text-xs text-slate-500">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      {sub && <p className="mb-4 text-xs text-slate-500">{sub}</p>}
      {children}
    </section>
  );
}
