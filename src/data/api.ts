/**
 * Client for the self-hosted VPS backend (see /server). The base URL is an
 * EXPO_PUBLIC_ env var so it's set per-environment, never hardcoded.
 *
 * NOTE: enrichByAddress spends one of the RentCast free-tier monthly requests.
 * Always call it behind an explicit, confirmed user action.
 */
import type { OwnerIntel } from "@/data/sample";

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export interface EnrichResponse extends OwnerIntel {
  address: string;
}

export function isApiConfigured(): boolean {
  return API_URL.length > 0;
}

export async function enrichByAddress(address: string): Promise<EnrichResponse> {
  if (!API_URL) throw new Error("Backend not configured — set EXPO_PUBLIC_API_URL to your VPS.");
  const res = await fetch(`${API_URL}/enrich?address=${encodeURIComponent(address)}`);
  const data = (await res.json().catch(() => null)) as (EnrichResponse & { error?: string }) | null;
  if (!res.ok || !data) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}
