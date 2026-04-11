import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/EmptyState";
import { getCategoryInfo } from "@/components/CategoryIcon";
import {
  getMonthlyByCategory, getMonthlyByPaymentMethod,
  getMonthlyEquivalent, getTotalMonthlyBurn, getTotalYearlyBurn,
  getCycleLabel, getPaymentMethodLabel
} from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

function MetricCard({
  icon, iconBg, label, value, sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  const colors = useColors();
  return (
    <View style={[metricStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[metricStyles.icon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </View>
      <Text style={[metricStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[metricStyles.value, { color: iconBg.replace("33", "") }]}>{value}</Text>
      <Text style={[metricStyles.sub, { color: colors.mutedForeground }]}>{sub}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  icon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  label: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase" },
  value: { fontSize: 20, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const active = subscriptions.filter((s) => s.is_active);
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);
  const daily = monthly / 30.44;
  const avgPerService = active.length > 0 ? monthly / active.length : 0;

  const byCategory = useMemo(() => getMonthlyByCategory(subscriptions), [subscriptions]);
  const byPayment = useMemo(() => getMonthlyByPaymentMethod(subscriptions), [subscriptions]);

  const catEntries = Object.entries(byCategory)
    .map(([cat, val]) => ({ cat, val, pct: monthly > 0 ? (val / monthly) * 100 : 0 }))
    .sort((a, b) => b.val - a.val);

  const totalStacked = catEntries.reduce((s, e) => s + e.val, 0);

  const biggest = active.sort(
    (a, b) =>
      getMonthlyEquivalent(b.cost, b.billing_cycle, b.custom_cycle_days) -
      getMonthlyEquivalent(a.cost, a.billing_cycle, a.custom_cycle_days)
  )[0];

  const rankedSubs = [...active]
    .sort(
      (a, b) =>
        getMonthlyEquivalent(b.cost, b.billing_cycle, b.custom_cycle_days) -
        getMonthlyEquivalent(a.cost, a.billing_cycle, a.custom_cycle_days)
    )
    .slice(0, 5);

  const payEntries = Object.entries(byPayment)
    .map(([method, val]) => ({ method, val }))
    .sort((a, b) => b.val - a.val);

  const countByPayment: Record<string, number> = {};
  active.forEach((s) => {
    countByPayment[s.payment_method] = (countByPayment[s.payment_method] || 0) + 1;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Financial insights & trends</Text>

      {active.length === 0 ? (
        <EmptyState title="No data yet" description="Add subscriptions to see analytics." icon="bar-chart-outline" />
      ) : (
        <>
          {/* Key Metrics */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>KEY METRICS</Text>
          <View style={styles.metricsGrid}>
            <MetricCard icon="trending-up" iconBg="#4B9EFF" label="Monthly" value={formatCurrency(monthly, currency)} sub="total spend" />
            <MetricCard icon="calendar" iconBg="#A855F7" label="Yearly" value={formatCurrency(yearly, currency)} sub="projected" />
          </View>
          <View style={styles.metricsGrid}>
            <MetricCard icon="grid" iconBg="#2EC4A7" label="Avg / Service" value={formatCurrency(avgPerService, currency)} sub="per month" />
            <MetricCard icon="time" iconBg="#F5A623" label="Daily Cost" value={formatCurrency(daily, currency)} sub="per day" />
          </View>

          {/* Biggest Expense */}
          {biggest && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BIGGEST EXPENSE</Text>
              <View style={[styles.biggestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.biggestIcon, { backgroundColor: getCategoryInfo(biggest.category).color + "22" }]}>
                  <Ionicons name={getCategoryInfo(biggest.category).icon as never} size={28} color={getCategoryInfo(biggest.category).color} />
                </View>
                <View style={styles.biggestInfo}>
                  <Text style={[styles.biggestName, { color: colors.foreground }]}>{biggest.name}</Text>
                  <Text style={[styles.biggestMeta, { color: colors.mutedForeground }]}>
                    {getCategoryInfo(biggest.category).label} · {getCycleLabel(biggest.billing_cycle, biggest.custom_cycle_days)}
                  </Text>
                </View>
                <View style={styles.biggestRight}>
                  <Text style={[styles.biggestCost, { color: colors.foreground }]}>
                    {formatCurrency(getMonthlyEquivalent(biggest.cost, biggest.billing_cycle, biggest.custom_cycle_days), currency)}/mo
                  </Text>
                  <Text style={[styles.biggestYearly, { color: colors.mutedForeground }]}>
                    {formatCurrency(getMonthlyEquivalent(biggest.cost, biggest.billing_cycle, biggest.custom_cycle_days) * 12, currency)}/yr
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Spending by Category */}
          {catEntries.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SPENDING BY CATEGORY</Text>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.stackedBar}>
                  {catEntries.map(({ cat, pct }) => (
                    <View key={cat} style={[styles.barSeg, { width: `${pct}%`, backgroundColor: getCategoryInfo(cat).color }]} />
                  ))}
                </View>
                {catEntries.map(({ cat, val, pct }) => {
                  const info = getCategoryInfo(cat);
                  return (
                    <View key={cat} style={[styles.catRow, { borderTopColor: colors.border }]}>
                      <View style={[styles.dot, { backgroundColor: info.color }]} />
                      <Text style={[styles.catName, { color: colors.foreground }]}>{info.label}</Text>
                      <Text style={[styles.catPct, { color: colors.mutedForeground }]}>{pct.toFixed(0)}%</Text>
                      <Text style={[styles.catAmt, { color: info.color }]}>{formatCurrency(val, currency)}/mo</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Top by spend */}
          {rankedSubs.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TOP BY SPEND</Text>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {rankedSubs.map((sub, i) => {
                  const m = getMonthlyEquivalent(sub.cost, sub.billing_cycle, sub.custom_cycle_days);
                  const pct = monthly > 0 ? (m / monthly) * 100 : 0;
                  const info = getCategoryInfo(sub.category);
                  return (
                    <View key={sub.id} style={[styles.rankRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
                      <Text style={[styles.rankNum, { color: colors.mutedForeground }]}>#{i + 1}</Text>
                      <View style={[styles.rankIcon, { backgroundColor: info.color + "22" }]}>
                        <Ionicons name={info.icon as never} size={16} color={info.color} />
                      </View>
                      <View style={styles.rankInfo}>
                        <Text style={[styles.rankName, { color: colors.foreground }]}>{sub.name}</Text>
                        <View style={[styles.rankBar, { backgroundColor: colors.border }]}>
                          <View style={[styles.rankBarFill, { width: `${pct}%`, backgroundColor: info.color }]} />
                        </View>
                      </View>
                      <Text style={[styles.rankAmt, { color: info.color }]}>{formatCurrency(m, currency)}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* By Payment Method */}
          {payEntries.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BY PAYMENT METHOD</Text>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {payEntries.map(({ method, val }, i) => (
                  <View key={method} style={[styles.payRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
                    <View style={[styles.payIcon, { backgroundColor: "#4B9EFF22" }]}>
                      <Ionicons name="card" size={18} color="#4B9EFF" />
                    </View>
                    <Text style={[styles.payName, { color: colors.foreground }]}>{getPaymentMethodLabel(method as never)}</Text>
                    <Text style={[styles.payCount, { color: colors.mutedForeground }]}>
                      {countByPayment[method] || 0} service{(countByPayment[method] || 0) !== 1 ? "s" : ""}
                    </Text>
                    <Text style={[styles.payAmt, { color: colors.foreground }]}>{formatCurrency(val, currency)}/mo</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Cost-saving tip */}
          <View style={[styles.tipCard, { backgroundColor: "#F5A62322", borderColor: "#F5A62340" }]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color="#F5A623" />
              <Text style={[styles.tipLabel, { color: "#F5A623" }]}>COST-SAVING TIPS</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={[styles.tipNum, { backgroundColor: "#F5A62340" }]}>
                <Text style={styles.tipNumText}>1</Text>
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>
                Review yearly plans — switching monthly subscriptions to yearly can save up to 20% annually.
              </Text>
            </View>
          </View>

          {/* Subscription Status */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUBSCRIPTION STATUS</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: "#2EC4A7" }]} />
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>Active</Text>
              <View style={[styles.statusBar, { backgroundColor: colors.border }]}>
                <View style={[styles.statusBarFill, { width: `${subscriptions.length > 0 ? (active.length / subscriptions.length) * 100 : 0}%`, backgroundColor: "#2EC4A7" }]} />
              </View>
              <Text style={[styles.statusCount, { color: "#2EC4A7" }]}>{active.length}</Text>
              <Text style={[styles.statusAmt, { color: colors.foreground }]}>{formatCurrency(monthly, currency)}/mo</Text>
            </View>
            <View style={[styles.statusRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.mutedForeground }]} />
              <Text style={[styles.statusLabel, { color: colors.foreground }]}>Paused</Text>
              <View style={[styles.statusBar, { backgroundColor: colors.border }]}>
                <View style={[styles.statusBarFill, { width: "0%", backgroundColor: colors.mutedForeground }]} />
              </View>
              <Text style={[styles.statusCount, { color: colors.mutedForeground }]}>
                {subscriptions.filter((s) => !s.is_active).length}
              </Text>
              <Text style={[styles.statusAmt, { color: colors.mutedForeground }]}>—</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginTop: 8 },
  metricsGrid: { flexDirection: "row", gap: 12 },
  biggestCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  biggestIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  biggestInfo: { flex: 1, gap: 3 },
  biggestName: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  biggestMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  biggestRight: { alignItems: "flex-end", gap: 2 },
  biggestCost: { fontSize: 15, fontFamily: "Inter_700Bold" },
  biggestYearly: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  stackedBar: { flexDirection: "row", height: 6, gap: 2, margin: 16, borderRadius: 3, overflow: "hidden" },
  barSeg: { height: "100%", borderRadius: 3 },
  catRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  catPct: { fontSize: 13, fontFamily: "Inter_400Regular", width: 36, textAlign: "right" },
  catAmt: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 90, textAlign: "right" },
  rankRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  rankNum: { fontSize: 12, fontFamily: "Inter_600SemiBold", width: 20 },
  rankIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankInfo: { flex: 1, gap: 4 },
  rankName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  rankBar: { height: 3, borderRadius: 2, overflow: "hidden" },
  rankBarFill: { height: "100%", borderRadius: 2 },
  rankAmt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  payIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  payName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  payCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  payAmt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  tipItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipNum: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipNumText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#F5A623" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  statusRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { width: 50, fontSize: 14, fontFamily: "Inter_500Medium" },
  statusBar: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  statusBarFill: { height: "100%", borderRadius: 2 },
  statusCount: { fontSize: 14, fontFamily: "Inter_700Bold", width: 20, textAlign: "center" },
  statusAmt: { fontSize: 13, fontFamily: "Inter_500Medium", width: 90, textAlign: "right" },
});
