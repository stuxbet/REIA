import { Tabs } from "expo-router";

import { TacticalTabBar } from "@/components/tactical/tab-bar";

export const unstable_settings = { initialRouteName: "recon" };

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TacticalTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="recon" />
      <Tabs.Screen name="targets" />
      <Tabs.Screen name="underwrite" />
      <Tabs.Screen name="dossier" />
    </Tabs>
  );
}
