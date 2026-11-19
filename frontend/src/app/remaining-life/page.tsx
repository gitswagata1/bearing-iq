"use client";

import { useEffect, useState } from "react";
import { apiGet, STATIC_DEMO } from "@/lib/api";
import demo from "@/lib/rul-demo.json";

type Point = { t: number; v: number };
type Asset = {
  asset_id: string; name: string; age_hours: number; threshold_mm_s: number; horizon_hours: number;
  history: Point[]; fitted: Point[]; baseline_mm_s: number; current_mm_s: number; health_score: number;
  failure_prob_within_horizon: number; rul_hours_point: number | null;
  rul_hours_p10: number; rul_hours_p50: number; rul_hours_p90: number;
};
type Card = {
  data: string; features: string[]; model: string; target: string; uncertainty: string;
  validation: { predictions: number; mae_hours: number; mean_true_rul_hours: number; p10_p90_coverage: number; note: string };
  limitations: string[];
};

const tone = (h: number) => (h >= 70 ? "#4ade80" : h >= 40 ? "#fbbf24" : "#f87171");

export default function RemainingLifePage() {
  const [assets, setAssets] = useState<Asset[]>(demo.assets as Asset[]);
  const [card, setCard] = useState<Card>(demo.card as Card);
  const [live, setLive] = useState(false);
  const [sel, setSel] = useState(2);

  useEffect(() => {
    Promise.all([apiGet<Asset[]>("/api/rul/assets"), apiGet<Card>("/api/rul/model-card")]).then(([a, c]) => {
      if (!a.demo && a.data) { setAssets(a.data); setLive(true); }
      if (!c.demo && c.data) setCard(c.data);
    });
  }, []);

  const a = assets[sel] ?? assets[0];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
        Prototype · synthetic sensor data
        <span className="font-normal text-sky-200/70">
          — vibration histories are simulated; {live ? "predictions computed live by the FastAPI model" : STATIC_DEMO ? "hosted demo showing a saved snapshot of the FastAPI model output" : "API offline, showing a saved snapshot of the model output"}.
        </span>
      </div>

      <h1 className="mb-1 text-2xl font-black text-white">Remaining Useful Life</h1>
      <p className="mb-5 text-sm text-slate-400">Sensor trend → health score → failure probability → hours to failure, with an uncertainty range.</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {assets.map((x, i) => (
          <button key={x.asset_id} onClick={() => setSel(i)}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${i === sel ? "border-purple-500 bg-purple-500/10 text-white" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
            <span className="font-bold">{x.asset_id}</span>
            <span className="ml-2" style={{ color: tone(x.health_score) }}>● {x.health_score}</span>
          </button>
        ))}
      </div>

      {/* The prediction chain */}
      <div className="grid gap-3 md:grid-cols-4">
        <Step n={1} title="Sensor trend" value={`${a.current_mm_s.toFixed(2)} mm/s`} sub={`baseline ${a.baseline_mm_s.toFixed(2)} · alarm ${a.threshold_mm_s}`} />
        <Step n={2} title="Health score" value={`${a.health_score}/100`} color={tone(a.health_score)} sub="distance from baseline to alarm level" />
        <Step n={3} title={`P(failure ≤ ${a.horizon_hours} h)`} value={`${Math.round(a.failure_prob_within_horizon * 100)}%`}
          color={a.failure_prob_within_horizon > 0.5 ? "#f87171" : a.failure_prob_within_horizon > 0.1 ? "#fbbf24" : "#4ade80"} sub="share of bootstrap refits crossing alarm" />
        <Step n={4} title="Hours to failure" value={`${Math.round(a.rul_hours_p50)} h`}
          sub={`80% range ${Math.round(a.rul_hours_p10)}–${Math.round(a.rul_hours_p90)} h`} />
      </div>

      <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-white">{a.name}</h3>
          <Legend />
        </div>
        <TrendChart a={a} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-3 text-sm font-bold text-white">How the model works</h3>
          <dl className="space-y-3 text-sm">
            <Row k="Data" v={card.data} />
            <Row k="Features" v={card.features.join(" · ")} />
            <Row k="Model" v={card.model} />
            <Row k="Target" v={card.target} />
            <Row k="Uncertainty" v={card.uncertainty} />
          </dl>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Validation (backtest)</h3>
          <div className="mb-3 grid grid-cols-3 gap-3 text-center">
            <Metric v={`${card.validation.mae_hours} h`} l="mean abs. error" />
            <Metric v={`${card.validation.mean_true_rul_hours} h`} l="mean true RUL" />
            <Metric v={`${Math.round(card.validation.p10_p90_coverage * 100)}%`} l="inside 80% band" />
          </div>
          <p className="mb-3 text-xs text-slate-400">{card.validation.predictions} predictions. {card.validation.note}</p>
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Known limitations</h4>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
            {card.limitations.map((l) => <li key={l}>{l}</li>)}
          </ul>
          <p className="mt-3 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-300">
            <b>Same shape as battery life prediction:</b> capacity fade ↔ vibration growth, end-of-life at 80% capacity ↔ alarm threshold,
            remaining cycles ↔ remaining hours.
          </p>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, value, sub, color = "#ffffff" }: { n: number; title: string; value: string; sub: string; color?: string }) {
  return (
    <div className="relative rounded-xl border border-slate-700 bg-slate-900 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{n} · {title}</p>
      <p className="mt-1 text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
      {n < 4 && <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-slate-500 md:block">→</span>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-2">
      <dt className="text-xs font-bold uppercase text-slate-500">{k}</dt>
      <dd className="text-slate-300">{v}</dd>
    </div>
  );
}

function Metric({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg bg-slate-800/60 p-2">
      <p className="text-lg font-black text-white">{v}</p>
      <p className="text-[11px] text-slate-500">{l}</p>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
      <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-400" />measured</span>
      <span><i className="mr-1 inline-block h-0.5 w-4 bg-purple-400 align-middle" />fitted + forecast</span>
      <span><i className="mr-1 inline-block h-2 w-4 bg-amber-400/25 align-middle" />80% failure window</span>
      <span><i className="mr-1 inline-block h-0.5 w-4 bg-red-400 align-middle" />alarm threshold</span>
    </div>
  );
}

function TrendChart({ a }: { a: Asset }) {
  const W = 900, H = 300, L = 44, R = 12, T = 12, B = 30;
  const tMax = Math.max(a.age_hours + a.rul_hours_p90, ...a.fitted.map((p) => p.t)) * 1.03;
  const vMax = a.threshold_mm_s * 1.2;
  const x = (t: number) => L + (t / tMax) * (W - L - R);
  const y = (v: number) => T + (1 - v / vMax) * (H - T - B);
  const fit = a.fitted.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((tMax * f) / 100) * 100);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Vibration trend with remaining-life forecast">
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#1e293b" />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-slate-500 text-[10px]">{v}</text>
        </g>
      ))}
      {ticks.map((t) => (
        <text key={t} x={x(t)} y={H - 10} textAnchor={t === ticks[ticks.length - 1] ? "end" : "middle"} className="fill-slate-500 text-[10px]">{t} h</text>
      ))}
      <rect x={x(a.age_hours + a.rul_hours_p10)} width={Math.max(2, x(a.age_hours + a.rul_hours_p90) - x(a.age_hours + a.rul_hours_p10))}
        y={T} height={H - T - B} fill="#fbbf24" opacity={0.15} />
      <line x1={L} x2={W - R} y1={y(a.threshold_mm_s)} y2={y(a.threshold_mm_s)} stroke="#f87171" strokeDasharray="5 4" />
      <text x={W - R - 4} y={y(a.threshold_mm_s) - 5} textAnchor="end" className="fill-red-400 text-[10px]">alarm {a.threshold_mm_s} mm/s</text>
      <line x1={x(a.age_hours)} x2={x(a.age_hours)} y1={T} y2={H - B} stroke="#64748b" strokeDasharray="2 3" />
      <text x={x(a.age_hours) - 4} y={T + 10} textAnchor="end" className="fill-slate-400 text-[10px]">now</text>
      {a.history.map((p) => <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={1.6} fill="#38bdf8" opacity={0.7} />)}
      <path d={fit} fill="none" stroke="#a78bfa" strokeWidth={2} />
      <text x={L} y={T + 2} className="fill-slate-500 text-[10px]">RMS vibration (mm/s)</text>
    </svg>
  );
}
