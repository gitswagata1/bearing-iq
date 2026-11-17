"use client";

import { useState, useEffect } from "react";
import StatusBadge from "@/components/StatusBadge";
import DemoBanner from "@/components/DemoBanner";
import { apiPost, apiGet } from "@/lib/api";
import { demoQuoteResult, demoQuoteHistory } from "@/lib/demo-data";

type Quote = typeof demoQuoteResult;
type HistoryRow = (typeof demoQuoteHistory)[0];

const PARTS = ["6200-2RS", "6200-ZZ", "6300-2RS", "6300-ZZ", "30205", "30206", "UCP205", "UCP208", "6205-2RS", "6206-2RS"];

export default function QuotationPage() {
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>(demoQuoteHistory);

  const [form, setForm] = useState({
    part_number: "6200-2RS",
    quantity: 5000,
    customer: "",
    delivery_location: "",
  });

  useEffect(() => {
    apiGet<HistoryRow[]>("/api/quote/history").then(({ data, demo: d }) => {
      if (!d && data) { setHistory(data); setDemo(false); }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setQuote(null);

    const { data, demo: d } = await apiPost<Quote>("/api/quote", form);
    if (!d && data) {
      setQuote(data);
      setDemo(false);
    } else {
      await new Promise((r) => setTimeout(r, 1200));
      setQuote({
        ...demoQuoteResult,
        part_number: form.part_number,
        quantity: form.quantity,
        customer: form.customer || "ABC Bearings",
        delivery: `FOR ${form.delivery_location || "Pune"}`,
        unit_price: 42.5 + Math.random() * 10,
        total_before_gst: form.quantity * (42.5 + Math.random() * 10),
      });
      setDemo(true);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <DemoBanner show={demo} />

      <h1 className="mb-1 text-2xl font-black text-white">AI Quotation Assistant</h1>
      <p className="mb-6 text-sm text-slate-400">Generate bearing quotations using AI — price history, stock levels, customer profile</p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Part Number</label>
            <select
              value={form.part_number}
              onChange={(e) => setForm({ ...form, part_number: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity (pcs)</label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. ABC Bearings"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Location</label>
            <input
              type="text"
              placeholder="e.g. Pune"
              value={form.delivery_location}
              onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Generating Quote..." : "🤖 Generate AI Quote"}
          </button>
        </form>

        {/* Quote Result */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-blue-400">AI generating quotation...</p>
            </div>
          )}

          {!loading && !quote && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600">
              <span className="text-4xl">💰</span>
              <p className="mt-3 text-sm">Fill the form to generate an AI quote</p>
            </div>
          )}

          {!loading && quote && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Quotation {quote.id}</h3>
                <StatusBadge status="Pending" />
              </div>
              <div className="space-y-2 text-sm">
                <QRow label="Customer" value={quote.customer} />
                <QRow label="Part" value={`${quote.part_number} — ${quote.description}`} />
                <QRow label="Quantity" value={`${quote.quantity.toLocaleString()} pcs`} />
                <QRow label="Unit Price" value={`₹${quote.unit_price.toFixed(2)}/pc`} />
                <QRow label="Subtotal" value={`₹${quote.total_before_gst.toLocaleString()}`} />
                <QRow label="GST (18%)" value={`₹${quote.gst_amount.toLocaleString()}`} />
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-lg font-black text-blue-400">₹{quote.total_with_gst.toLocaleString()}</span>
                </div>
                <QRow label="Lead Time" value={`${quote.lead_time_days} working days`} />
                <QRow label="Delivery" value={quote.delivery} />
                <QRow label="Payment" value={quote.payment_terms} />
                <QRow label="Validity" value={`${quote.validity_days} days`} />
              </div>
              <div className="mt-4 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400">AI Notes</p>
                <p className="mt-1 text-sm text-purple-300">{quote.ai_notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-300">Recent Quotes</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Part</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.quote_id} className="border-b border-slate-800 text-slate-300">
                <td className="px-4 py-2.5 font-mono text-xs">{h.quote_id}</td>
                <td className="px-4 py-2.5">{h.customer_name}</td>
                <td className="px-4 py-2.5">{h.part_number}</td>
                <td className="px-4 py-2.5">{h.quantity.toLocaleString()}</td>
                <td className="px-4 py-2.5">₹{h.total_amount.toLocaleString()}</td>
                <td className="px-4 py-2.5">{new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-2.5"><StatusBadge status={h.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-300">{value}</span>
    </div>
  );
}
