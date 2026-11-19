"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", icon: "\u{1F4CA}", label: "Dashboard" },
  { href: "/inspection", icon: "\u{1F50D}", label: "Inspection" },
  { href: "/quotation", icon: "\u{1F4B0}", label: "Quotation" },
  { href: "/failure-analysis", icon: "\u{1F527}", label: "Failure Analysis" },
  { href: "/maintenance", icon: "⚙️", label: "Maintenance" },
  { href: "/remaining-life", icon: "\u{1F4C9}", label: "Remaining Life" },
  { href: "/sourcing", icon: "\u{1F4E6}", label: "Sourcing" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-800 p-2 text-white lg:hidden"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-slate-800 p-5">
          <h1 className="text-lg font-black text-white">
            <span className="text-purple-400">Micro Turner</span> AI
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Bearing Manufacturing Intelligence
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-purple-500/15 text-purple-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-base">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-600">Micro Turner Group</p>
          <p className="text-xs text-slate-600">Pilot: 6200 Series</p>
          <p className="mt-2 text-[11px] font-semibold text-sky-400/80">Prototype · simulated data</p>
        </div>
      </aside>
    </>
  );
}
