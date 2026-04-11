import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Swipeable } from "react-native-gesture-handler";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { EmptyState } from "@/components/EmptyState";
import { Ionicons } from "@expo/vector-icons";
import { Subscription } from "@/utils/calculations";

function DeleteAction({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.deleteAction, { backgroundColor: colors.destructive }]}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );
}

export default function SubscriptionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, deleteSub, toggleSub } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (filter === "active") result = result.filter((s) => s.is_active);
    if (filter === "inactive") result = result.filter((s) => !s.is_active);
    if (search.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [subscriptions, filter, search]);

  const handleDelete = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteSub(id);
  };

  const handleToggle = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await toggleSub(id);
  };

  const renderItem = ({ item, index }: { item: Subscription; index: number }) => (
    <Swipeable
      renderRightActions={() => (
        <DeleteAction onPress={() => handleDelete(item.id)} />
      )}
    >
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
      <View
        style={[
          styles.header,
          {
            paddingTop: topInset + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Subscriptions
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/subscription/add")}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={22} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchRow, { borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
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

      <View style={styles.filters}>
        {(["all", "active", "inactive"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f ? colors.primary : colors.secondary,
                borderColor: filter === f ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filter === f
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.listEmpty,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 90,
          },
        ]}
        scrollEnabled={filtered.length > 0}
        ListEmptyComponent={
          <EmptyState
            title={search ? "No results found" : "No subscriptions yet"}
            description={
              search
                ? "Try a different search term."
                : "Tap + to add your first subscription."
            }
            icon="card-outline"
            actionLabel={search ? undefined : "Add Subscription"}
            onAction={
              search ? undefined : () => router.push("/subscription/add")
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  listEmpty: {
    flex: 1,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 16,
    marginBottom: 10,
    gap: 4,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
