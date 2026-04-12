import React, { useCallback } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
import { AdBanner } from "@/components/AdBanner";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/currency";
import { getTotalMonthlyBurn } from "@/utils/calculations";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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

  const topInset = Platform.OS === "web" ? 56 : insets.top;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Premium header */}
      <View style={[styles.headerWrap, { paddingTop: topInset }]}>
        <LinearGradient
          colors={["rgba(75,158,255,0.08)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.appName}>Subsight</Text>
            {active.length > 0 && (
              <Text style={styles.headerSub}>
                {active.length} active · {formatCurrency(daily, currency)}/day
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push("/subscription/add")}
            style={styles.addBtnWrap}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#5BABFF", "#2D7DD2"]}
              style={styles.addBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={26} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        {/* Monthly Burn Card */}
        <BurnCard subscriptions={active} currency={currency} activeCount={active.length} />

        {/* Banner ad — only visible in native builds */}
        <AdBanner size="BANNER" />

        {subscriptions.length === 0 ? (
          <EmptyState
            title="No subscriptions yet"
            description="Start tracking your subscriptions to see your monthly spend, upcoming renewals and more."
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
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Active Subscriptions</Text>
              {active.length > 5 && (
                <TouchableOpacity onPress={() => router.push("/(tabs)/subscriptions")}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              )}
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
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },

  headerWrap: {
    paddingBottom: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  appName: {
    fontSize: 30,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  addBtnWrap: {
    borderRadius: 100,
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? { shadowColor: "#4B9EFF", shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 8 }),
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    paddingHorizontal: 18,
    gap: 20,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    color: "#F0F0F8",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: -8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
