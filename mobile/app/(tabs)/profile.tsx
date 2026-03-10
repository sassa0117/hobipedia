import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../../lib/theme";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>?</Text>
        </View>
        <Text style={styles.title}>プロフィール</Text>
        <Text style={styles.desc}>
          ログインしてコレクションを管理しましょう
        </Text>
        <View style={styles.loginBtn}>
          <Text style={styles.loginText}>Googleでログイン</Text>
        </View>
        <View style={[styles.loginBtn, styles.twitterBtn]}>
          <Text style={styles.loginText}>X (Twitter) でログイン</Text>
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bg.elevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 24, color: colors.text.dim },
  title: { fontSize: 18, color: colors.text.primary, ...fonts.bold, marginBottom: 8 },
  desc: { fontSize: 13, color: colors.text.muted, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  loginBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  twitterBtn: { backgroundColor: "#1d9bf0" },
  loginText: { color: "#fff", fontSize: 14, ...fonts.bold },
});
