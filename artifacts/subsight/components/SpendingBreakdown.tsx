import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { getCategoryInfo } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";
import { Subscription, getMonthlyByCategory, getMonthlyEquivalent } from "@/utils/calculations";

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
  subscriptions.filter(s => s.is_active).forEach(s => {
    countByCategory[s.category] = (countByCategory[s.category] || 0) + 1;
  });

  if (entries.length === 0) return null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Spending Breakdown</Text>
        <Text style={[styles.serviceCount, { color: colors.mutedForeground }]}>
          {subscriptions.filter(s => s.is_active).length} services
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Stacked bar */}
        <View style={styles.stackedBar}>
          {entries.map(({ cat, pct }) => {
            const info = getCategoryInfo(cat);
            return (
              <View
                key={cat}
                style={[
                  styles.barSegment,
                  { width: `${pct}%`, backgroundColor: info.color },
                ]}
              />
            );
          })}
        </View>

        {/* Category rows */}
        {entries.map(({ cat, val, pct }) => {
          const info = getCategoryInfo(cat);
          const count = countByCategory[cat] || 0;
          return (
            <View key={cat} style={[styles.row, { borderTopColor: colors.border }]}>
              <View style={styles.rowLeft}>
                <View style={[styles.dot, { backgroundColor: info.color }]} />
                <View>
                  <Text style={[styles.catName, { color: colors.foreground }]}>{info.label}</Text>
                  <Text style={[styles.catMeta, { color: colors.mutedForeground }]}>
                    {count} sub{count !== 1 ? "s" : ""} · {pct.toFixed(0)}%
                  </Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.catAmount, { color: info.color }]}>
                  {formatCurrency(val, currency)}
                </Text>
                <View style={[styles.catBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${pct}%`, backgroundColor: info.color },
                    ]}
                  />
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
    fontFamily: "Inter_600SemiBold",
  },
  serviceCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  stackedBar: {
    flexDirection: "row",
    height: 6,
    overflow: "hidden",
    gap: 2,
  },
  barSegment: {
    height: "100%",
    borderRadius: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  catMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 5,
    minWidth: 90,
  },
  catAmount: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  catBar: {
    width: 80,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
