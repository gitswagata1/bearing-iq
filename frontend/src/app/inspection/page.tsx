"use client";

import { useState, useRef, useEffect } from "react";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { apiPostForm, apiGet } from "@/lib/api";
import { demoInspectionResult, demoInspectionPass, demoInspectionStats, type InspectionResult } from "@/lib/demo-data";

export default function InspectionPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [demo, setDemo] = useState(true);
  const [stats, setStats] = useState(demoInspectionStats);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    apiGet<typeof demoInspectionStats>("/api/inspect/stats").then(({ data, demo: d }) => {
      if (!d && data) { setStats(data); setDemo(false); }
    });
  }, []);

  async function handleInspect(file?: File) {
    setScanning(true);
    setResult(null);

    if (file) {
      const fd = new FormData();
      fd.append("image", file);
      const { data, demo: d } = await apiPostForm<InspectionResult>("/api/inspect", fd);
      if (!d && data) {
        setResult(data);
        setDemo(false);
        setScanning(false);
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 1500));
    setResult(Math.random() > 0.4 ? demoInspectionResult : demoInspectionPass);
    setDemo(true);
    setScanning(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleInspect(file);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <h1 className="mb-1 text-2xl font-black text-white">AI Visual Inspection</h1>
      <p className="mb-6 text-sm text-slate-400">Upload a bearing surface image or run a demo inspection</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            dragOver ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"
          }`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleInspect(f); }} />
          <span className="text-4xl">📸</span>
          <p className="mt-3 text-sm font-semibold text-slate-300">Drop bearing image here or click to upload</p>
          <p className="mt-1 text-xs text-slate-500">Supports JPG, PNG — any resolution</p>

          <button
            onClick={(e) => { e.stopPropagation(); handleInspect(); }}
            disabled={scanning}
            className="mt-6 rounded-lg bg-purple-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "▶ Run Demo Inspection"}
          </button>
        </div>

        {/* Result */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          {scanning && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-purple-400">AI Scanning Bearing Surface...</p>
            </div>
          )}

          {!scanning && !result && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <span className="text-4xl">🔍</span>
              <p className="mt-3 text-sm">Upload an image or run demo to see results</p>
            </div>
          )}

          {!scanning && result && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Inspection Report</h3>
                <StatusBadge status={result.result} />
              </div>

              <div className="space-y-3 text-sm">
                <Row label="ID" value={result.id} />
                <Row label="Part" value={result.part_number} />
                <Row label="Batch" value={result.batch} />
                <Row label="Confidence" value={`${result.confidence}%`} />
                <Row label="Scan Time" value={`${result.scan_time_ms}ms`} />
                {result.defect_type && <Row label="Defect Type" value={result.defect_type} highlight />}
                {result.location && <Row label="Location" value={result.location} />}
                {result.severity && <Row label="Severity" value={result.severity} highlight />}
                <div className={`mt-4 rounded-lg p-3 ${result.result === "DEFECT" ? "bg-red-500/10 border border-red-500/30" : "bg-green-500/10 border border-green-500/30"}`}>
                  <p className={`text-sm font-semibold ${result.result === "DEFECT" ? "text-red-400" : "text-green-400"}`}>
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-300">Inspection Statistics</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon="📊" value={stats.total_inspected.toLocaleString()} label="Total Inspected" color="purple" />
        <StatCard icon="✅" value={stats.total_passed.toLocaleString()} label="Passed" color="green" />
        <StatCard icon="❌" value={stats.total_defects.toLocaleString()} label="Defects Found" color="red" />
        <StatCard icon="📈" value={`${stats.defect_rate_pct}%`} label="Defect Rate" color="yellow" />
        <StatCard icon="⏱️" value={`${stats.avg_scan_time_ms}ms`} label="Avg Scan Time" color="blue" />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight ? "text-red-400" : "text-slate-300"}`}>{value}</span>
    </div>
  );
}
