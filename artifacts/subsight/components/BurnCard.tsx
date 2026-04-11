import React, { useEffect, useRef, useState } from "react";
import { Animated as RNAnimated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/currency";
import { Subscription, getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";

interface BurnCardProps {
  subscriptions: Subscription[];
  currency: string;
  activeCount: number;
}

function AnimatedAmount({ value, currency }: { value: number; currency: string }) {
  const animVal = useRef(new RNAnimated.Value(0)).current;
  const [display, setDisplay] = useState(formatCurrency(value, currency));

  useEffect(() => {
    const anim = RNAnimated.timing(animVal, {
      toValue: value,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    const id = animVal.addListener(({ value: v }) => {
      setDisplay(formatCurrency(v, currency));
    });
    return () => {
      animVal.removeListener(id);
      anim.stop();
    };
  }, [value, currency, animVal]);

  return <Text style={styles.amount}>{display}</Text>;
}

export function BurnCard({ subscriptions, currency, activeCount }: BurnCardProps) {
  const colors = useColors();
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);
  const daily = monthly / 30.44;

  const progressWidth = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(progressWidth, {
      toValue: Math.min((monthly / 500) * 100, 100),
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [monthly, progressWidth]);

  return (
    <View style={[styles.card, { backgroundColor: "#0F1E40" }]}>
      <View style={styles.cardGlow} />
      <Text style={styles.cardLabel}>MONTHLY SPENDING</Text>
      <AnimatedAmount value={monthly} currency={currency} />

      <View style={styles.progressTrack}>
        <RNAnimated.View
          style={[
            styles.progressFill,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Yearly</Text>
          <Text style={styles.statValue}>{formatCurrency(yearly, currency)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: "#4B9EFF" }]}>Services</Text>
          <Text style={[styles.statValue, { color: "#4B9EFF" }]}>{activeCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Daily</Text>
          <Text style={styles.statValue}>{formatCurrency(daily, currency)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? { shadowColor: "#4B9EFF", shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }
      : { elevation: 8 }),
  },
  cardGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(75,158,255,0.08)",
  },
  cardLabel: {
    fontSize: 11,
    color: "#4B9EFF",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginBottom: 16,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2EC4A7",
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
  },
  statValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
