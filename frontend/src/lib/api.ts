const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
/** Hosted static demo (GitHub Pages): no backend, always use the bundled sample data. */
export const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";

export async function apiGet<T = unknown>(path: string): Promise<{ data: T | null; demo: boolean }> {
  if (STATIC_DEMO) return { data: null, demo: true };
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data: data as T, demo: false };
  } catch {
    return { data: null, demo: true };
  }
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<{ data: T | null; demo: boolean }> {
  if (STATIC_DEMO) return { data: null, demo: true };
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data: data as T, demo: false };
  } catch {
    return { data: null, demo: true };
  }
}

export async function apiPostForm<T = unknown>(path: string, formData: FormData): Promise<{ data: T | null; demo: boolean }> {
  if (STATIC_DEMO) return { data: null, demo: true };
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data: data as T, demo: false };
  } catch {
    return { data: null, demo: true };
  }
}
