/**
 * Leads repository — the driving-for-dollars equivalent of deals-repo.
 * Offline-first SQLite; complex fields (distress tags, owner) stored as JSON.
 */
import { LEADS, type Heat, type Lead, type OwnerIntel, type PipelineStatus } from "@/data/sample";

import { getDb } from "./database";

interface LeadRow {
  id: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  distanceMi: number;
  heat: Heat;
  motivationScore: number;
  status: PipelineStatus;
  distressTags: string;
  flags: string;
  photos: number;
  owner: string | null;
  note: string | null;
  createdAt: number;
  updatedAt: number;
}

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    address: row.address,
    city: row.city,
    coords: { lat: row.lat, lng: row.lng },
    distanceMi: row.distanceMi,
    heat: row.heat,
    motivationScore: row.motivationScore,
    status: row.status,
    distressTags: JSON.parse(row.distressTags) as string[],
    flags: row.flags,
    photos: row.photos,
    owner: row.owner ? (JSON.parse(row.owner) as OwnerIntel) : undefined,
    note: row.note ?? undefined,
  };
}

export async function listLeads(): Promise<Lead[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<LeadRow>("SELECT * FROM leads ORDER BY updatedAt DESC");
  return rows.map(rowToLead);
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<LeadRow>("SELECT * FROM leads WHERE id = ?", id);
  return row ? rowToLead(row) : null;
}

export async function saveLead(lead: Lead): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const existing = await db.getFirstAsync<{ createdAt: number }>("SELECT createdAt FROM leads WHERE id = ?", lead.id);
  const createdAt = existing?.createdAt ?? now;

  await db.runAsync(
    `INSERT OR REPLACE INTO leads
       (id, address, city, lat, lng, distanceMi, heat, motivationScore, status, distressTags, flags, photos, owner, note, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    lead.id,
    lead.address,
    lead.city,
    lead.coords.lat,
    lead.coords.lng,
    lead.distanceMi,
    lead.heat,
    lead.motivationScore,
    lead.status,
    JSON.stringify(lead.distressTags),
    lead.flags,
    lead.photos,
    lead.owner ? JSON.stringify(lead.owner) : null,
    lead.note ?? null,
    createdAt,
    now,
  );
}

export async function deleteLead(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM leads WHERE id = ?", id);
}

export async function countLeads(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) as n FROM leads");
  return row?.n ?? 0;
}

/** Seed the sample leads on first run so the scouting screens have content. */
export async function seedLeadsIfEmpty(): Promise<void> {
  if ((await countLeads()) > 0) return;
  for (const lead of LEADS) await saveLead(lead);
}
