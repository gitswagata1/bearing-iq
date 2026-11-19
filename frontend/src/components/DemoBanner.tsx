"use client";

import { STATIC_DEMO } from "@/lib/api";

export default function DemoBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
      {STATIC_DEMO ? "Hosted demo · sample data. The FastAPI backend runs locally; this page uses bundled sample values." : "Prototype · sample data — API offline, showing built-in sample values."}
    </div>
  );
}
