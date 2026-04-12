import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated as RNAnimated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "@/utils/currency";
import { Subscription, getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";
import { Ionicons } from "@expo/vector-icons";

function AnimatedAmount({ value, currency }: { value: number; currency: string }) {
  const animVal = useRef(new RNAnimated.Value(0)).current;
  const [display, setDisplay] = useState(formatCurrency(0, currency));

  useEffect(() => {
    const anim = RNAnimated.timing(animVal, {
      toValue: value,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    const id = animVal.addListener(({ value: v }) => setDisplay(formatCurrency(v, currency)));
    return () => { animVal.removeListener(id); anim.stop(); };
  }, [value, currency]);

  return <Text style={styles.amount}>{display}</Text>;
}

interface BurnCardProps {
  subscriptions: Subscription[];
  currency: string;
  activeCount: number;
}

export function BurnCard({ subscriptions, currency, activeCount }: BurnCardProps) {
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly  = getTotalYearlyBurn(subscriptions);
  const daily   = monthly / 30.44;

  const progressAnim = useRef(new RNAnimated.Value(0)).current;
  const pct = Math.min(monthly / 500, 1);

  useEffect(() => {
    RNAnimated.timing(progressAnim, {
      toValue: pct,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={["#12224A", "#0E1B3D", "#091428"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decorative orbs */}
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />
        <View style={styles.orbCenter} />

        {/* Header row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <View style={styles.labelDot} />
            <Text style={styles.cardLabel}>MONTHLY SPENDING</Text>
          </View>
          <View style={styles.activeBadge}>
            <Ionicons name="flash" size={11} color="#4B9EFF" />
            <Text style={styles.activeBadgeText}>{activeCount} active</Text>
          </View>
        </View>

        {/* Hero amount */}
        <AnimatedAmount value={monthly} currency={currency} />

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <RNAnimated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
          <View style={[styles.progressGlow, { opacity: pct > 0.05 ? 1 : 0 }]} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PER YEAR</Text>
            <Text style={styles.statValue}>{formatCurrency(yearly, currency)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: "#4B9EFF" }]}>SERVICES</Text>
            <Text style={[styles.statValue, { color: "#4B9EFF", fontSize: 20 }]}>{activeCount}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>PER DAY</Text>
            <Text style={styles.statValue}>{formatCurrency(daily, currency)}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 24,
    ...(Platform.OS === "ios"
      ? { shadowColor: "#4B9EFF", shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 10 } }
      : { elevation: 12 }),
  },
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(75,158,255,0.15)",
  },

  /* Orbs */
  orbTopRight: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(75,158,255,0.07)",
  },
  orbBottomLeft: {
    position: "absolute",
    left: -30,
    bottom: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(46,196,167,0.06)",
  },
  orbCenter: {
    position: "absolute",
    right: 40,
    top: 50,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(75,158,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(75,158,255,0.1)",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4B9EFF",
  },
  cardLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(75,158,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(75,158,255,0.25)",
  },
  activeBadgeText: {
    fontSize: 11,
    color: "#4B9EFF",
    fontFamily: "Inter_600SemiBold",
  },

  amount: {
    fontSize: 48,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -2,
    marginBottom: 20,
  },

  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    marginBottom: 20,
    overflow: "visible",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#2EC4A7",
  },
  progressGlow: {
    position: "absolute",
    top: -3,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: "rgba(46,196,167,0.2)",
    borderRadius: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
