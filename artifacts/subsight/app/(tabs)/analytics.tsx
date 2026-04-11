import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { DonutChart } from "@/components/DonutChart";
import { CategoryIcon, getCategoryInfo } from "@/components/CategoryIcon";
import { EmptyState } from "@/components/EmptyState";
import {
  getMonthlyByCategory,
  getTotalMonthlyBurn,
  getTotalYearlyBurn,
} from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        statStyles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[statStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[statStyles.sub, { color: colors.mutedForeground }]}>
        {sub}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 2,
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const active = subscriptions.filter((s) => s.is_active);
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);

  const byCategory = useMemo(
    () => getMonthlyByCategory(subscriptions),
    [subscriptions]
  );

  const donutData = useMemo(() => {
    const entries = Object.entries(byCategory)
      .map(([cat, val]) => ({ category: cat, value: val }))
      .sort((a, b) => b.value - a.value);

    const total = entries.reduce((s, e) => s + e.value, 0);
    return entries.map((e) => ({
      ...e,
      percentage: total > 0 ? (e.value / total) * 100 : 0,
    }));
  }, [byCategory]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topInset + 16,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        Analytics
      </Text>

      {active.length === 0 ? (
        <EmptyState
          title="No data yet"
          description="Add subscriptions to see spending analytics."
          icon="bar-chart-outline"
        />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              label="Monthly"
              value={formatCurrency(monthly, currency)}
              sub="per month"
            />
            <StatCard
              label="Yearly"
              value={formatCurrency(yearly, currency)}
              sub="projected"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Daily"
              value={formatCurrency(monthly / 30.44, currency)}
              sub="per day"
            />
            <StatCard
              label="Active"
              value={String(active.length)}
              sub={`of ${subscriptions.length} total`}
            />
          </View>

          <View
            style={[
              styles.chartCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>
              Spending by Category
            </Text>
            <View style={styles.chart}>
              <DonutChart
                data={donutData}
                total={monthly}
                currency={currency}
              />
            </View>
          </View>

          <View
            style={[
              styles.breakdownCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>
              Category Breakdown
            </Text>
            <View style={styles.breakdown}>
              {donutData.map(({ category, value, percentage }) => {
                const cat = getCategoryInfo(category);
                return (
                  <View key={category} style={styles.breakdownRow}>
                    <CategoryIcon categoryId={category} size={36} />
                    <View style={styles.breakdownInfo}>
                      <Text
                        style={[
                          styles.breakdownLabel,
                          { color: colors.foreground },
                        ]}
                      >
                        {cat.label}
                      </Text>
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${percentage}%`,
                              backgroundColor: cat.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.breakdownValues}>
                      <Text
                        style={[
                          styles.breakdownAmount,
                          { color: colors.foreground },
                        ]}
                      >
                        {formatCurrency(value, currency)}
                      </Text>
                      <Text
                        style={[
                          styles.breakdownPct,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  chart: {
    alignItems: "center",
  },
  breakdownCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  breakdown: {
    gap: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  breakdownInfo: {
    flex: 1,
    gap: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  breakdownValues: {
    alignItems: "flex-end",
    gap: 1,
  },
  breakdownAmount: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  breakdownPct: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
