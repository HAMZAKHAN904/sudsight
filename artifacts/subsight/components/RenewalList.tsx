import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Subscription } from "@/utils/calculations";
import { getNextRenewalDate, getDaysUntilRenewal } from "@/utils/dates";
import { getCategoryInfo } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

function urgencyGradient(days: number): [string, string] {
  if (days <= 3) return ["#F04848", "#C0392B"];
  if (days <= 7) return ["#F5A623", "#D4881C"];
  return ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"];
}

function RenewalChip({ sub, currency }: { sub: Subscription; currency: string }) {
  const colors = useColors();
  const nextDate = getNextRenewalDate(new Date(sub.start_date), sub.billing_cycle, sub.custom_cycle_days);
  const days = getDaysUntilRenewal(nextDate);
  const catInfo = getCategoryInfo(sub.category);
  const grad = urgencyGradient(days);
  const isUrgent = days <= 7;
  const dayLabel = days === 0 ? "Today" : `${days}d`;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/subscription/${sub.id}`)}
      activeOpacity={0.8}
      style={styles.chipOuter}
    >
      <View style={[styles.chip, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.07)" }]}>
        {/* Icon */}
        <View style={[styles.chipIcon, { backgroundColor: catInfo.color + "18", borderColor: catInfo.color + "35" }]}>
          <Ionicons name={catInfo.icon as never} size={22} color={catInfo.color} />
        </View>

        <Text style={styles.chipName} numberOfLines={1}>{sub.name}</Text>

        {/* Days badge */}
        <LinearGradient colors={grad} style={styles.dayBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={[styles.dayText, { color: isUrgent ? "#FFF" : "rgba(255,255,255,0.5)" }]}>{dayLabel}</Text>
        </LinearGradient>

        <Text style={styles.chipCost}>{formatCurrency(sub.cost, currency)}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface RenewalListProps {
  subscriptions: Subscription[];
  currency: string;
}

export function RenewalList({ subscriptions, currency }: RenewalListProps) {
  const colors = useColors();

  const upcoming = subscriptions
    .filter((s) => s.is_active)
    .map((s) => ({
      sub: s,
      nextDate: getNextRenewalDate(new Date(s.start_date), s.billing_cycle, s.custom_cycle_days),
    }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 8);

  const urgentCount = upcoming.filter(({ nextDate }) => getDaysUntilRenewal(nextDate) <= 7).length;

  if (upcoming.length === 0) return null;

  return (
    <View>
      {/* Section header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.bellWrap}>
            <Ionicons name="notifications" size={15} color="#F5A623" />
          </View>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
        </View>
        {urgentCount > 0 && (
          <LinearGradient colors={["#F5A623", "#D4881C"]} style={styles.countBadge}>
            <Text style={styles.countText}>{urgentCount}</Text>
          </LinearGradient>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {upcoming.map(({ sub }) => (
          <RenewalChip key={sub.id} sub={sub} currency={currency} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bellWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(245,166,35,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    color: "#F0F0F8",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#FFF",
  },
  scroll: {
    gap: 10,
    paddingRight: 2,
  },
  chipOuter: {
    ...(Platform.OS === "ios"
      ? { shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 4 }),
  },
  chip: {
    width: 112,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  chipIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chipName: {
    fontSize: 12,
    color: "#F0F0F8",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  dayText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  chipCost: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_400Regular",
  },
});
