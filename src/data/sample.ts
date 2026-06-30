/**
 * Domain types + seed fixtures. The SQLite repositories (db/leads-repo,
 * db/deals-repo) own runtime data now; LEADS here just seeds the leads table
 * on first run.
 */
export type Heat = "HOT" | "WARM" | "COLD";
export type PipelineStatus = "NEW" | "RECON" | "CONTACT" | "ENGAGED" | "DEAD";
export type DealStatus = "ANALYZING" | "PURSUING" | "DEAD";

export interface OwnerIntel {
  name: string;
  mailingAddress: string;
  absentee: boolean;
  lastSale: string;
  assessed: string;
  taxStatus: string;
  occupancy: string;
}

export interface Lead {
  id: string;
  address: string;
  city: string;
  coords: { lat: number; lng: number };
  distanceMi: number;
  heat: Heat;
  motivationScore: number; // 0–100
  status: PipelineStatus;
  distressTags: string[];
  flags: string; // short summary line, e.g. "VACANT · ROOF DMG"
  photos: number; // placeholder count
  owner?: OwnerIntel;
  note?: string;
}

export const LEADS: Lead[] = [
  {
    id: "TGT-0147",
    address: "1428 ELM AVE",
    city: "KANSAS CITY, MO 64127",
    coords: { lat: 39.0991, lng: -94.5772 },
    distanceMi: 0.2,
    heat: "HOT",
    motivationScore: 86,
    status: "NEW",
    distressTags: ["VACANT", "OVERGROWN", "ROOF DMG"],
    flags: "VACANT · ROOF DMG",
    photos: 3,
    owner: {
      name: "ESTATE OF R. HALE",
      mailingAddress: "8800 STATE LINE RD",
      absentee: true,
      lastSale: "06/1998 · $41,000",
      assessed: "$58,200",
      taxStatus: "DELINQUENT · 2YR",
      occupancy: "VACANT",
    },
    note: "Tarp on roof, mail piled up. Neighbor says empty ~1yr.",
  },
  {
    id: "TGT-0148",
    address: "902 N 14TH ST",
    city: "KANSAS CITY, MO 64106",
    coords: { lat: 39.1106, lng: -94.5681 },
    distanceMi: 0.4,
    heat: "WARM",
    motivationScore: 61,
    status: "RECON",
    distressTags: ["OVERGROWN", "FSBO"],
    flags: "OVERGROWN · FSBO",
    photos: 2,
  },
  {
    id: "TGT-0149",
    address: "3315 PROSPECT AVE",
    city: "KANSAS CITY, MO 64128",
    coords: { lat: 39.0826, lng: -94.5552 },
    distanceMi: 1.1,
    heat: "HOT",
    motivationScore: 79,
    status: "CONTACT",
    distressTags: ["BOARDED", "CODE VIOL"],
    flags: "BOARDED · CODE",
    photos: 4,
  },
  {
    id: "TGT-0150",
    address: "711 BENTON BLVD",
    city: "KANSAS CITY, MO 64124",
    coords: { lat: 39.1015, lng: -94.5405 },
    distanceMi: 2.0,
    heat: "COLD",
    motivationScore: 34,
    status: "ENGAGED",
    distressTags: ["FSBO"],
    flags: "FSBO",
    photos: 1,
  },
  {
    id: "TGT-0151",
    address: "5050 TROOST AVE",
    city: "KANSAS CITY, MO 64110",
    coords: { lat: 39.0407, lng: -94.5722 },
    distanceMi: 0.9,
    heat: "WARM",
    motivationScore: 58,
    status: "NEW",
    distressTags: ["OVERGROWN"],
    flags: "OVERGROWN",
    photos: 2,
  },
];
