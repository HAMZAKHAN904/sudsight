import React, { useCallback } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BurnCard } from "@/components/BurnCard";
import { RenewalList } from "@/components/RenewalList";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { Ionicons } from "@expo/vector-icons";
import { getTotalMonthlyBurn } from "@/utils/calculations";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, isLoading, refresh } = useApp();

  const active = subscriptions.filter((s) => s.is_active);
  const recent = subscriptions.slice(0, 5);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
  }, [refresh]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset + 16,
          paddingBottom: bottomInset + 100,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good day
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Overview
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/subscription/add")}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>

      <BurnCard
        subscriptions={active}
        currency={currency}
        activeCount={active.length}
      />

      {subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          description="Add your first subscription to start tracking your spending."
          icon="card-outline"
          actionLabel="Add Subscription"
          onAction={() => router.push("/subscription/add")}
        />
      ) : (
        <>
          <RenewalList subscriptions={subscriptions} currency={currency} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/subscriptions")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {recent.map((sub, idx) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onPress={() => router.push(`/subscription/${sub.id}`)}
              index={idx}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
