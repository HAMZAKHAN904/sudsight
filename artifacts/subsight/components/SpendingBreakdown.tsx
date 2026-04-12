import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { getCategoryInfo } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { Subscription, getMonthlyByCategory } from "@/utils/calculations";

interface SpendingBreakdownProps {
  subscriptions: Subscription[];
  currency: string;
}

export function SpendingBreakdown({ subscriptions, currency }: SpendingBreakdownProps) {
  const colors = useColors();

  const byCategory = getMonthlyByCategory(subscriptions);
  const total = Object.values(byCategory).reduce((s, v) => s + v, 0);

  const entries = Object.entries(byCategory)
    .map(([cat, val]) => ({ cat, val, pct: total > 0 ? (val / total) * 100 : 0 }))
    .sort((a, b) => b.val - a.val);

  const countByCategory: Record<string, number> = {};
  subscriptions.filter((s) => s.is_active).forEach((s) => {
    countByCategory[s.category] = (countByCategory[s.category] || 0) + 1;
  });

  if (entries.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Spending Breakdown</Text>
        <View style={styles.servicesBadge}>
          <Text style={styles.servicesText}>
            {subscriptions.filter((s) => s.is_active).length} services
          </Text>
        </View>
      </View>

      {/* Card */}
      <View style={[
        styles.card,
        { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.06)" },
        Platform.OS === "ios"
          ? { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }
          : { elevation: 4 },
      ]}>
        {/* Stacked bar */}
        <View style={styles.stackBar}>
          {entries.map(({ cat, pct }, i) => {
            const info = getCategoryInfo(cat);
            return (
              <View
                key={cat}
                style={[
                  styles.barSeg,
                  {
                    width: `${pct}%`,
                    backgroundColor: info.color,
                    borderTopLeftRadius: i === 0 ? 4 : 0,
                    borderBottomLeftRadius: i === 0 ? 4 : 0,
                    borderTopRightRadius: i === entries.length - 1 ? 4 : 0,
                    borderBottomRightRadius: i === entries.length - 1 ? 4 : 0,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Category rows */}
        {entries.map(({ cat, val, pct }, i) => {
          const info = getCategoryInfo(cat);
          const count = countByCategory[cat] || 0;
          return (
            <View
              key={cat}
              style={[
                styles.row,
                i < entries.length - 1 && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.catDot, { backgroundColor: info.color }]} />
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{info.label}</Text>
                  <Text style={styles.catMeta}>{count} sub{count !== 1 ? "s" : ""} · {pct.toFixed(0)}%</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.catAmount, { color: info.color }]}>
                  {formatCurrency(val, currency)}
                </Text>
                <View style={styles.miniBarTrack}>
                  <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: info.color }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    color: "#F0F0F8",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  servicesBadge: {
    backgroundColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  servicesText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  stackBar: {
    flexDirection: "row",
    height: 6,
    margin: 16,
    marginBottom: 4,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
  },
  barSeg: {
    height: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catInfo: { gap: 2 },
  catName: {
    fontSize: 14,
    color: "#F0F0F8",
    fontFamily: "Inter_500Medium",
  },
  catMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 5,
    minWidth: 90,
  },
  catAmount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  miniBarTrack: {
    width: 70,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
