import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Subscription, getCycleLabel, getMonthlyEquivalent, getPaymentMethodLabel } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { getNextRenewalDate, getDaysUntilRenewal } from "@/utils/dates";
import { CategoryIcon, getCategoryInfo } from "./CategoryIcon";
import { Ionicons } from "@expo/vector-icons";

function getUrgencyColor(days: number): string {
  if (days <= 3)  return "#F04848";
  if (days <= 7)  return "#F5A623";
  return "#2EC4A7";
}

function DaysBadge({ days }: { days: number }) {
  const bg = days <= 3 ? "#F04848" : days <= 7 ? "#F5A623" : "rgba(255,255,255,0.1)";
  const text = days <= 3 ? "#FFFFFF" : days <= 7 ? "#FFFFFF" : "rgba(255,255,255,0.5)";
  const label = days === 0 ? "Today" : days === 1 ? "1d left" : `${days}d left`;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name="calendar-outline" size={10} color={text} />
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
}

function CategoryPill({ categoryId }: { categoryId: string }) {
  const cat = getCategoryInfo(categoryId);
  return (
    <View style={[styles.pill, { backgroundColor: cat.color + "22" }]}>
      <Text style={[styles.pillText, { color: cat.color }]}>{cat.label}</Text>
    </View>
  );
}

interface SubscriptionCardProps {
  subscription: Subscription;
  currency: string;
  onPress: () => void;
  index?: number;
}

function SubscriptionCardInner({ subscription, currency, onPress, index = 0 }: SubscriptionCardProps) {
  const colors = useColors();
  const monthly = getMonthlyEquivalent(
    subscription.cost,
    subscription.billing_cycle,
    subscription.custom_cycle_days
  );
  const nextRenewal = getNextRenewalDate(
    new Date(subscription.start_date),
    subscription.billing_cycle,
    subscription.custom_cycle_days
  );
  const days = getDaysUntilRenewal(nextRenewal);
  const borderColor = getUrgencyColor(days);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify().damping(16)}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: subscription.is_active ? 1 : 0.5,
          },
        ]}
        activeOpacity={0.75}
      >
        <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />
        <View style={styles.iconWrap}>
          <CategoryIcon categoryId={subscription.category} size={48} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {subscription.name}
          </Text>
          <CategoryPill categoryId={subscription.category} />
          <View style={styles.meta}>
            <DaysBadge days={days} />
            <View style={styles.payRow}>
              <Ionicons name="card-outline" size={11} color={colors.mutedForeground} />
              <Text style={[styles.payText, { color: colors.mutedForeground }]}>
                {getPaymentMethodLabel(subscription.payment_method)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.priceWrap}>
          <Text style={[styles.price, { color: colors.foreground }]}>
            {formatCurrency(monthly, currency)}
          </Text>
          <Text style={[styles.perMo, { color: colors.mutedForeground }]}>/mo</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} style={{ marginTop: 4 }} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const SubscriptionCard = React.memo(SubscriptionCardInner);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  leftBorder: {
    width: 3,
    alignSelf: "stretch",
  },
  iconWrap: {
    padding: 14,
  },
  info: {
    flex: 1,
    paddingVertical: 12,
    gap: 5,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  payText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  priceWrap: {
    alignItems: "flex-end",
    paddingRight: 12,
    gap: 0,
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  perMo: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
