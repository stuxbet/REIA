/**
 * RentCast proxy. The API key stays here (server-side); the app never sees it.
 * One property lookup = one of the account's monthly requests, so callers
 * should gate this behind an explicit user action.
 */
const BASE = "https://api.rentcast.io/v1";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Normalized enrichment shape the app maps straight onto its OwnerIntel. */
export interface EnrichResult {
  address: string;
  name: string;
  mailingAddress: string;
  absentee: boolean;
  lastSale: string;
  assessed: string;
  taxStatus: string;
  occupancy: string;
}

interface RcProperty {
  formattedAddress?: string;
  owner?: { names?: string[]; mailingAddress?: { formattedAddress?: string } };
  ownerOccupied?: boolean;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessments?: Record<string, { value?: number }>;
  propertyTaxes?: Record<string, { total?: number }>;
}

function latest<T>(rec?: Record<string, T>): T | undefined {
  if (!rec) return undefined;
  const keys = Object.keys(rec).sort();
  return keys.length ? rec[keys[keys.length - 1]] : undefined;
}

function usd(n?: number): string {
  return typeof n === "number" ? `$${Math.round(n).toLocaleString("en-US")}` : "—";
}

function fmtSale(date?: string, price?: number): string {
  if (!date && price == null) return "—";
  const d = date ? new Date(date) : null;
  const ds = d && !Number.isNaN(d.getTime()) ? `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` : "—";
  return `${ds} · ${usd(price)}`;
}

export async function enrichAddress(address: string, apiKey: string): Promise<EnrichResult> {
  const url = `${BASE}/properties?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { "X-Api-Key": apiKey, accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(res.status, `RentCast ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as RcProperty[] | RcProperty;
  const p: RcProperty | undefined = Array.isArray(data) ? data[0] : data;
  if (!p) throw new HttpError(404, "No property found for that address");

  const site = (p.formattedAddress ?? address).toUpperCase();
  const mailing = p.owner?.mailingAddress?.formattedAddress ?? "";
  const absentee = p.ownerOccupied === false || (!!mailing && mailing.toUpperCase() !== site);
  const tax = latest(p.propertyTaxes)?.total;

  return {
    address: p.formattedAddress ?? address,
    name: p.owner?.names?.join(", ") || "—",
    mailingAddress: mailing || "—",
    absentee,
    lastSale: fmtSale(p.lastSaleDate, p.lastSalePrice),
    assessed: usd(latest(p.taxAssessments)?.value),
    taxStatus: typeof tax === "number" ? `${usd(tax)}/YR` : "—",
    occupancy: p.ownerOccupied === true ? "OWNER-OCCUPIED" : p.ownerOccupied === false ? "ABSENTEE" : "—",
  };
}
