/**
 * Deals repository. Persists each saved analysis as its inputs PLUS a computed
 * snapshot, so historical deals never change when defaults/engine change later.
 */
import { computeBrrrr, evaluateBuyBox, type Verdict } from "@/calc/brrrr";
import { type BrrrrInputs, type BrrrrResult, type BuyBox, DEFAULT_BUY_BOX } from "@/calc/types";
import type { DealStatus } from "@/data/sample";

import { getDb } from "./database";

export interface DealRecord {
  id: string;
  address: string;
  leadId: string | null;
  inputs: BrrrrInputs;
  snapshot: BrrrrResult;
  verdict: Verdict;
  status: DealStatus;
  createdAt: number;
  updatedAt: number;
}

interface DealRow {
  id: string;
  address: string;
  leadId: string | null;
  inputs: string;
  snapshot: string;
  verdict: Verdict;
  status: DealStatus;
  createdAt: number;
  updatedAt: number;
}

function rowToRecord(row: DealRow): DealRecord {
  return {
    id: row.id,
    address: row.address,
    leadId: row.leadId,
    inputs: JSON.parse(row.inputs) as BrrrrInputs,
    snapshot: JSON.parse(row.snapshot) as BrrrrResult,
    verdict: row.verdict,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function genId(): string {
  return `OP-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()}`;
}

export async function listDeals(): Promise<DealRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<DealRow>("SELECT * FROM deals ORDER BY updatedAt DESC");
  return rows.map(rowToRecord);
}

export async function getDeal(id: string): Promise<DealRecord | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DealRow>("SELECT * FROM deals WHERE id = ?", id);
  return row ? rowToRecord(row) : null;
}

/** Insert or update a deal. Recomputes the snapshot + verdict from the inputs. */
export async function saveDeal(params: {
  id?: string;
  address: string;
  leadId?: string | null;
  inputs: BrrrrInputs;
  status: DealStatus;
  buyBox?: BuyBox;
}): Promise<DealRecord> {
  const db = await getDb();
  const snapshot = computeBrrrr(params.inputs);
  const verdict = evaluateBuyBox(snapshot, params.buyBox ?? DEFAULT_BUY_BOX).verdict;
  const now = Date.now();
  const id = params.id ?? genId();
  const leadId = params.leadId ?? null;

  const existing = await db.getFirstAsync<{ createdAt: number }>(
    "SELECT createdAt FROM deals WHERE id = ?",
    id,
  );
  const createdAt = existing?.createdAt ?? now;

  await db.runAsync(
    `INSERT OR REPLACE INTO deals
       (id, address, leadId, inputs, snapshot, verdict, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    params.address,
    leadId,
    JSON.stringify(params.inputs),
    JSON.stringify(snapshot),
    verdict,
    params.status,
    createdAt,
    now,
  );

  return { id, address: params.address, leadId, inputs: params.inputs, snapshot, verdict, status: params.status, createdAt, updatedAt: now };
}

export async function deleteDeal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM deals WHERE id = ?", id);
}

export async function countDeals(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) as n FROM deals");
  return row?.n ?? 0;
}
