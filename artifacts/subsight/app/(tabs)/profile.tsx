import React, { useState } from "react";
import {
  Alert, Linking, Modal, Platform, ScrollView,
  StyleSheet, Switch, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { CURRENCIES } from "@/utils/currency";
import { getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";
import { saveSubscriptions } from "@/store/subscriptionStore";

const CONTACT_EMAIL = "h6577122@gmail.com";
const CONTACT_PHONE = "+923129584661";

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

/* ─── Legal modal shell ─────────────────────────────────────────────────── */
function LegalModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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
        <ScrollView
          contentContainerStyle={styles.legalContent}
          showsVerticalScrollIndicator={false}
        >
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

/* ─── Contact modal ─────────────────────────────────────────────────────── */
function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();

  const handleEmail = () => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Subsight Support`);
  const handlePhone = () => Linking.openURL(`tel:${CONTACT_PHONE}`);
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
          {/* Hero */}
          <View style={styles.contactHero}>
            <LinearGradient colors={["#1E3A6E", "#0F2040"]} style={styles.contactHeroIcon}>
              <Ionicons name="headset" size={34} color="#4B9EFF" />
            </LinearGradient>
            <Text style={[styles.contactHeroTitle, { color: colors.foreground }]}>We're here to help</Text>
            <Text style={[styles.contactHeroSub, { color: colors.mutedForeground }]}>
              Reach out via any channel below and we'll get back to you as soon as possible.
            </Text>
          </View>

          {/* Cards */}
          <TouchableOpacity
            onPress={handleEmail}
            style={[styles.contactCard, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.07)" }]}
            activeOpacity={0.8}
          >
            <View style={[styles.contactCardIcon, { backgroundColor: "#4B9EFF18", borderColor: "#4B9EFF30" }]}>
              <Ionicons name="mail" size={22} color="#4B9EFF" />
            </View>
            <View style={styles.contactCardText}>
              <Text style={[styles.contactCardLabel, { color: colors.mutedForeground }]}>EMAIL</Text>
              <Text style={[styles.contactCardValue, { color: colors.foreground }]}>{CONTACT_EMAIL}</Text>
              <Text style={[styles.contactCardHint, { color: colors.mutedForeground }]}>Tap to open email app</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePhone}
            style={[styles.contactCard, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.07)" }]}
            activeOpacity={0.8}
          >
            <View style={[styles.contactCardIcon, { backgroundColor: "#2EC4A718", borderColor: "#2EC4A730" }]}>
              <Ionicons name="call" size={22} color="#2EC4A7" />
            </View>
            <View style={styles.contactCardText}>
              <Text style={[styles.contactCardLabel, { color: colors.mutedForeground }]}>PHONE</Text>
              <Text style={[styles.contactCardValue, { color: colors.foreground }]}>{CONTACT_PHONE}</Text>
              <Text style={[styles.contactCardHint, { color: colors.mutedForeground }]}>Tap to call directly</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleWhatsApp}
            style={[styles.contactCard, { backgroundColor: "#141421", borderColor: "rgba(255,255,255,0.07)" }]}
            activeOpacity={0.8}
          >
            <View style={[styles.contactCardIcon, { backgroundColor: "#25D36618", borderColor: "#25D36630" }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <View style={styles.contactCardText}>
              <Text style={[styles.contactCardLabel, { color: colors.mutedForeground }]}>WHATSAPP</Text>
              <Text style={[styles.contactCardValue, { color: colors.foreground }]}>{CONTACT_PHONE}</Text>
              <Text style={[styles.contactCardHint, { color: colors.mutedForeground }]}>Tap to chat on WhatsApp</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Response time note */}
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

/* ─── Main screen ───────────────────────────────────────────────────────── */
export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, setCurrency, refresh } = useApp();

  const [currencyModal, setCurrencyModal]   = useState(false);
  const [privacyModal, setPrivacyModal]     = useState(false);
  const [termsModal, setTermsModal]         = useState(false);
  const [contactModal, setContactModal]     = useState(false);

  const [renewalReminders, setRenewalReminders] = useState(true);
  const [remind7, setRemind7] = useState(false);
  const [remind3, setRemind3] = useState(true);
  const [remind1, setRemind1] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly  = getTotalYearlyBurn(subscriptions);
  const active  = subscriptions.filter((s) => s.is_active).length;

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

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { val: String(subscriptions.length), label: "Total" },
          { val: formatCurrency(monthly, currency).replace(/\.00$/, ""), label: "Monthly" },
          { val: formatCurrency(yearly,  currency).replace(/\.00$/, ""), label: "Yearly" },
          { val: String(active), label: "Active" },
        ].map((s, i) => (
          <View key={i} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
        <SectionRow icon="cash-outline" iconBg="#4B9EFF" title="Currency" subtitle={currency} onPress={() => setCurrencyModal(true)} isLast />
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
          <Switch value={renewalReminders} onValueChange={setRenewalReminders} trackColor={{ true: "#4B9EFF", false: colors.border }} thumbColor="#FFF" />
        </View>
        {renewalReminders && (
          <>
            {[
              { label: "7 days before", sub: "Early heads-up reminder",  val: remind7, set: setRemind7, color: "#4B9EFF" },
              { label: "3 days before", sub: "Time to prepare payment",   val: remind3, set: setRemind3, color: "#F5A623" },
              { label: "1 day before",  sub: "Final payment alert",       val: remind1, set: setRemind1, color: "#F04848" },
            ].map(({ label, sub, val, set, color }) => (
              <View key={label} style={[styles.subRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.subNumBadge, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.subNumText, { color }]}>{label.split(" ")[0]}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{label}</Text>
                  <Text style={[styles.rowSub,   { color: colors.mutedForeground }]}>{sub}</Text>
                </View>
                <Switch value={val} onValueChange={set} trackColor={{ true: color, false: colors.border }} thumbColor="#FFF" />
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
          <Switch value={weeklyReport} onValueChange={setWeeklyReport} trackColor={{ true: "#4B9EFF", false: colors.border }} thumbColor="#FFF" />
        </View>
      </View>

      {/* Data */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DATA</Text>
        <SectionRow icon="download-outline" iconBg="#4B9EFF" title="Export as CSV"    subtitle="All subscriptions in spreadsheet format" onPress={() => Alert.alert("Export CSV", "CSV export is available in the published app.")} />
        <SectionRow icon="document-text-outline" iconBg="#4B9EFF" title="Export Summary" subtitle="Human-readable text report" onPress={() => Alert.alert("Export Summary", "Text summary export is available in the published app.")} isLast />
      </View>

      {/* Legal */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LEGAL & SUPPORT</Text>
        <SectionRow
          icon="shield-checkmark-outline"
          iconBg="#4B9EFF"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={() => setPrivacyModal(true)}
        />
        <SectionRow
          icon="document-outline"
          iconBg="#2EC4A7"
          title="Terms & Conditions"
          subtitle="Terms of use and your rights"
          onPress={() => setTermsModal(true)}
        />
        <SectionRow
          icon="headset-outline"
          iconBg="#F5A623"
          title="Contact Support"
          subtitle={`${CONTACT_EMAIL}  ·  ${CONTACT_PHONE}`}
          onPress={() => setContactModal(true)}
          isLast
        />
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
          isLast
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
          Advanced features and analytics will be available in future updates.
        </Text>
        {["Cloud sync across all devices", "PDF export with full formatting", "Unlimited subscription history", "Advanced spending analytics"].map((f) => (
          <View key={f} style={styles.premiumFeature}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#A855F7" />
            <Text style={[styles.premiumFeatureText, { color: colors.mutedForeground }]}>{f}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Subsight · Version 1.0.0</Text>

      {/* ── MODALS ── */}

      {/* Currency picker */}
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
                style={[styles.currencyRow, { borderBottomColor: colors.border, backgroundColor: currency === cur.code ? colors.primary + "12" : "transparent" }]}
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
          {`Subsight ("we", "our", or "the app") is committed to protecting your privacy. This Privacy Policy explains how your information is collected, used, and safeguarded when you use our mobile application.\n\nSubsight is a local-only subscription tracker. All data you enter is stored exclusively on your device using AsyncStorage and is never transmitted to our servers or any third party.`}
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          {`We do not collect any personal data. All subscription information you enter — including names, costs, billing dates, and categories — is stored only on your device.\n\nWe do not collect:\n• Your name, email, or contact details\n• Payment card or bank information\n• Location data\n• Usage analytics or crash reports\n• Any data transmitted over the internet`}
        </LegalSection>

        <LegalSection title="3. Data Storage">
          {`All app data is stored locally on your device via AsyncStorage. Clearing the app's storage or uninstalling the app will permanently delete all your data. We have no ability to recover deleted data as we never receive or store it.`}
        </LegalSection>

        <LegalSection title="4. Third-Party Services">
          {`Subsight does not integrate with any third-party analytics, advertising, or tracking services. No data leaves your device.`}
        </LegalSection>

        <LegalSection title="5. Children's Privacy">
          {`Subsight is not directed at children under 13. We do not knowingly collect information from children.`}
        </LegalSection>

        <LegalSection title="6. Changes to This Policy">
          {`We may update this Privacy Policy from time to time. Any changes will be reflected with an updated "Last updated" date. Continued use of the app after changes constitutes acceptance of the revised policy.`}
        </LegalSection>

        <LegalSection title="7. Contact Us">
          {`If you have questions about this Privacy Policy, please contact us:\n\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`}
        </LegalSection>
      </LegalModal>

      {/* Terms & Conditions */}
      <LegalModal visible={termsModal} title="Terms & Conditions" onClose={() => setTermsModal(false)}>
        <Text style={styles.legalDate}>Last updated: April 12, 2026</Text>

        <LegalSection title="1. Acceptance of Terms">
          {`By downloading or using Subsight, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the app.`}
        </LegalSection>

        <LegalSection title="2. Use of the App">
          {`Subsight is provided for personal, non-commercial use. You agree to use the app only for its intended purpose — tracking your personal subscriptions and recurring expenses.\n\nYou must not:\n• Reverse-engineer or decompile the app\n• Use the app for any unlawful purpose\n• Attempt to gain unauthorized access to any systems`}
        </LegalSection>

        <LegalSection title="3. Your Data & Responsibility">
          {`All data entered into Subsight is stored locally on your device. You are solely responsible for the accuracy of the information you enter and for maintaining backups of your data.\n\nWe are not responsible for any data loss resulting from device failure, app deletion, or OS updates.`}
        </LegalSection>

        <LegalSection title="4. Disclaimer of Warranties">
          {`Subsight is provided "as is" without warranties of any kind, express or implied. We do not warrant that the app will be error-free, uninterrupted, or free of viruses or other harmful components.\n\nThe financial information displayed in the app is based solely on the data you enter and is provided for informational purposes only. It does not constitute financial advice.`}
        </LegalSection>

        <LegalSection title="5. Limitation of Liability">
          {`To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the app.`}
        </LegalSection>

        <LegalSection title="6. Intellectual Property">
          {`All content, design, and code within Subsight are the intellectual property of the app's developer. You may not reproduce, distribute, or create derivative works without prior written consent.`}
        </LegalSection>

        <LegalSection title="7. Changes to Terms">
          {`We reserve the right to modify these Terms at any time. Continued use of the app following any changes constitutes acceptance of the new Terms.`}
        </LegalSection>

        <LegalSection title="8. Contact">
          {`For questions regarding these Terms, please contact:\n\nEmail: ${CONTACT_EMAIL}\nPhone: ${CONTACT_PHONE}`}
        </LegalSection>
      </LegalModal>

      {/* Contact */}
      <ContactModal visible={contactModal} onClose={() => setContactModal(false)} />
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
  sectionTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
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

  /* Modal shell */
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Legal content */
  legalContent: { padding: 20, gap: 0, paddingBottom: 60 },
  legalDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    fontStyle: "italic",
  },
  legalSection: { marginBottom: 24 },
  legalSectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  legalBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },

  /* Contact content */
  contactContent: { padding: 20, gap: 12, paddingBottom: 60 },
  contactHero: { alignItems: "center", paddingVertical: 24, gap: 12 },
  contactHeroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(75,158,255,0.3)",
  },
  contactHeroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  contactHeroSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  contactCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  contactCardText: { flex: 1, gap: 3 },
  contactCardLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  contactCardValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contactCardHint: { fontSize: 11, fontFamily: "Inter_400Regular" },

  responseBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  responseText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },

  /* Currency picker */
  currencyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  currencySymbol: { fontSize: 18, fontFamily: "Inter_700Bold", width: 30, textAlign: "center" },
  currencyCode: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  currencyName: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
