"use client";

const PALETTE = ["#a78bfa", "#60a5fa", "#f87171", "#fbbf24", "#22d3ee", "#4ade80"];

export function Donut({ data, centerLabel, centerValue }: { data: { label: string; value: number }[]; centerLabel: string; centerValue: string }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = 60, c = 2 * Math.PI * r;
  const lens = data.map((d) => (d.value / total) * c);
  const offsets = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 flex-shrink-0 -rotate-90" role="img" aria-label="Defect distribution">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#1e293b" strokeWidth="18" />
        {data.map((d, i) => {
          const len = lens[i];
          return (
            <circle key={d.label} cx="80" cy="80" r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth="18"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offsets[i]} />
          );
        })}
        <g className="rotate-90" style={{ transformOrigin: "80px 80px" }}>
          <text x="80" y="78" textAnchor="middle" className="fill-white text-xl font-black">{centerValue}</text>
          <text x="80" y="96" textAnchor="middle" className="fill-slate-500 text-[9px] font-semibold uppercase">{centerLabel}</text>
        </g>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-slate-300">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1">{d.label}</span>
            <span className="font-bold text-white">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBar({ rows }: { rows: { label: string; value: number; max?: number; color: string; suffix?: string }[] }) {
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-slate-300">{r.label}</span>
            <span className="font-bold text-white">{r.value}{r.suffix}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (r.value / (r.max ?? 100)) * 100)}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StockBars({ rows }: { rows: { label: string; stock: number; demand: number }[] }) {
  const max = Math.max(...rows.map((r) => Math.max(r.stock, r.demand)), 1);
  const h = 130;
  const bw = 22;
  const gap = 56;
  return (
    <svg viewBox={`0 0 ${rows.length * (bw * 2 + gap) + 10} ${h + 34}`} className="w-full" role="img" aria-label="Stock versus forecast demand">
      {rows.map((r, i) => {
        const x = 10 + i * (bw * 2 + gap);
        const hs = (r.stock / max) * h, hd = (r.demand / max) * h;
        return (
          <g key={r.label}>
            <rect x={x} y={h - hs} width={bw} height={hs} rx="3" fill="#60a5fa" />
            <rect x={x + bw + 3} y={h - hd} width={bw} height={hd} rx="3" fill="#a78bfa" />
            <text x={x + bw} y={h + 16} textAnchor="middle" className="fill-slate-400 text-[10px] font-semibold">{r.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
