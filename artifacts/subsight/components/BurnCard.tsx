import React, { useEffect, useRef } from "react";
import {
  Animated as RNAnimated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/currency";
import { Subscription, getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";
import { Ionicons } from "@expo/vector-icons";

interface BurnCardProps {
  subscriptions: Subscription[];
  currency: string;
  activeCount: number;
}

function AnimatedTicker({ value, currency }: { value: number; currency: string }) {
  const animatedValue = useRef(new RNAnimated.Value(0)).current;
  const displayValue = useRef(value);

  useEffect(() => {
    const anim = RNAnimated.timing(animatedValue, {
      toValue: value,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();

    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.current = v;
    });

    return () => {
      animatedValue.removeListener(listener);
      anim.stop();
    };
  }, [value, animatedValue]);

  const colors = useColors();
  const [displayText, setDisplayText] = React.useState(
    formatCurrency(value, currency)
  );

  useEffect(() => {
    const id = animatedValue.addListener(({ value: v }) => {
      setDisplayText(formatCurrency(v, currency));
    });
    return () => animatedValue.removeListener(id);
  }, [animatedValue, currency]);

  return (
    <Text style={[styles.burnAmount, { color: colors.primaryForeground }]}>
      {displayText}
    </Text>
  );
}

export function BurnCard({ subscriptions, currency, activeCount }: BurnCardProps) {
  const colors = useColors();
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);

  return (
    <LinearGradient
      colors={["#6366F1", "#818CF8", "#a5b4fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: "rgba(255,255,255,0.75)" }]}>
          Monthly Burn
        </Text>
        <View style={styles.badge}>
          <Ionicons name="flash" size={12} color="rgba(255,255,255,0.9)" />
          <Text style={styles.badgeText}>{activeCount} active</Text>
        </View>
      </View>

      <AnimatedTicker value={monthly} currency={currency} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Per Year</Text>
          <Text style={styles.footerValue}>{formatCurrency(yearly, currency)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Per Day</Text>
          <Text style={styles.footerValue}>
            {formatCurrency(monthly / 30.44, currency)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    gap: 8,
    ...(Platform.OS === "ios"
      ? {
          shadowColor: "#6366F1",
          shadowOpacity: 0.4,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        }
      : { elevation: 8 }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter_500Medium",
  },
  burnAmount: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    gap: 16,
    alignItems: "center",
  },
  footerItem: {
    flex: 1,
    gap: 2,
  },
  footerLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
