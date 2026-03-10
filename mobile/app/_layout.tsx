import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../lib/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.primary },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: "800", fontSize: 18 },
          contentStyle: { backgroundColor: colors.bg.primary },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="item/[slug]"
          options={{ title: "アイテム詳細", headerBackTitle: "戻る" }}
        />
      </Stack>
    </>
  );
}
