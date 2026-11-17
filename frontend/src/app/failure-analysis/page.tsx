"use client";

import { useState, useEffect } from "react";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { apiPost, apiGet } from "@/lib/api";
import { demoFailureResult, demoFailurePatterns } from "@/lib/demo-data";

type FailureResult = typeof demoFailureResult;
type Pattern = (typeof demoFailurePatterns)[0];

const PARTS = ["6200-2RS", "6200-ZZ", "6300-2RS", "6300-ZZ", "30205", "30206", "UCP205", "UCP208", "6205-2RS", "6206-2RS"];

const barColors = ["bg-red-500", "bg-yellow-500", "bg-orange-500", "bg-blue-500", "bg-cyan-500", "bg-slate-500"];

export default function FailureAnalysisPage() {
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FailureResult | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>(demoFailurePatterns);

  const [form, setForm] = useState({
    part_number: "6200-2RS",
    description: "",
    customer: "",
    application: "",
    operating_hours: "",
  });

  useEffect(() => {
    apiGet<Pattern[]>("/api/failure/patterns").then(({ data, demo: d }) => {
      if (!d && data) { setPatterns(data); setDemo(false); }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const { data, demo: d } = await apiPost<FailureResult>("/api/failure/analyze", form);
    if (!d && data) {
      setResult(data);
      setDemo(false);
    } else {
      await new Promise((r) => setTimeout(r, 1800));
      setResult(demoFailureResult);
      setDemo(true);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <h1 className="mb-1 text-2xl font-black text-white">AI Failure Analysis</h1>
      <p className="mb-6 text-sm text-slate-400">Describe a bearing failure — AI identifies mode, causes, and recommends corrective actions</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Part Number</label>
            <select value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none">
              {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Failure Description</label>
            <textarea
              rows={4}
              placeholder="e.g. Bearing seized after 3 months under normal load. Customer reports unusual noise before failure. Possible overheating..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Name</label>
            <input type="text" placeholder="e.g. XYZ Motors" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Application (optional)</label>
              <input type="text" placeholder="e.g. Motor assembly" value={form.application} onChange={(e) => setForm({ ...form, application: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Operating Hours (optional)</label>
              <input type="number" placeholder="e.g. 2160" value={form.operating_hours} onChange={(e) => setForm({ ...form, operating_hours: e.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50">
            {loading ? "Analyzing..." : "🔧 Analyze Failure"}
          </button>
        </form>

        {/* Result */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-red-400">AI analyzing failure mode...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <span className="text-4xl">🔧</span>
              <p className="mt-3 text-sm">Describe a failure to get AI analysis</p>
            </div>
          )}

          {!loading && result && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{result.id}</h3>
                <StatusBadge status={result.severity} />
              </div>

              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-400">Failure Mode Identified</p>
                <p className="mt-1 text-xl font-black text-red-400">{result.failure_mode}</p>
                <p className="mt-1 text-sm text-red-300">Confidence: {result.confidence}%</p>
              </div>

              <p className="mb-3 text-sm text-slate-400">{result.evidence}</p>

              <div className="mb-3 flex gap-2">
                <StatusBadge status={result.warranty_eligible ? "Approved" : "Rejected"} />
                <span className="text-xs text-slate-500 self-center">
                  {result.warranty_eligible ? "Warranty eligible" : "Not under warranty"}
                </span>
              </div>

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Probable Causes</p>
              <ul className="mb-4 space-y-1.5">
                {result.probable_causes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-yellow-500">▸</span> {c}
                  </li>
                ))}
              </ul>

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Recommended Actions</p>
              <ul className="mb-4 space-y-1.5">
                {result.recommended_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-green-500">✓</span> {a}
                  </li>
                ))}
              </ul>

              {result.related_cases.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Related Cases</p>
                  {result.related_cases.map((c) => (
                    <div key={c.id} className="mb-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2 text-xs text-slate-400">
                      <span className="font-mono text-slate-500">{c.id}</span> — {c.customer} — {c.failure} ({c.date})
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Failure Patterns */}
      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-300">Failure Pattern Distribution</h2>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <div className="space-y-3">
          {patterns.map((p, i) => (
            <div key={p.failure_mode} className="flex items-center gap-3">
              <span className="w-32 text-sm text-slate-400 flex-shrink-0">{p.failure_mode}</span>
              <div className="flex-1 h-6 bg-slate-800 rounded-md overflow-hidden">
                <div className={`h-full ${barColors[i]} rounded-md flex items-center justify-end pr-2 transition-all`} style={{ width: `${p.pct}%` }}>
                  <span className="text-xs font-bold text-white">{p.count}</span>
                </div>
              </div>
              <span className="w-10 text-right text-xs font-bold text-slate-500">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
