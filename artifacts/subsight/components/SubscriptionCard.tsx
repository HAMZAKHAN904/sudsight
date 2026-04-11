import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Subscription, getCycleLabel, getMonthlyEquivalent } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { getNextRenewalDate, formatRelativeDate } from "@/utils/dates";
import { CategoryIcon } from "./CategoryIcon";

interface SubscriptionCardProps {
  subscription: Subscription;
  currency: string;
  onPress: () => void;
  index?: number;
}

function SubscriptionCardInner({
  subscription,
  currency,
  onPress,
  index = 0,
}: SubscriptionCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

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
  const renewalLabel = formatRelativeDate(nextRenewal);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(15)}
      style={pressStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: subscription.is_active ? 1 : 0.5,
            },
          ]}
        >
          <View style={styles.left}>
            <CategoryIcon categoryId={subscription.category} size={44} />
            <View style={styles.info}>
              <Text
                style={[styles.name, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {subscription.name}
              </Text>
              <Text style={[styles.cycle, { color: colors.mutedForeground }]}>
                {getCycleLabel(subscription.billing_cycle, subscription.custom_cycle_days)} · {renewalLabel}
              </Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={[styles.cost, { color: colors.foreground }]}>
              {formatCurrency(subscription.cost, currency)}
            </Text>
            <Text style={[styles.monthly, { color: colors.mutedForeground }]}>
              {formatCurrency(monthly, currency)}/mo
            </Text>
          </View>
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
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cycle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
    gap: 2,
  },
  cost: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  monthly: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
