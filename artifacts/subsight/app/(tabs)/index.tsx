import React, { useCallback } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BurnCard } from "@/components/BurnCard";
import { RenewalList } from "@/components/RenewalList";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { SpendingBreakdown } from "@/components/SpendingBreakdown";
import { EmptyState } from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/currency";
import { getTotalMonthlyBurn } from "@/utils/calculations";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, isLoading, refresh } = useApp();

  const active = subscriptions.filter((s) => s.is_active);
  const daily = getTotalMonthlyBurn(subscriptions) / 30.44;

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
  }, [refresh]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Subsight</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {active.length} active · {formatCurrency(daily, currency)}/day
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/subscription/add")}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Monthly Burn Card */}
      <BurnCard subscriptions={active} currency={currency} activeCount={active.length} />

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
          {/* Upcoming Renewals */}
          <RenewalList subscriptions={subscriptions} currency={currency} />

          {/* Spending Breakdown */}
          <SpendingBreakdown subscriptions={subscriptions} currency={currency} />

          {/* Active Subscriptions */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Active Subscriptions
            </Text>
          </View>
          {active.slice(0, 5).map((sub, idx) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              currency={currency}
              onPress={() => router.push(`/subscription/${sub.id}`)}
              index={idx}
            />
          ))}
          {active.length > 5 && (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/subscriptions")}
              style={[styles.viewAllBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View all {subscriptions.length} subscriptions
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  viewAllBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
