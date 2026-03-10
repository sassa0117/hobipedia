import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { getItems, ItemSummary } from "../../lib/api";
import { colors, fonts } from "../../lib/theme";

const CATEGORY_LABELS: Record<string, string> = {
  ICHIBAN_KUJI: "一番くじ",
  FIGURE: "フィギュア",
  SCALE_FIGURE: "スケール",
  PRIZE_FIGURE: "プライズ",
  NENDOROID: "ねんどろいど",
  ACSTA: "アクスタ",
  PLUSH: "ぬいぐるみ",
  TRADING_CARD: "トレカ",
  OTHER: "その他",
};

function formatPrice(n: number) {
  return `¥${n.toLocaleString()}`;
}

function ItemCard({ item }: { item: ItemSummary }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/item/${item.slug}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardImage}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.noImage}>No Image</Text>
        )}
      </View>
      <View style={styles.cardBody}>
        {item.series && (
          <Text style={styles.seriesTag}>{item.series.name}</Text>
        )}
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.character && (
          <Text style={styles.character}>{item.character}</Text>
        )}
        <View style={styles.stats}>
          <Text style={styles.statText}>♥ {item._count.likes}</Text>
          <Text style={styles.statText}>📦 {item._count.collections}</Text>
          <Text style={styles.statText}>📊 {item._count.priceReports}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (p: number, replace = false) => {
    try {
      const data = await getItems({ page: p });
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setHasMore(p < data.pagination.totalPages);
      setPage(p);
    } catch (e) {
      console.error("Failed to fetch items:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(1, true);
  }, [fetchItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(1, true);
  }, [fetchItems]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) {
      fetchItems(page + 1);
    }
  }, [hasMore, loading, page, fetchItems]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ItemCard item={item} />}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        hasMore ? (
          <ActivityIndicator style={{ padding: 20 }} color={colors.accent} />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>まだアイテムがありません</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg.primary },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.bg.elevated,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  noImage: { fontSize: 10, color: colors.text.dim },
  cardBody: { flex: 1, padding: 10, justifyContent: "center" },
  seriesTag: {
    fontSize: 9,
    color: colors.accentMuted,
    ...fonts.semibold,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    color: colors.text.primary,
    ...fonts.bold,
    lineHeight: 18,
  },
  character: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  stats: { flexDirection: "row", gap: 10, marginTop: 6 },
  statText: { fontSize: 10, color: colors.text.dim },
  emptyText: { fontSize: 14, color: colors.text.muted },
});
