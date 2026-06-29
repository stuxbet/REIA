import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

const GREEN = Tactical.green.primary;
const AMBER = Tactical.status.amber;

const OWNER = "R. HALE";
const PROP = "1428 ELM AVE";
const SUBJECT = `Interested in your property — ${PROP}`;
const BODY = `Hi ${OWNER}, I'm a local investor interested in ${PROP}. I can offer a fast, as-is cash close on your timeline — no repairs, no agent fees. Would you be open to a brief call? — Marcus`;

type Channel = "MAIL" | "SMS" | "CALL" | "LETTER";
const CHANNELS: Channel[] = ["MAIL", "SMS", "CALL", "LETTER"];
const HANDOFF_LABEL: Record<Channel, string> = {
  MAIL: "HANDOFF → APPLE MAIL ▸",
  SMS: "HANDOFF → MESSAGES ▸",
  CALL: "HANDOFF → PHONE ▸",
  LETTER: "EXPORT LETTER ▸",
};

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
  const [channel, setChannel] = useState<Channel>("MAIL");

  const handoff = () => {
    const subject = encodeURIComponent(SUBJECT);
    const body = encodeURIComponent(BODY);
    if (channel === "MAIL") Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    else if (channel === "SMS") Linking.openURL(`sms:&body=${body}`);
    else if (channel === "CALL") Linking.openURL("tel:");
    // LETTER → would generate a printable PDF (expo-print) in a later phase.
  };

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="DEPLOY CONTACT"
          titleSize={16}
          titleSpacing={2}
          left={<BackButton onPress={() => router.back()} />}
          sub={`${id ?? "TGT-0147"} · ESTATE OF R. HALE`}
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
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Tactical.bg.panel2, borderWidth: 1, borderColor: hairline(0.12), paddingHorizontal: 12, paddingVertical: 11 }}>
            <Mono size={11} color={Tactical.text.primary}>
              CASH OFFER — ABSENTEE
            </Mono>
            <Ui size={11} weight="bold" color={Tactical.text.muted}>
              ▾
            </Ui>
          </View>
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
              SUBJ: {SUBJECT}
            </Mono>
            <View style={{ height: 1, backgroundColor: hairline(0.1) }} />
            <Mono size={11} color={Tactical.text.secondary} style={{ lineHeight: 18 }}>
              Hi <Mono size={11} color={GREEN}>[{OWNER}]</Mono>, I&apos;m a local investor interested in{" "}
              <Mono size={11} color={GREEN}>[{PROP}]</Mono>. I can offer a fast, as-is cash close on your timeline — no
              repairs, no agent fees. Would you be open to a brief call? — Marcus
            </Mono>
          </View>
        </View>
      </ScrollView>

      <ActionBar style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
        <ChamferButton label={HANDOFF_LABEL[channel]} onPress={handoff} full />
        <Mono size={8} color={Tactical.text.faint} style={{ textAlign: "center" }}>
          OPENS MAIL PRE-FILLED · SEND FROM YOUR ACCOUNT
        </Mono>
      </ActionBar>
    </ScreenShell>
  );
}
