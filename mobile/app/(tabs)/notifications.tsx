import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../lib/theme";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.title}>通知</Text>
        <Text style={styles.desc}>
          ログインすると通知が表示されます
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 18, color: colors.text.primary, ...fonts.bold, marginBottom: 8 },
  desc: { fontSize: 13, color: colors.text.muted, textAlign: "center", lineHeight: 20 },
});
