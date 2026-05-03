import React, { useEffect, useState } from "react";
import {
  Alert, Linking, Modal, Platform, ScrollView, Share,
  StyleSheet, Switch, Text, TouchableOpacity, View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { CURRENCIES, formatCurrency, getCurrencySymbol } from "@/utils/currency";
import {
  getTotalMonthlyBurn, getTotalYearlyBurn,
  getMonthlyEquivalent, getCycleLabel,
} from "@/utils/calculations";
import { saveSubscriptions } from "@/store/subscriptionStore";

const CONTACT_EMAIL = "h6577122@gmail.com";
const CONTACT_PHONE = "+923129584661";
const NOTIF_SETTINGS_KEY = "subsight_notif_settings";

interface NotifSettings {
  renewalReminders: boolean;
  remind7: boolean;
  remind3: boolean;
  remind1: boolean;
  weeklyReport: boolean;
}

const DEFAULT_NOTIF: NotifSettings = {
  renewalReminders: true,
  remind7: false,
  remind3: true,
  remind1: false,
  weeklyReport: false,
};

interface SectionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

function SectionRow({ icon, iconBg, title, subtitle, onPress, destructive, rightElement, isLast }: SectionRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
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

function LegalModal({
  visible, title, onClose, children,
}: {
  visible: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.legalContent} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

function LegalSection({ title, children }: { title: string; children: string }) {
  const colors = useColors();
  return (
    <View style={styles.legalSection}>
      <Text style={[styles.legalSectionTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.legalBody, { color: colors.mutedForeground }]}>{children}</Text>
    </View>
  );
}

function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const handleEmail    = () => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Subsight Support`);
  const handlePhone    = () => Linking.openURL(`tel:${CONTACT_PHONE}`);
  const handleWhatsApp = () => Linking.openURL(`https://wa.me/${CONTACT_PHONE.replace("+", "")}`);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Contact Us</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.contactContent} showsVerticalScrollIndicator={false}>
          <View style={styles.contactHero}>
            <LinearGradient colors={["#1E3A6E", "#0F2040"]} style={styles.contactHeroIcon}>
              <Ionicons name="headset" size={34} color="#4B9EFF" />
            </LinearGradient>
            <Text style={[styles.contactHeroTitle, { color: colors.foreground }]}>We're here to help</Text>
            <Text style={[styles.contactHeroSub, { color: colors.mutedForeground }]}>
              Reach out via any channel below and we'll get back to you as soon as possible.
            </Text>
          </View>

          {[
            { onPress: handleEmail, bg: "#4B9EFF18", border: "#4B9EFF30", icon: "mail" as const, color: "#4B9EFF", label: "EMAIL", value: CONTACT_EMAIL, hint: "Tap to open email app" },
            { onPress: handlePhone, bg: "#2EC4A718", border: "#2EC4A730", icon: "call" as const, color: "#2EC4A7", label: "PHONE", value: CONTACT_PHONE, hint: "Tap to call directly" },
            { onPress: handleWhatsApp, bg: "#25D36618", border: "#25D36630", icon: "logo-whatsapp" as const, color: "#25D366", label: "WHATSAPP", value: CONTACT_PHONE, hint: "Tap to chat on WhatsApp" },
          ].map(({ onPress, bg, border, icon, color, label, value, hint }) => (
            <TouchableOpacity
              key={label}
              onPress={onPress}
              style={[styles.contactCard, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.07)" }]}
              activeOpacity={0.8}
            >
              <View style={[styles.contactCardIcon, { backgroundColor: bg, borderColor: border }]}>
                <Ionicons name={icon} size={22} color={color} />
              </View>
              <View style={styles.contactCardText}>
                <Text style={[styles.contactCardLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.contactCardValue, { color: colors.foreground }]}>{value}</Text>
                <Text style={[styles.contactCardHint,  { color: colors.mutedForeground }]}>{hint}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}

          <View style={[styles.responseBox, { backgroundColor: "#141421", borderColor: "rgba(75,158,255,0.15)" }]}>
            <Ionicons name="time-outline" size={16} color="#4B9EFF" />
            <Text style={[styles.responseText, { color: colors.mutedForeground }]}>
              Typical response time is within 24 hours on business days.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, setCurrency, refresh } = useApp();

  const [currencyModal, setCurrencyModal] = useState(false);
  const [privacyModal,  setPrivacyModal]  = useState(false);
  const [termsModal,    setTermsModal]    = useState(false);
  const [contactModal,  setContactModal]  = useState(false);

  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const monthly  = getTotalMonthlyBurn(subscriptions);
  const yearly   = getTotalYearlyBurn(subscriptions);
  const active   = subscriptions.filter((s) => s.is_active).length;

  // Load persisted notification settings on mount
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_SETTINGS_KEY).then((raw) => {
      if (raw) {
        try { setNotif({ ...DEFAULT_NOTIF, ...JSON.parse(raw) }); } catch {}
      }
    });
  }, []);

  const updateNotif = (patch: Partial<NotifSettings>) => {
    const next = { ...notif, ...patch };
    setNotif(next);
    AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(next));
  };

  // ── Real CSV export using native Share sheet ──────────────────────────────
  const handleExportCSV = async () => {
    if (subscriptions.length === 0) {
      Alert.alert("No Data", "Add some subscriptions first.");
      return;
    }
    const headers = "Name,Cost,Billing Cycle,Category,Status,Payment Method,Start Date,Monthly Equiv";
    const rows = subscriptions.map((s) => {
      const m = getMonthlyEquivalent(s.cost, s.billing_cycle, s.custom_cycle_days);
      const safeStr = (v: string) => `"${v.replace(/"/g, '""')}"`;
      return [
        safeStr(s.name),
        s.cost.toFixed(2),
        s.billing_cycle,
        safeStr(s.category),
        s.is_active ? "Active" : "Paused",
        s.payment_method,
        s.start_date,
        m.toFixed(2),
      ].join(",");
    });
    const csv = `${headers}\n${rows.join("\n")}`;
    try {
      await Share.share({ message: csv, title: "Subsight Subscriptions" });
    } catch {
      Alert.alert("Error", "Could not share the export.");
    }
  };

  // ── Real text summary export ──────────────────────────────────────────────
  const handleExportSummary = async () => {
    if (subscriptions.length === 0) {
      Alert.alert("No Data", "Add some subscriptions first.");
      return;
    }
    const sym = getCurrencySymbol(currency);
    const line = "─".repeat(38);
    let text = `SUBSIGHT — SPENDING SUMMARY\n`;
    text += `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`;
    text += `${line}\n\n`;
    text += `Monthly Total:   ${formatCurrency(monthly, currency)}\n`;
    text += `Yearly Total:    ${formatCurrency(yearly, currency)}\n`;
    text += `Active Services: ${active} of ${subscriptions.length}\n\n`;
    text += `${line}\nSUBSCRIPTIONS\n${line}\n`;
    subscriptions.forEach((s) => {
      const m = getMonthlyEquivalent(s.cost, s.billing_cycle, s.custom_cycle_days);
      const cycleStr = getCycleLabel(s.billing_cycle, s.custom_cycle_days);
      text += `\n• ${s.name}\n`;
      text += `  ${sym}${s.cost.toFixed(2)}/${cycleStr}`;
      if (s.billing_cycle !== "monthly") text += `  (${formatCurrency(m, currency)}/mo)`;
      text += `\n  ${s.is_active ? "Active" : "Paused"} · ${s.category}\n`;
    });
    try {
      await Share.share({ message: text, title: "Subsight Summary" });
    } catch {
      Alert.alert("Error", "Could not share the summary.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your subscriptions. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => { await saveSubscriptions([]); await refresh(); },
        },
      ]
    );
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
      <Text style={[styles.title,    { color: colors.foreground }]}>Settings</Text>
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

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { val: String(subscriptions.length),                             label: "Total",   accent: colors.foreground },
          { val: formatCurrency(monthly, currency).replace(/\.00$/, ""),  label: "Monthly", accent: "#4B9EFF" },
          { val: formatCurrency(yearly,  currency).replace(/\.00$/, ""),  label: "Yearly",  accent: "#A855F7" },
          { val: String(active),                                           label: "Active",  accent: "#2EC4A7" },
        ].map((s, i) => (
          <View key={i} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal,   { color: s.accent }]}>{s.val}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Display */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DISPLAY</Text>
        <SectionRow
          icon="cash-outline" iconBg="#4B9EFF"
          title="Currency" subtitle={currency}
          onPress={() => setCurrencyModal(true)} isLast
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
              {notif.renewalReminders
                ? `${[notif.remind7, notif.remind3, notif.remind1].filter(Boolean).length} reminder${[notif.remind7, notif.remind3, notif.remind1].filter(Boolean).length !== 1 ? "s" : ""} active`
                : "Disabled"}
            </Text>
          </View>
          <Switch
            value={notif.renewalReminders}
            onValueChange={(v) => updateNotif({ renewalReminders: v })}
            trackColor={{ true: "#4B9EFF", false: colors.border }}
            thumbColor="#FFF"
          />
        </View>

        {notif.renewalReminders && (
          <>
            {[
              { label: "7 days before", sub: "Early heads-up reminder",  key: "remind7" as const, val: notif.remind7, color: "#4B9EFF" },
              { label: "3 days before", sub: "Time to prepare payment",  key: "remind3" as const, val: notif.remind3, color: "#F5A623" },
              { label: "1 day before",  sub: "Final payment alert",      key: "remind1" as const, val: notif.remind1, color: "#F04848" },
            ].map(({ label, sub, key, val, color }) => (
              <View key={key} style={[styles.subRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.subNumBadge, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.subNumText, { color }]}>{label.split(" ")[0]}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{label}</Text>
                  <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>{sub}</Text>
                </View>
                <Switch
                  value={val}
                  onValueChange={(v) => updateNotif({ [key]: v })}
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
            <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>Summary every Monday morning</Text>
          </View>
          <Switch
            value={notif.weeklyReport}
            onValueChange={(v) => updateNotif({ weeklyReport: v })}
            trackColor={{ true: "#4B9EFF", false: colors.border }}
            thumbColor="#FFF"
          />
        </View>
      </View>

      {/* Data — real exports */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DATA</Text>
        <SectionRow
          icon="download-outline" iconBg="#4B9EFF"
          title="Export as CSV"
          subtitle="All subscriptions in spreadsheet format"
          onPress={handleExportCSV}
        />
        <SectionRow
          icon="document-text-outline" iconBg="#2EC4A7"
          title="Export Summary"
          subtitle="Human-readable spending report"
          onPress={handleExportSummary}
          isLast
        />
      </View>

      {/* Legal & Support */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LEGAL & SUPPORT</Text>
        <SectionRow icon="shield-checkmark-outline" iconBg="#4B9EFF"  title="Privacy Policy"    subtitle="How we handle your data"          onPress={() => setPrivacyModal(true)} />
        <SectionRow icon="document-outline"         iconBg="#2EC4A7"  title="Terms & Conditions" subtitle="Terms of use and your rights"     onPress={() => setTermsModal(true)} />
        <SectionRow icon="headset-outline"          iconBg="#F5A623"  title="Contact Support"    subtitle={`${CONTACT_EMAIL}  ·  ${CONTACT_PHONE}`} onPress={() => setContactModal(true)} isLast />
      </View>

      {/* Account */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <SectionRow
          icon="trash-outline" iconBg="#F04848"
          title="Clear All Data"
          subtitle="Permanently delete all subscriptions"
          onPress={handleClearData}
          destructive isLast
        />
      </View>

      {/* Premium card */}
      <View style={[styles.premiumCard, { backgroundColor: "#1A1040", borderColor: "#A855F730" }]}>
        <View style={styles.premiumHeader}>
          <View style={[styles.premiumIcon, { backgroundColor: "#A855F722" }]}>
            <Ionicons name="star" size={22} color="#F5A623" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.premiumTitle, { color: "#F0F0F8" }]}>Premium Plan</Text>
            <View style={styles.comingSoonBadge}>
              <Ionicons name="time-outline" size={11} color="#A855F7" />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>
          Advanced features will be available in future updates.
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

      {/* ── MODALS ── */}

      {/* Currency Picker */}
      <Modal visible={currencyModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCurrencyModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Currency</Text>
            <TouchableOpacity onPress={() => setCurrencyModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur.code}
                onPress={async () => { await setCurrency(cur.code); setCurrencyModal(false); }}
                style={[styles.currencyRow, {
                  borderBottomColor: colors.border,
                  backgroundColor: currency === cur.code ? colors.primary + "12" : "transparent",
                }]}
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

      {/* Privacy Policy */}
      <LegalModal visible={privacyModal} title="Privacy Policy" onClose={() => setPrivacyModal(false)}>
        <Text style={styles.legalDate}>Last updated: April 12, 2026</Text>
        <LegalSection title="1. Overview">
          {`Subsight ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and safeguarded.\n\nSubsight is a local-only subscription tracker. All data is stored exclusively on your device using AsyncStorage and is never transmitted to our servers or any third party.`}
        </LegalSection>
        <LegalSection title="2. Information We Collect">
          {`We do not collect any personal data. All subscription information you enter is stored only on your device.\n\nWe do not collect:\n• Your name, email, or contact details\n• Payment card or bank information\n• Location data\n• Usage analytics or crash reports\n• Any data transmitted over the internet`}
        </LegalSection>
        <LegalSection title="3. Data Storage">
          {`All app data is stored locally on your device via AsyncStorage. Uninstalling the app will permanently delete all your data. We have no ability to recover it as we never receive or store it.`}
        </LegalSection>
        <LegalSection title="4. Third-Party Services">
          {`Subsight does not integrate with any third-party analytics, advertising, or tracking services. No data leaves your device.`}
        </LegalSection>
        <LegalSection title="5. Children's Privacy">
          {`Subsight is not directed at children under 13. We do not knowingly collect information from children.`}
        </LegalSection>
        <LegalSection title="6. Changes to This Policy">
          {`We may update this Privacy Policy from time to time. Changes are reflected with an updated "Last updated" date. Continued use of the app constitutes acceptance of the revised policy.`}
        </LegalSection>
        <LegalSection title="7. Contact Us">
          {`If you have questions about this Privacy Policy:\n\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`}
        </LegalSection>
      </LegalModal>

      {/* Terms & Conditions */}
      <LegalModal visible={termsModal} title="Terms & Conditions" onClose={() => setTermsModal(false)}>
        <Text style={styles.legalDate}>Last updated: April 12, 2026</Text>
        <LegalSection title="1. Acceptance of Terms">
          {`By downloading or using Subsight, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.`}
        </LegalSection>
        <LegalSection title="2. Use of the App">
          {`Subsight is provided for personal, non-commercial use. You agree to use the app only for its intended purpose — tracking your personal subscriptions.\n\nYou must not:\n• Reverse-engineer or decompile the app\n• Use the app for any unlawful purpose\n• Attempt to gain unauthorized access to any systems`}
        </LegalSection>
        <LegalSection title="3. Your Data & Responsibility">
          {`All data you enter into Subsight is stored locally on your device. You are solely responsible for the accuracy of your data. We are not liable for any financial decisions made based on information displayed in the app.`}
        </LegalSection>
        <LegalSection title="4. Intellectual Property">
          {`All content, design, code, and trademarks within Subsight are the property of the developer and are protected by applicable intellectual property laws.`}
        </LegalSection>
        <LegalSection title="5. Disclaimer of Warranties">
          {`The app is provided "as is" without warranty of any kind. We do not guarantee that the app will be error-free or uninterrupted.`}
        </LegalSection>
        <LegalSection title="6. Limitation of Liability">
          {`To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app.`}
        </LegalSection>
        <LegalSection title="7. Changes to Terms">
          {`We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the updated terms.`}
        </LegalSection>
        <LegalSection title="8. Contact Us">
          {`For questions about these Terms:\n\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`}
        </LegalSection>
      </LegalModal>

      <ContactModal visible={contactModal} onClose={() => setContactModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { paddingHorizontal: 18, gap: 12 },
  title:     { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 2 },
  subtitle:  { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 8 },

  appCard:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, padding: 16 },
  appCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  appIcon:     { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  appName:     { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  appMeta:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  freeBadge:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  freeText:    { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  statsRow: { flexDirection: "row", gap: 8 },
  statBox:  { flex: 1, alignItems: "center", borderRadius: 12, borderWidth: 1, paddingVertical: 12, gap: 3 },
  statVal:  { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLabel:{ fontSize: 10, fontFamily: "Inter_400Regular" },

  section:      { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },

  row:     { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowTitle:{ fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  notifRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14, borderBottomWidth: 1 },
  subRow:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, paddingLeft: 62, gap: 14, borderBottomWidth: 1 },
  subNumBadge:{ width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  subNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  premiumCard:    { borderRadius: 16, borderWidth: 1, padding: 18, gap: 10 },
  premiumHeader:  { flexDirection: "row", alignItems: "center", gap: 12 },
  premiumIcon:    { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  premiumTitle:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  comingSoonBadge:{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  comingSoonText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#A855F7", letterSpacing: 0.5 },
  premiumDesc:    { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  premiumFeature: { flexDirection: "row", alignItems: "center", gap: 8 },
  premiumFeatureText:{ fontSize: 13, fontFamily: "Inter_400Regular" },

  footer: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 8 },

  modal:        { flex: 1 },
  modalHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottomWidth: 1 },
  modalTitle:   { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  closeBtn:     { padding: 4 },
  legalContent: { padding: 20, gap: 4 },
  legalDate:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", marginBottom: 12 },
  legalSection: { gap: 6, marginBottom: 14 },
  legalSectionTitle:{ fontSize: 15, fontFamily: "Inter_600SemiBold" },
  legalBody:    { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },

  contactContent:  { padding: 20, gap: 14 },
  contactHero:     { alignItems: "center", paddingVertical: 20, gap: 12 },
  contactHeroIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  contactHeroTitle:{ fontSize: 22, fontFamily: "Inter_700Bold" },
  contactHeroSub:  { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },

  contactCard:     { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  contactCardIcon: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  contactCardText: { flex: 1, gap: 2 },
  contactCardLabel:{ fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  contactCardValue:{ fontSize: 15, fontFamily: "Inter_500Medium" },
  contactCardHint: { fontSize: 12, fontFamily: "Inter_400Regular" },

  responseBox:  { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  responseText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },

  currencyRow:    { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, gap: 14 },
  currencySymbol: { fontSize: 20, fontFamily: "Inter_700Bold", width: 36, textAlign: "center" },
  currencyCode:   { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  currencyName:   { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
