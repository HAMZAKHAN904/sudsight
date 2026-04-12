import React, { useCallback, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BillingCycle, PaymentMethod, Subscription } from "@/utils/calculations";
import { CATEGORIES, CategoryId } from "@/components/CategoryIcon";
import { Ionicons } from "@expo/vector-icons";
import { useInterstitialAd } from "@/hooks/useInterstitialAd";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface PopularService {
  name: string;
  price: number;
  category: CategoryId;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const POPULAR_SERVICES: PopularService[] = [
  { name: "Netflix",        price: 15.99, category: "entertainment", icon: "film",             color: "#E50914" },
  { name: "Spotify",        price: 9.99,  category: "music",         icon: "musical-notes",    color: "#1DB954" },
  { name: "YouTube",        price: 13.99, category: "entertainment", icon: "logo-youtube",     color: "#FF0000" },
  { name: "Disney+",        price: 10.99, category: "entertainment", icon: "tv",               color: "#0063E5" },
  { name: "Apple TV+",      price: 8.99,  category: "entertainment", icon: "logo-apple",       color: "#555555" },
  { name: "Notion",         price: 8.00,  category: "productivity",  icon: "document-text",    color: "#000000" },
  { name: "Slack",          price: 7.25,  category: "productivity",  icon: "chatbubbles",      color: "#4A154B" },
  { name: "Dropbox",        price: 11.99, category: "cloud",         icon: "cloud-upload",     color: "#0061FF" },
  { name: "Adobe CC",       price: 54.99, category: "productivity",  icon: "color-palette",    color: "#FF0000" },
  { name: "GitHub",         price: 4.00,  category: "productivity",  icon: "logo-github",      color: "#171515" },
  { name: "Duolingo",       price: 6.99,  category: "education",     icon: "school",           color: "#58CC02" },
  { name: "Coursera",       price: 49.00, category: "education",     icon: "book",             color: "#0056D2" },
  { name: "LinkedIn",       price: 29.99, category: "business",      icon: "business",         color: "#0A66C2" },
  { name: "Zoom",           price: 14.99, category: "business",      icon: "videocam",         color: "#2D8CFF" },
  { name: "Salesforce",     price: 25.00, category: "business",      icon: "stats-chart",      color: "#00A1E0" },
];

const BILLING_CYCLES: { label: string; value: BillingCycle }[] = [
  { label: "Weekly",   value: "weekly" },
  { label: "Monthly",  value: "monthly" },
  { label: "Yearly",   value: "yearly" },
  { label: "Custom",   value: "custom" },
];

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "Credit Card", value: "credit_card" },
  { label: "Debit Card",  value: "debit_card" },
  { label: "PayPal",      value: "paypal" },
  { label: "Apple Pay",   value: "apple_pay" },
  { label: "Google Pay",  value: "google_pay" },
  { label: "Other",       value: "other" },
];

function ServiceTile({
  service,
  onPress,
}: {
  service: PopularService;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.tileIcon, { backgroundColor: service.color + "22" }]}>
        <Ionicons name={service.icon} size={28} color={service.color} />
      </View>
      <Text style={[styles.tileName, { color: colors.foreground }]} numberOfLines={1}>
        {service.name}
      </Text>
      <Text style={[styles.tilePrice, { color: colors.mutedForeground }]}>
        ${service.price}/mo
      </Text>
    </TouchableOpacity>
  );
}

interface FormState {
  name: string;
  cost: string;
  cycle: BillingCycle;
  customDays: string;
  category: CategoryId;
  payment: PaymentMethod;
  daysUntilRenewal: string;
  notes: string;
}

function DetailsForm({
  initial,
  onBack,
  onSave,
}: {
  initial: Partial<FormState>;
  onBack?: () => void;
  onSave: (form: FormState) => void;
}) {
  const colors = useColors();
  const [form, setForm] = useState<FormState>({
    name: initial.name ?? "",
    cost: initial.cost ?? "",
    cycle: initial.cycle ?? "monthly",
    customDays: initial.customDays ?? "30",
    category: initial.category ?? "other",
    payment: initial.payment ?? "credit_card",
    daysUntilRenewal: initial.daysUntilRenewal ?? "30",
    notes: initial.notes ?? "",
  });

  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + (parseInt(form.daysUntilRenewal, 10) || 30));
  const renewalStr = renewalDate.toISOString().split("T")[0];

  const canSave = form.name.trim().length > 0 && parseFloat(form.cost) > 0;

  return (
    <ScrollView
      contentContainerStyle={[styles.formContent]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Popular Services</Text>
        </TouchableOpacity>
      )}

      {/* Service Name */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Service Name *</Text>
      <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={form.name}
          onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          placeholder="e.g. Netflix"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.inputText, { color: colors.foreground }]}
          autoCapitalize="words"
        />
      </View>

      {/* Price */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Price *</Text>
      <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.currencyPrefix, { color: colors.mutedForeground }]}>$</Text>
        <TextInput
          value={form.cost}
          onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))}
          placeholder="9.99"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.inputText, { color: colors.foreground }]}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Billing Cycle */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Billing Cycle</Text>
      <View style={styles.chipRow}>
        {BILLING_CYCLES.map((c) => (
          <TouchableOpacity
            key={c.value}
            onPress={() => setForm((p) => ({ ...p, cycle: c.value }))}
            style={[
              styles.chip,
              {
                backgroundColor: form.cycle === c.value ? colors.primary : colors.card,
                borderColor: form.cycle === c.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: form.cycle === c.value ? "#FFF" : colors.foreground }]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Days until renewal */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Days Until Next Renewal</Text>
      <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={form.daysUntilRenewal}
          onChangeText={(v) => setForm((p) => ({ ...p, daysUntilRenewal: v }))}
          keyboardType="number-pad"
          style={[styles.inputText, { color: colors.foreground }]}
        />
      </View>
      <Text style={[styles.renewalHint, { color: colors.primary }]}>
        Renewal: {renewalStr}
      </Text>

      {/* Category */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setForm((p) => ({ ...p, category: cat.id as CategoryId }))}
            style={[
              styles.chip,
              {
                backgroundColor: form.category === cat.id ? cat.color + "22" : colors.card,
                borderColor: form.category === cat.id ? cat.color : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: form.category === cat.id ? cat.color : colors.mutedForeground },
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Method */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Payment Method</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.value}
            onPress={() => setForm((p) => ({ ...p, payment: m.value }))}
            style={[
              styles.chip,
              {
                backgroundColor: form.payment === m.value ? colors.primary : colors.card,
                borderColor: form.payment === m.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: form.payment === m.value ? "#FFF" : colors.foreground }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notes */}
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Notes (optional)</Text>
      <View style={[styles.inputBox, styles.notesBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          value={form.notes}
          onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
          placeholder="Family plan, shared account..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.inputText, { color: colors.foreground }]}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.cancelBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onSave(form)}
          disabled={!canSave}
          style={[
            styles.saveBtn,
            { backgroundColor: canSave ? colors.primary : colors.muted },
            onBack ? { flex: 1.5 } : { flex: 1 },
          ]}
        >
          <Text style={[styles.saveText, { color: canSave ? "#FFF" : colors.mutedForeground }]}>
            Add Subscription
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function AddSubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSub, currency } = useApp();
  const [step, setStep] = useState<"quick" | "form">("quick");
  const [prefill, setPrefill] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const { showAd } = useInterstitialAd();

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const handleQuickSelect = (service: PopularService) => {
    setPrefill({
      name: service.name,
      cost: String(service.price),
      category: service.category,
    });
    setStep("form");
  };

  const handleCustom = () => {
    setPrefill({});
    setStep("form");
  };

  const handleSave = useCallback(
    async (form: FormState) => {
      if (saving) return;
      setSaving(true);
      try {
        const days = parseInt(form.daysUntilRenewal, 10) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (30 - days)); // approximate start
        const sub: Subscription = {
          id: generateId(),
          name: form.name.trim(),
          cost: parseFloat(form.cost),
          billing_cycle: form.cycle,
          custom_cycle_days: form.cycle === "custom" ? parseInt(form.customDays, 10) || 30 : undefined,
          start_date: startDate.toISOString().split("T")[0],
          category: form.category,
          color: CATEGORIES.find((c) => c.id === form.category)?.color ?? "#4B9EFF",
          is_active: true,
          notes: form.notes.trim() || undefined,
          currency,
          payment_method: form.payment,
          created_at: new Date().toISOString(),
        };
        await addSub(sub);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await showAd(); // show interstitial ad after saving (native only)
        router.back();
      } catch {
        Alert.alert("Error", "Failed to save subscription.");
      } finally {
        setSaving(false);
      }
    },
    [addSub, currency, saving]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topInset + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Add Subscription</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={[styles.closeBtn, { backgroundColor: colors.card }]}>
            <Ionicons name="close" size={18} color={colors.foreground} />
          </View>
        </TouchableOpacity>
      </View>

      {step === "quick" ? (
        <ScrollView
          contentContainerStyle={[
            styles.quickContent,
            { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            QUICK ADD — POPULAR SERVICES
          </Text>
          <View style={styles.grid}>
            {POPULAR_SERVICES.map((service) => (
              <ServiceTile
                key={service.name}
                service={service}
                onPress={() => handleQuickSelect(service)}
              />
            ))}
          </View>
          <TouchableOpacity
            onPress={handleCustom}
            style={[styles.customBtn, { borderColor: colors.primary }]}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.customBtnText, { color: colors.primary }]}>Add Custom Service</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <DetailsForm
          initial={prefill}
          onBack={() => { setStep("quick"); setPrefill({}); }}
          onSave={handleSave}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  screenTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickContent: { paddingHorizontal: 18, paddingTop: 18, gap: 14 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "30.5%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tileName: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  tilePrice: { fontSize: 11, fontFamily: "Inter_400Regular" },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  customBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  formContent: { paddingHorizontal: 20, paddingTop: 16, gap: 8, paddingBottom: 40 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 8 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 4,
  },
  inputText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  currencyPrefix: { fontSize: 15, fontFamily: "Inter_400Regular", marginRight: 4 },
  notesBox: { alignItems: "flex-start", minHeight: 80 },
  renewalHint: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, alignItems: "center", paddingVertical: 15, borderRadius: 14, borderWidth: 1 },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveBtn: { alignItems: "center", paddingVertical: 15, borderRadius: 14 },
  saveText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
