import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { Subscription } from "@/utils/calculations";
import { getNextRenewalDate, getDaysUntilRenewal, formatRenewalDate } from "@/utils/dates";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { router } from "expo-router";

interface RenewalListProps {
  subscriptions: Subscription[];
  currency: string;
}

function RenewalChip({
  sub,
  currency,
}: {
  sub: Subscription;
  currency: string;
}) {
  const colors = useColors();
  const nextDate = getNextRenewalDate(
    new Date(sub.start_date),
    sub.billing_cycle,
    sub.custom_cycle_days
  );
  const days = getDaysUntilRenewal(nextDate);
  const isUrgent = days <= 3;
  const isSoon = days <= 7;

  const urgentColor = isUrgent
    ? colors.destructive
    : isSoon
      ? colors.warning
      : colors.primary;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/subscription/${sub.id}`)}
      style={[
        styles.chip,
        {
          backgroundColor: colors.card,
          borderColor: isUrgent
            ? colors.destructive + "40"
            : isSoon
              ? colors.warning + "40"
              : colors.border,
        },
      ]}
    >
      <CategoryIcon categoryId={sub.category} size={36} />
      <Text style={[styles.chipName, { color: colors.foreground }]} numberOfLines={1}>
        {sub.name}
      </Text>
      <Text style={[styles.chipDate, { color: urgentColor }]}>
        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
      </Text>
      <Text style={[styles.chipCost, { color: colors.mutedForeground }]}>
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
      nextDate: getNextRenewalDate(
        new Date(s.start_date),
        s.billing_cycle,
        s.custom_cycle_days
      ),
    }))
    .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
    .slice(0, 8);

  if (upcoming.length === 0) return null;

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Upcoming Renewals
      </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
    marginTop: 8,
  },
  scroll: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
    width: 100,
  },
  chipName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  chipDate: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  chipCost: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
