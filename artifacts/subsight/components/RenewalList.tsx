import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Subscription } from "@/utils/calculations";
import { getNextRenewalDate, getDaysUntilRenewal } from "@/utils/dates";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

interface RenewalListProps {
  subscriptions: Subscription[];
  currency: string;
}

function RenewalChip({ sub, currency }: { sub: Subscription; currency: string }) {
  const colors = useColors();
  const nextDate = getNextRenewalDate(new Date(sub.start_date), sub.billing_cycle, sub.custom_cycle_days);
  const days = getDaysUntilRenewal(nextDate);
  const isUrgent = days <= 3;
  const isSoon  = days <= 7;
  const badgeBg = isUrgent ? "#F04848" : isSoon ? "#F5A623" : "rgba(255,255,255,0.1)";
  const badgeText = (isUrgent || isSoon) ? "#FFF" : colors.mutedForeground;
  const dayLabel = days === 0 ? "Today" : `${days}d`;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/subscription/${sub.id}`)}
      style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <CategoryIcon categoryId={sub.category} size={44} />
      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{sub.name}</Text>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.badgeText, { color: badgeText }]}>{dayLabel}</Text>
      </View>
      <Text style={[styles.cost, { color: colors.mutedForeground }]}>
        {formatCurrency(sub.cost, currency)}
      </Text>
    </TouchableOpacity>
  );
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
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="notifications" size={18} color={colors.warning} />
          <Text style={[styles.title, { color: colors.foreground }]}>Upcoming Renewals</Text>
        </View>
        {urgentCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.countText}>{urgentCount}</Text>
          </View>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    paddingRight: 4,
  },
  chip: {
    width: 110,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 7,
  },
  name: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  cost: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
