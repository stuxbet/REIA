import { useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { WORKED_EXAMPLE } from "@/calc/types";
import {
  ActionBar,
  BackButton,
  ChamferButton,
  HazardStripes,
  HeatBar,
  HEAT_EMPTY,
  IconButton,
  Mono,
  Panel,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  StatusDot,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { Lead, PipelineStatus } from "@/data/sample";
import { getLeadById, saveLead } from "@/db/leads-repo";
import { heatColor, statusColor } from "@/lib/tactical";
import { useDealStore } from "@/store/deal";

const RED = Tactical.status.red;
const AMBER = Tactical.status.amber;

function StripedTile({ children, style }: { children?: ReactNode; style?: object }) {
  return (
    <View style={[{ backgroundColor: Tactical.bg.panel2, borderWidth: 1, borderColor: hairline(0.12), overflow: "hidden" }, style]}>
      <HazardStripes color="rgba(124,255,155,0.06)" band={7} />
      {children}
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: hairline(0.16), paddingHorizontal: 6, paddingVertical: 2 }}>
      <Ui size={8} weight="semi" spacing={0.5} color={Tactical.text.secondary}>
        {label}
      </Ui>
    </View>
  );
}

function IntelRow({ label, value, valueColor = Tactical.text.primary, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7, borderTopWidth: 1, borderTopColor: hairline(0.08) }}>
      <Mono size={8} color={Tactical.text.faint} spacing={0.5}>
        {label}
      </Mono>
      <Mono size={11} weight={bold ? "bold" : "reg"} color={valueColor}>
        {value}
      </Mono>
    </View>
  );
}

export default function TargetDossierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const loadDeal = useDealStore((s) => s.load);

  useEffect(() => {
    let on = true;
    (async () => {
      const l = await getLeadById(id ?? "");
      if (on) setLead(l);
    })();
    return () => {
      on = false;
    };
  }, [id]);

  if (!lead) {
    return (
      <ScreenShell>
        <TopBar>
          <ScreenHeader title="DOSSIER" titleSize={16} titleSpacing={2} left={<BackButton onPress={() => router.back()} />} sub={`ID // ${id ?? "—"}`} />
        </TopBar>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Mono size={10} color={Tactical.text.dim} spacing={0.5}>
            LOADING INTEL…
          </Mono>
        </View>
      </ScreenShell>
    );
  }

  const owner = lead.owner;
  const c = heatColor(lead.heat);

  const setStatus = async (s: PipelineStatus) => {
    const updated = { ...lead, status: s };
    setLead(updated);
    await saveLead(updated);
  };

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="DOSSIER"
          titleSize={16}
          titleSpacing={2}
          left={<BackButton onPress={() => router.back()} />}
          sub={`ID // ${lead.id}`}
          right={
            <IconButton onPress={() => {}}>
              <Ui size={13} color={Tactical.text.secondary}>
                ✎
              </Ui>
            </IconButton>
          }
        />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 14 }} showsVerticalScrollIndicator={false}>
        {/* PHOTO HERO */}
        <View style={{ height: 150, flexDirection: "row", gap: 6 }}>
          <StripedTile style={{ flex: 2 }}>
            <View style={{ position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,90,82,0.16)", paddingHorizontal: 5, paddingVertical: 2 }}>
              <StatusDot color={RED} size={5} />
              <Ui size={8} weight="bold" spacing={1} color={RED}>
                {lead.heat}
              </Ui>
            </View>
            <View style={{ position: "absolute", top: 8, right: 8, borderWidth: 1, borderColor: Tactical.green.primary, paddingHorizontal: 5, paddingVertical: 2 }}>
              <Ui size={8} weight="bold" spacing={1} color={Tactical.green.primary}>
                {lead.status}
              </Ui>
            </View>
            <Mono size={8} color={Tactical.text.faint} style={{ position: "absolute", bottom: 8, left: 8 }}>
              {lead.photos} PHOTOS · 06.29
            </Mono>
          </StripedTile>
          <View style={{ flex: 1, gap: 6 }}>
            <StripedTile style={{ flex: 1 }} />
            <StripedTile style={{ flex: 1 }} />
          </View>
        </View>

        {/* ADDRESS */}
        <View style={{ gap: 6 }}>
          <Mono size={19} color={Tactical.text.heading} spacing={0.5}>
            {lead.address}
          </Mono>
          <Mono size={10} color={Tactical.text.muted}>
            {lead.city} · 39.0991°N 94.5772°W
          </Mono>
          {owner?.absentee ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 2, borderWidth: 1, borderColor: RED, paddingHorizontal: 7, paddingVertical: 3 }}>
              <StatusDot color={RED} size={5} />
              <Ui size={8} weight="bold" spacing={1} color={Tactical.status.redLight}>
                ABSENTEE OWNER CONFIRMED
              </Ui>
            </View>
          ) : null}
        </View>

        {/* STATUS PIPELINE */}
        <View style={{ gap: 8 }}>
          <SectionLabel>STATUS</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {(["NEW", "RECON", "CONTACT", "ENGAGED", "DEAD"] as PipelineStatus[]).map((s) => {
              const active = lead.status === s;
              const col = statusColor(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? col : hairline(0.16),
                    backgroundColor: active ? "rgba(124,255,155,0.06)" : Tactical.bg.raised,
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                  }}
                >
                  <Ui size={8} weight="bold" spacing={1} color={active ? col : Tactical.text.muted}>
                    {s}
                  </Ui>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* INTEL // OWNER & TAX */}
        {owner ? (
          <Panel>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <SectionLabel>INTEL // OWNER &amp; TAX</SectionLabel>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <StatusDot color={Tactical.green.primary} size={5} />
                <Ui size={8} weight="semi" spacing={1} color={Tactical.green.primary}>
                  ENRICHED
                </Ui>
              </View>
            </View>
            <IntelRow label="OWNER" value={owner.name} />
            <IntelRow label="MAILING ≠ SITE" value={owner.mailingAddress} valueColor={AMBER} />
            <IntelRow label="LAST SALE" value={owner.lastSale} />
            <IntelRow label="ASSESSED" value={owner.assessed} />
            <IntelRow label="TAX STATUS" value={owner.taxStatus} valueColor={RED} bold />
            <IntelRow label="OCCUPANCY" value={owner.occupancy} valueColor={AMBER} />
            <Mono size={8} color={Tactical.text.dim} style={{ marginTop: 8 }}>
              SRC // RENTCAST · JACKSON CO ASSESSOR
            </Mono>
          </Panel>
        ) : null}

        {/* FIELD INTEL */}
        <View style={{ gap: 8 }}>
          <SectionLabel>FIELD INTEL</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {lead.distressTags.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </View>
          {lead.note ? (
            <Panel accent={Tactical.green.deep}>
              <Mono size={11} color={Tactical.text.secondary}>
                &ldquo;{lead.note}&rdquo;
              </Mono>
            </Panel>
          ) : null}
        </View>

        {/* MOTIVATION SCORE */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>MOTIVATION SCORE</SectionLabel>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <Ui size={11} weight="bold" spacing={1} color={c}>
                {lead.heat}
              </Ui>
              <Mono size={16} weight="bold" color={c}>
                {lead.motivationScore}
              </Mono>
            </View>
          </View>
          <HeatBar
            colors={[RED, RED, RED, Tactical.status.orange, AMBER, AMBER, HEAT_EMPTY]}
            height={7}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
            {["+ABSENTEE", "+TAX-DELINQ", "+VACANT", "+DISTRESS"].map((f) => (
              <Tag key={f} label={f} />
            ))}
          </View>
        </View>
      </ScrollView>

      <ActionBar>
        <ChamferButton
          label="△ UNDERWRITE"
          onPress={() => {
            loadDeal(WORKED_EXAMPLE, { address: lead.address, leadId: lead.id });
            router.push("/underwrite");
          }}
          full
        />
        <ChamferButton label="✉ CONTACT" variant="outline" onPress={() => router.push(`/outreach/${lead.id}`)} full />
      </ActionBar>
    </ScreenShell>
  );
}
