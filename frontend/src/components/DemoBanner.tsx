"use client";

export default function DemoBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
      Demo Mode — Backend not connected. Showing sample data.
    </div>
  );
}
