import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { getItems, ItemSummary } from "../../lib/api";
import { colors, fonts } from "../../lib/theme";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await getItems({ q });
      setResults(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="作品名・アイテム名で検索..."
          placeholderTextColor={colors.text.dim}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(`/item/${item.slug}`)}
            >
              <View style={styles.thumb}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} resizeMode="contain" />
                ) : (
                  <Text style={{ fontSize: 8, color: colors.text.dim }}>No img</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.sub}>
                  {item.series?.name || ""} {item.character ? `• ${item.character}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            searched ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>見つかりませんでした</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  searchBar: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    backgroundColor: colors.bg.elevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  list: { padding: 12, gap: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bg.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: colors.bg.elevated,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  thumbImg: { width: "100%", height: "100%" },
  name: { fontSize: 13, color: colors.text.primary, ...fonts.bold },
  sub: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
  emptyText: { fontSize: 14, color: colors.text.muted },
});
