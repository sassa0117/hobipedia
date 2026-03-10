import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../lib/theme";

export default function TimelineScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>タイムライン</Text>
        <Text style={styles.desc}>
          ログインするとフォロー中ユーザーの活動が表示されます
        </Text>
        <View style={styles.loginBtn}>
          <Text style={styles.loginText}>ログイン</Text>
        </View>
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
  title: { fontSize: 18, color: colors.text.primary, ...fonts.bold, marginBottom: 8 },
  desc: { fontSize: 13, color: colors.text.muted, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  loginBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  loginText: { color: "#fff", fontSize: 14, ...fonts.bold },
});
