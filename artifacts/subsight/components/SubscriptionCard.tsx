import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { Subscription, getMonthlyEquivalent, getPaymentMethodLabel } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { getNextRenewalDate, getDaysUntilRenewal } from "@/utils/dates";
import { getCategoryInfo } from "./CategoryIcon";
import { Ionicons } from "@expo/vector-icons";

function getUrgencyColors(days: number): { bg: string; text: string; border: string } {
  if (days <= 3)  return { bg: "#F04848",  text: "#FFF",   border: "#F04848" };
  if (days <= 7)  return { bg: "#F5A623",  text: "#FFF",   border: "#F5A623" };
  return           { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.45)", border: "transparent" };
}

function getBorderGradient(days: number, catColor: string): [string, string] {
  if (days <= 3) return ["#F04848", "#FF6B6B"];
  if (days <= 7) return ["#F5A623", "#FFD93D"];
  return [catColor + "AA", catColor + "44"];
}

function DaysBadge({ days }: { days: number }) {
  const c = getUrgencyColors(days);
  const label = days === 0 ? "Today" : days === 1 ? "1d left" : `${days}d left`;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Ionicons name="time-outline" size={10} color={c.text} />
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

function CategoryPill({ categoryId }: { categoryId: string }) {
  const cat = getCategoryInfo(categoryId);
  return (
    <View style={[styles.pill, { backgroundColor: cat.color + "1A" }]}>
      <View style={[styles.pillDot, { backgroundColor: cat.color }]} />
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
  const monthly = getMonthlyEquivalent(subscription.cost, subscription.billing_cycle, subscription.custom_cycle_days);
  const nextRenewal = getNextRenewalDate(new Date(subscription.start_date), subscription.billing_cycle, subscription.custom_cycle_days);
  const days = getDaysUntilRenewal(nextRenewal);
  const catInfo = getCategoryInfo(subscription.category);
  const borderGrad = getBorderGradient(days, catInfo.color);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(18)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.wrapper, { opacity: subscription.is_active ? 1 : 0.45 }]}
      >
        {/* Card body */}
        <View style={[styles.card, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.06)" }]}>
          {/* Gradient left accent */}
          <LinearGradient
            colors={borderGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.leftAccent}
          />

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: catInfo.color + "15", borderColor: catInfo.color + "30" }]}>
            <Ionicons name={catInfo.icon as never} size={22} color={catInfo.color} />
          </View>

          {/* Info */}
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: "#F0F0F8" }]} numberOfLines={1}>
                {subscription.name}
              </Text>
              {!subscription.is_active && (
                <View style={styles.pausedBadge}>
                  <Text style={styles.pausedText}>Paused</Text>
                </View>
              )}
            </View>
            <CategoryPill categoryId={subscription.category} />
            <View style={styles.meta}>
              <DaysBadge days={days} />
              <View style={styles.payRow}>
                <Ionicons name="card-outline" size={11} color="rgba(255,255,255,0.3)" />
                <Text style={styles.payText}>{getPaymentMethodLabel(subscription.payment_method)}</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceCol}>
            <Text style={styles.price}>{formatCurrency(monthly, currency)}</Text>
            <Text style={styles.perMo}>/mo</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.2)" style={{ marginTop: 6 }} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const SubscriptionCard = React.memo(SubscriptionCardInner);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? { shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 4 }),
  },
  leftAccent: {
    width: 3,
    alignSelf: "stretch",
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    margin: 14,
    borderWidth: 1,
  },
  info: {
    flex: 1,
    paddingVertical: 14,
    gap: 6,
    paddingRight: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  pausedBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pausedText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  pillText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  payRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  payText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
  },
  priceCol: {
    alignItems: "flex-end",
    paddingRight: 14,
    paddingVertical: 14,
  },
  price: {
    fontSize: 16,
    color: "#F0F0F8",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  perMo: {
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
