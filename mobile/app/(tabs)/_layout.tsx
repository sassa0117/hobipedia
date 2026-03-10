import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../lib/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "🏠",
    search: "🔍",
    timeline: "📰",
    notifications: "🔔",
    profile: "👤",
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || "•"}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.bg.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        headerStyle: { backgroundColor: colors.bg.primary },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          headerTitle: "Hobipedia",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "検索",
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "タイムライン",
          tabBarIcon: ({ focused }) => <TabIcon name="timeline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "通知",
          tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
