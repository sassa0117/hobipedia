import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { getItem } from "../../lib/api";
import { colors, fonts } from "../../lib/theme";

const CATEGORY_LABELS: Record<string, string> = {
  ICHIBAN_KUJI: "一番くじ",
  FIGURE: "フィギュア",
  SCALE_FIGURE: "スケールフィギュア",
  PRIZE_FIGURE: "プライズフィギュア",
  NENDOROID: "ねんどろいど",
  ACSTA: "アクリルスタンド",
  PLUSH: "ぬいぐるみ",
  TRADING_CARD: "トレカ",
  OTHER: "その他",
};

export default function ItemDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getItem(slug)
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "アイテムが見つかりません"}</Text>
      </View>
    );
  }

  const name = item.name as string;
  const category = item.category as string;
  const character = item.character as string | null;
  const maker = item.maker as string | null;
  const description = item.description as string | null;
  const series = item.series as { name: string } | null;

  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Image placeholder */}
        <View style={styles.imageContainer}>
          <Text style={styles.noImage}>📦</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          {series && <Text style={styles.seriesTag}>{series.name}</Text>}
          <Text style={styles.itemName}>{name}</Text>
          {character && <Text style={styles.character}>{character}</Text>}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <View style={styles.divider} />

          {/* Details */}
          <View style={styles.details}>
            <DetailRow label="カテゴリ" value={CATEGORY_LABELS[category] || category} />
            {maker && <DetailRow label="メーカー" value={maker} />}
          </View>
        </View>

        {/* Placeholder sections */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>相場データ</Text>
          <Text style={styles.placeholder}>
            Web版で相場を確認できます
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>コメント</Text>
          <Text style={styles.placeholder}>
            Web版でコメントを確認できます
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: 12, gap: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.primary },
  errorText: { fontSize: 14, color: colors.danger },
  imageContainer: {
    height: 200,
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  noImage: { fontSize: 48 },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seriesTag: {
    fontSize: 11,
    color: colors.accentMuted,
    ...fonts.semibold,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 20,
    color: colors.text.primary,
    ...fonts.bold,
    lineHeight: 26,
  },
  character: { fontSize: 13, color: colors.text.muted, marginTop: 4 },
  description: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  details: { gap: 6 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 12, color: colors.text.muted },
  detailValue: { fontSize: 12, color: colors.text.secondary, ...fonts.medium },
  sectionTitle: { fontSize: 14, color: colors.text.primary, ...fonts.bold, marginBottom: 8 },
  placeholder: { fontSize: 12, color: colors.text.dim, textAlign: "center", padding: 12 },
});
