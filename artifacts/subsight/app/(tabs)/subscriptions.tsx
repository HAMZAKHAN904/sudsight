import React, { useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { EmptyState } from "@/components/EmptyState";
import { AdBanner } from "@/components/AdBanner";
import { Ionicons } from "@expo/vector-icons";
import { Subscription } from "@/utils/calculations";
import { getCategoryInfo, CATEGORIES } from "@/components/CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { getTotalMonthlyBurn } from "@/utils/calculations";

type StatusFilter = "all" | "active" | "paused";

function DeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.deleteAction}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );
}

export default function SubscriptionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, deleteSub } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const filteredCats = useMemo(() => {
    const used = new Set(subscriptions.map((s) => s.category));
    return CATEGORIES.filter((c) => used.has(c.id));
  }, [subscriptions]);

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (statusFilter === "active")  result = result.filter((s) => s.is_active);
    if (statusFilter === "paused")  result = result.filter((s) => !s.is_active);
    if (catFilter !== "all")        result = result.filter((s) => s.category === catFilter);
    if (search.trim()) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [subscriptions, statusFilter, catFilter, search]);

  const totalShown = getTotalMonthlyBurn(filtered);

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteSub(id);
  };

  const renderItem = ({ item, index }: { item: Subscription; index: number }) => (
    <Swipeable renderRightActions={() => <DeleteAction onPress={() => handleDelete(item.id)} />}>
      <SubscriptionCard
        subscription={item}
        currency={currency}
        onPress={() => router.push(`/subscription/${item.id}`)}
        index={index}
      />
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Subscriptions</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subscriptions.length} total · {filtered.length} shown
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/subscription/add")}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, category..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status filter row */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {(["all", "active", "paused"] as StatusFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setStatusFilter(f)}
            style={[
              styles.statusChip,
              {
                backgroundColor: statusFilter === f ? colors.primary : colors.card,
                borderColor: statusFilter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusFilter === f ? "#FFF" : colors.mutedForeground },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <Text style={[styles.totalText, { color: colors.mutedForeground }]}>
          {formatCurrency(totalShown, currency)}/mo
        </Text>
      </View>

      {/* Category filter */}
      {filteredCats.length > 0 && (
        <View style={[styles.catRowWrap, { borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: "all", label: "All", color: colors.primary }, ...filteredCats.map(c => ({ id: c.id, label: c.label, color: c.color }))]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.catScroll}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setCatFilter(item.id)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: catFilter === item.id ? item.color + "22" : colors.card,
                    borderColor: catFilter === item.id ? item.color : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: catFilter === item.id ? item.color : colors.mutedForeground },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90 },
        ]}
        scrollEnabled={filtered.length > 0}
        ListHeaderComponent={<AdBanner size="BANNER" />}
        ListEmptyComponent={
          <EmptyState
            title={search ? "No results found" : "No subscriptions yet"}
            description={search ? "Try a different term." : "Tap + to add your first subscription."}
            icon="card-outline"
            actionLabel={search ? undefined : "Add Subscription"}
            onAction={search ? undefined : () => router.push("/subscription/add")}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  searchWrap: { paddingHorizontal: 18, paddingBottom: 12, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  totalText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  catRowWrap: { borderBottomWidth: 1, paddingVertical: 8 },
  catScroll: { paddingHorizontal: 18, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, borderWidth: 1 },
  catText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 18, paddingTop: 10 },
  listEmpty: { flex: 1 },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#F04848",
    gap: 4,
  },
  deleteText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
});
