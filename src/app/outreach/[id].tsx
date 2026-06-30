import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";

import {
  ActionBar,
  BackButton,
  ChamferButton,
  HazardStripes,
  Mono,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { Lead } from "@/data/sample";
import { getLeadById } from "@/db/leads-repo";

const GREEN = Tactical.green.primary;
const AMBER = Tactical.status.amber;

type Channel = "MAIL" | "SMS" | "CALL" | "LETTER";
const CHANNELS: Channel[] = ["MAIL", "SMS", "CALL", "LETTER"];
const HANDOFF_LABEL: Record<Channel, string> = {
  MAIL: "HANDOFF → APPLE MAIL ▸",
  SMS: "HANDOFF → MESSAGES ▸",
  CALL: "HANDOFF → PHONE ▸",
  LETTER: "EXPORT LETTER ▸",
};
const CAPTION: Record<Channel, string> = {
  MAIL: "OPENS MAIL PRE-FILLED · SEND FROM YOUR ACCOUNT",
  SMS: "OPENS MESSAGES PRE-FILLED · SEND FROM YOUR NUMBER",
  CALL: "OPENS PHONE · DIAL FROM YOUR DEVICE",
  LETTER: "EXPORTS A PRINTABLE PDF YOU MAIL YOURSELF",
};

interface Template {
  id: string;
  label: string;
  subject: string;
  body: string;
}
const TEMPLATES: Template[] = [
  {
    id: "cash-absentee",
    label: "CASH OFFER — ABSENTEE",
    subject: "Interested in your property — [PROP]",
    body: "Hi [OWNER], I'm a local investor interested in [PROP]. I can offer a fast, as-is cash close on your timeline — no repairs, no agent fees. Would you be open to a brief call? — Marcus",
  },
  {
    id: "as-is",
    label: "AS-IS — QUICK CLOSE",
    subject: "Quick as-is offer on [PROP]",
    body: "Hi [OWNER], I buy houses as-is in your area and noticed [PROP]. No showings, no repairs — I cover closing costs and can close fast. Worth a quick conversation? — Marcus",
  },
  {
    id: "rental",
    label: "RENTAL — DIRECT",
    subject: "Your property at [PROP]",
    body: "Hi [OWNER], I'm a local buyer focused on properties like [PROP]. If you've ever considered selling, I can make a straightforward cash offer with a flexible timeline. Open to talking? — Marcus",
  },
];

function merge(text: string, owner: string, prop: string) {
  return text.replaceAll("[OWNER]", owner).replaceAll("[PROP]", prop);
}

function letterHtml(subject: string, body: string) {
  return `<html><body style="font-family:-apple-system,Helvetica,sans-serif;font-size:14px;line-height:1.6;padding:48px;color:#111;"><p style="text-transform:uppercase;letter-spacing:1px;color:#666;font-size:11px;">${subject}</p><hr style="border:none;border-top:1px solid #ccc;margin:16px 0;"/><p>${body}</p></body></html>`;
}

/** Render a template body with [OWNER]/[PROP] merge fields filled + highlighted. */
function MergedBody({ body, owner, prop }: { body: string; owner: string; prop: string }) {
  const parts = body.split(/(\[OWNER\]|\[PROP\])/g);
  return (
    <Mono size={11} color={Tactical.text.secondary} style={{ lineHeight: 18 }}>
      {parts.map((part, i) => {
        if (part === "[OWNER]")
          return (
            <Mono key={i} size={11} color={GREEN}>
              [{owner}]
            </Mono>
          );
        if (part === "[PROP]")
          return (
            <Mono key={i} size={11} color={GREEN}>
              [{prop}]
            </Mono>
          );
        return part;
      })}
    </Mono>
  );
}

function ChannelTile({ label, selected, onPress }: { label: Channel; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: selected ? GREEN : hairline(0.16),
        backgroundColor: selected ? "rgba(124,255,155,0.10)" : Tactical.bg.raised,
      }}
    >
      <Ui size={9} weight="bold" spacing={1} color={selected ? GREEN : Tactical.text.muted}>
        {label}
      </Ui>
    </Pressable>
  );
}

export default function OutreachScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [channel, setChannel] = useState<Channel>("MAIL");
  const [tplIdx, setTplIdx] = useState(0);

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

  const owner = lead?.owner?.name ?? "PROPERTY OWNER";
  const prop = lead?.address ?? "YOUR PROPERTY";
  const tpl = TEMPLATES[tplIdx];
  const subject = merge(tpl.subject, owner, prop);
  const body = merge(tpl.body, owner, prop);

  const handoff = async () => {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    if (channel === "MAIL") Linking.openURL(`mailto:?subject=${s}&body=${b}`);
    else if (channel === "SMS") Linking.openURL(`sms:&body=${b}`);
    else if (channel === "CALL") Linking.openURL("tel:");
    else if (channel === "LETTER") await Print.printAsync({ html: letterHtml(subject, body) });
  };

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="DEPLOY CONTACT"
          titleSize={16}
          titleSpacing={2}
          left={<BackButton onPress={() => router.back()} />}
          sub={`${id ?? "TGT-0147"} · ${owner}`}
        />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* ADVISORY */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: hairline(0.14), overflow: "hidden" }}>
          <View style={{ width: 8, backgroundColor: Tactical.bg.deep, overflow: "hidden" }}>
            <HazardStripes color="rgba(255,178,62,0.22)" band={5} />
          </View>
          <View style={{ flex: 1, backgroundColor: Tactical.bg.panel2, padding: 11, gap: 4 }}>
            <Ui size={9} weight="bold" spacing={1} color={AMBER}>
              ⚠ YOU ARE THE SENDER
            </Ui>
            <Mono size={9} color={Tactical.text.muted} style={{ lineHeight: 14 }}>
              REIA composes only. Nothing routes through our servers. TCPA / CAN-SPAM compliance is yours.
            </Mono>
          </View>
        </View>

        {/* CHANNEL */}
        <View style={{ gap: 8 }}>
          <SectionLabel>CHANNEL</SectionLabel>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {CHANNELS.map((ch) => (
              <ChannelTile key={ch} label={ch} selected={channel === ch} onPress={() => setChannel(ch)} />
            ))}
          </View>
        </View>

        {/* TEMPLATE */}
        <View style={{ gap: 8 }}>
          <SectionLabel>TEMPLATE</SectionLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
            {TEMPLATES.map((t, i) => {
              const active = i === tplIdx;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTplIdx(i)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderWidth: 1,
                    borderColor: active ? GREEN : hairline(0.16),
                    backgroundColor: active ? "rgba(124,255,155,0.10)" : Tactical.bg.raised,
                  }}
                >
                  <Ui size={9} weight="semi" spacing={0.5} color={active ? GREEN : Tactical.text.muted}>
                    {t.label}
                  </Ui>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* MESSAGE · MERGED */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>MESSAGE · MERGED</SectionLabel>
            <Ui size={8} weight="semi" spacing={1} color={GREEN}>
              2 FIELDS ✓
            </Ui>
          </View>
          <View style={{ backgroundColor: Tactical.bg.deep, borderWidth: 1, borderColor: hairline(0.14), padding: 12, gap: 10 }}>
            <Mono size={10} color={Tactical.text.muted}>
              SUBJ: {subject}
            </Mono>
            <View style={{ height: 1, backgroundColor: hairline(0.1) }} />
            <MergedBody body={tpl.body} owner={owner} prop={prop} />
          </View>
        </View>
      </ScrollView>

      <ActionBar style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        <ChamferButton label={HANDOFF_LABEL[channel]} onPress={handoff} full />
        <Mono size={8} color={Tactical.text.faint} style={{ textAlign: "center" }}>
          {CAPTION[channel]}
        </Mono>
      </ActionBar>
    </ScreenShell>
  );
}
