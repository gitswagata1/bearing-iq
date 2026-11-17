"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { apiGet } from "@/lib/api";
import { demoMachines, demoAlerts } from "@/lib/demo-data";

type Machine = (typeof demoMachines)[0];
type Alert = (typeof demoAlerts)[0];

function healthColor(h: number) {
  if (h >= 80) return "text-green-400 border-green-500";
  if (h >= 50) return "text-yellow-400 border-yellow-500";
  return "text-red-400 border-red-500";
}

function healthBg(h: number) {
  if (h >= 80) return "bg-green-500";
  if (h >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function MaintenancePage() {
  const [demo, setDemo] = useState(true);
  const [machines, setMachines] = useState<Machine[]>(demoMachines);
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);

  useEffect(() => {
    Promise.all([
      apiGet<Machine[]>("/api/maintenance/machines"),
      apiGet<Alert[]>("/api/maintenance/alerts"),
    ]).then(([m, a]) => {
      if (!m.demo && m.data) { setMachines(m.data); setDemo(false); }
      if (!a.demo && a.data) setAlerts(a.data);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <h1 className="mb-1 text-2xl font-black text-white">Predictive Maintenance</h1>
      <p className="mb-6 text-sm text-slate-400">Real-time machine health monitoring with AI failure prediction</p>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((a, i) => (
            <div
              key={`${a.machine_id}-${i}`}
              className={`rounded-xl border p-4 ${
                a.status === "critical"
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-yellow-500/30 bg-yellow-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={a.status} />
                <span className="text-sm font-bold text-white">{a.machine_name}</span>
                <span className="ml-auto text-xs text-slate-500">{timeAgo(a.detected_at)}</span>
              </div>
              <p className={`text-sm ${a.status === "critical" ? "text-red-300" : "text-yellow-300"}`}>{a.message}</p>
              <p className="mt-1 text-xs text-slate-400"><strong>Action:</strong> {a.ai_prediction.recommended_action}</p>
            </div>
          ))}
        </div>
      )}

      {/* Machine Grid */}
      <h2 className="mb-3 text-lg font-bold text-slate-300">Machine Status</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machines.map((m) => (
          <div key={m.machine_id} className="rounded-xl border border-slate-700 bg-slate-900 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white">{m.name}</p>
                <p className="text-xs text-slate-500">{m.machine_id}</p>
              </div>
              <StatusBadge status={m.status} />
            </div>

            {/* Health Gauge */}
            <div className="flex items-center justify-center mb-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${healthColor(m.health_score)}`}>
                <div className="text-center">
                  <p className={`text-xl font-black ${healthColor(m.health_score).split(" ")[0]}`}>{m.health_score}%</p>
                  <p className="text-[10px] text-slate-500">HEALTH</p>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-lg bg-slate-800 p-2 text-center">
                <p className="text-xs text-slate-500">Vibration</p>
                <p className="text-sm font-bold text-slate-300">{m.vibration_level_mm_s} mm/s</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2 text-center">
                <p className="text-xs text-slate-500">Temp</p>
                <p className="text-sm font-bold text-slate-300">{m.temperature_celsius}°C</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-2 text-center">
                <p className="text-xs text-slate-500">Power</p>
                <p className="text-sm font-bold text-slate-300">{m.power_draw_kw} kW</p>
              </div>
            </div>

            {/* AI Prediction */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">AI Prediction</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Failure Probability</span>
                  <span className={`font-bold ${m.ai_prediction.failure_probability_pct > 50 ? "text-red-400" : m.ai_prediction.failure_probability_pct > 20 ? "text-yellow-400" : "text-green-400"}`}>
                    {m.ai_prediction.failure_probability_pct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time to Failure</span>
                  <span className="font-bold text-slate-300">
                    {m.ai_prediction.estimated_time_to_failure_hours != null ? `${m.ai_prediction.estimated_time_to_failure_hours}h` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prevention Cost</span>
                  <span className="font-bold text-green-400">₹{m.ai_prediction.cost_of_prevention.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Breakdown Cost</span>
                  <span className="font-bold text-red-400">₹{m.ai_prediction.cost_of_breakdown.toLocaleString()}</span>
                </div>
              </div>
              {/* Cost bar */}
              <div className="mt-2 flex gap-1">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${(m.ai_prediction.cost_of_prevention / m.ai_prediction.cost_of_breakdown) * 100}%` }} />
                <div className={`h-2 flex-1 rounded-full ${healthBg(m.health_score)}`} style={{ opacity: 0.3 }} />
              </div>
              <p className="mt-1 text-[10px] text-slate-600">
                Fix now: ₹{m.ai_prediction.cost_of_prevention.toLocaleString()} vs breakdown: ₹{m.ai_prediction.cost_of_breakdown.toLocaleString()} ({Math.round(m.ai_prediction.cost_of_breakdown / m.ai_prediction.cost_of_prevention)}x)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
