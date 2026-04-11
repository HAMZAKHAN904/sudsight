import React, { useState } from "react";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { CURRENCIES } from "@/utils/currency";
import { getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { saveSubscriptions } from "@/store/subscriptionStore";

interface SectionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

function SectionRow({ icon, iconBg, title, subtitle, onPress, destructive, rightElement }: SectionRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color="#FFF" />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: destructive ? colors.destructive : colors.foreground }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, setCurrency, refresh } = useApp();

  const [currencyModal, setCurrencyModal] = useState(false);
  const [renewalReminders, setRenewalReminders] = useState(true);
  const [remind7, setRemind7] = useState(false);
  const [remind3, setRemind3] = useState(true);
  const [remind1, setRemind1] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);
  const active = subscriptions.filter((s) => s.is_active).length;

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your subscriptions. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await saveSubscriptions([]);
            await refresh();
          },
        },
      ]
    );
  };

  const handleExportCSV = () => {
    Alert.alert("Export CSV", "CSV export would be available in the published app.");
  };

  const handleExportSummary = () => {
    Alert.alert("Export Summary", "Text summary export would be available in the published app.");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Manage your preferences</Text>

      {/* App summary card */}
      <View style={[styles.appCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.appCardLeft}>
          <View style={[styles.appIcon, { backgroundColor: "#4B9EFF22" }]}>
            <Ionicons name="card" size={24} color="#4B9EFF" />
          </View>
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Subsight</Text>
            <Text style={[styles.appMeta, { color: colors.mutedForeground }]}>
              {active} active · {formatCurrency(monthly, currency)}/mo
            </Text>
          </View>
        </View>
        <View style={[styles.freeBadge, { backgroundColor: "#2EC4A722" }]}>
          <Ionicons name="checkmark-circle" size={13} color="#2EC4A7" />
          <Text style={[styles.freeText, { color: "#2EC4A7" }]}>All Free</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { val: String(subscriptions.length), label: "Total" },
          { val: formatCurrency(monthly, currency).replace(/\.00$/, ""), label: "Monthly" },
          { val: formatCurrency(yearly, currency).replace(/\.00$/, ""), label: "Yearly" },
          { val: String(active), label: "Active" },
        ].map((s, i) => (
          <View
            key={i}
            style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.statVal, { color: i === 2 ? "#A855F7" : i === 1 ? "#4B9EFF" : colors.foreground }]}>
              {s.val}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Currency */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DISPLAY</Text>
        <SectionRow
          icon="cash-outline"
          iconBg="#4B9EFF"
          title="Currency"
          subtitle={currency}
          onPress={() => setCurrencyModal(true)}
        />
      </View>

      {/* Notifications */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>NOTIFICATIONS</Text>

        <View style={[styles.notifRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.rowIcon, { backgroundColor: "#4B9EFF" }]}>
            <Ionicons name="notifications" size={16} color="#FFF" />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>Renewal Reminders</Text>
            <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
              {renewalReminders ? `${[remind7, remind3, remind1].filter(Boolean).length} reminders scheduled` : "Disabled"}
            </Text>
          </View>
          <Switch
            value={renewalReminders}
            onValueChange={setRenewalReminders}
            trackColor={{ true: "#4B9EFF", false: colors.border }}
            thumbColor="#FFF"
          />
        </View>

        {renewalReminders && (
          <>
            {[
              { label: "7 days before", sub: "Early heads-up reminder", val: remind7, set: setRemind7, color: "#4B9EFF" },
              { label: "3 days before", sub: "Time to prepare payment", val: remind3, set: setRemind3, color: "#F5A623" },
              { label: "1 day before",  sub: "Final payment alert",     val: remind1, set: setRemind1, color: "#F04848" },
            ].map(({ label, sub, val, set, color }) => (
              <View key={label} style={[styles.subRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.subNumBadge, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.subNumText, { color }]}>{label.split(" ")[0]}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{label}</Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text>
                </View>
                <Switch
                  value={val}
                  onValueChange={set}
                  trackColor={{ true: color, false: colors.border }}
                  thumbColor="#FFF"
                />
              </View>
            ))}
          </>
        )}

        <View style={[styles.notifRow, { borderBottomColor: "transparent" }]}>
          <View style={[styles.rowIcon, { backgroundColor: "#4B9EFF" }]}>
            <Ionicons name="bar-chart" size={16} color="#FFF" />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>Weekly Spending Report</Text>
            <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>Summary every Monday morning</Text>
          </View>
          <Switch
            value={weeklyReport}
            onValueChange={setWeeklyReport}
            trackColor={{ true: "#4B9EFF", false: colors.border }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* Data */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DATA</Text>
        <SectionRow icon="download-outline" iconBg="#4B9EFF" title="Export as CSV" subtitle="All subscriptions in spreadsheet format" onPress={handleExportCSV} />
        <SectionRow icon="document-text-outline" iconBg="#4B9EFF" title="Export Summary" subtitle="Human-readable text report" onPress={handleExportSummary} />
      </View>

      {/* Legal */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LEGAL</Text>
        <SectionRow icon="shield-checkmark-outline" iconBg="#4B9EFF" title="Privacy Policy" subtitle="How we handle your data" onPress={() => {}} />
        <SectionRow icon="document-outline" iconBg="#4B9EFF" title="Terms & Conditions" subtitle="Terms of use and your rights" onPress={() => {}} />
        <SectionRow icon="mail-outline" iconBg="#4B9EFF" title="Contact Support" subtitle="Get help" onPress={() => {}} />
      </View>

      {/* Account */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <SectionRow
          icon="trash-outline"
          iconBg="#F04848"
          title="Clear All Data"
          subtitle="Permanently delete all subscriptions"
          onPress={handleClearData}
          destructive
        />
      </View>

      {/* Premium Card */}
      <View style={[styles.premiumCard, { backgroundColor: "#1A1040", borderColor: "#A855F730" }]}>
        <View style={styles.premiumHeader}>
          <View style={[styles.premiumIcon, { backgroundColor: "#A855F722" }]}>
            <Ionicons name="star" size={22} color="#F5A623" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.premiumTitle, { color: colors.foreground }]}>Premium Plan</Text>
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={11} color="#A855F7" />
              <Text style={[styles.comingSoonText]}>Coming Soon</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>
          Advanced features and analytics will be available in future updates.
        </Text>
        {[
          "Cloud sync across all devices",
          "PDF export with full formatting",
          "Unlimited subscription history",
          "Advanced spending analytics",
        ].map((f) => (
          <View key={f} style={styles.premiumFeature}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#A855F7" />
            <Text style={[styles.premiumFeatureText, { color: colors.mutedForeground }]}>{f}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Subsight · Version 1.0.0</Text>

      {/* Currency Modal */}
      <Modal
        visible={currencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCurrencyModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => setCurrencyModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur.code}
                onPress={async () => { await setCurrency(cur.code); setCurrencyModal(false); }}
                style={[
                  styles.currencyRow,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: currency === cur.code ? colors.primary + "12" : "transparent",
                  },
                ]}
              >
                <Text style={[styles.currencySymbol, { color: colors.primary }]}>{cur.symbol}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyCode, { color: colors.foreground }]}>{cur.code}</Text>
                  <Text style={[styles.currencyName, { color: colors.mutedForeground }]}>{cur.name}</Text>
                </View>
                {currency === cur.code && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 18, gap: 14 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  appCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, padding: 16 },
  appCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  appIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  appName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  appMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  freeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  freeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, gap: 12 },
  notifRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, gap: 12 },
  subRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, gap: 12, paddingLeft: 28 },
  subNumBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  subNumText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  premiumCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 12 },
  premiumHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  premiumIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  premiumTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  comingSoonBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  comingSoonText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#A855F7" },
  premiumDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  premiumFeature: { flexDirection: "row", alignItems: "center", gap: 8 },
  premiumFeatureText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  modal: { flex: 1, paddingTop: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold" },
  currencyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  currencySymbol: { fontSize: 18, fontFamily: "Inter_700Bold", width: 30, textAlign: "center" },
  currencyCode: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  currencyName: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
