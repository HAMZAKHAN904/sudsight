import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import {
  BillingCycle, PaymentMethod, getCycleLabel,
  getMonthlyEquivalent, getPaymentMethodLabel,
} from "@/utils/calculations";
import { CATEGORIES, CategoryId, getCategoryInfo } from "@/components/CategoryIcon";
import { getNextRenewalDate, formatFullDate } from "@/utils/dates";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

const BILLING_CYCLES: { label: string; value: BillingCycle }[] = [
  { label: "Weekly",    value: "weekly" },
  { label: "Monthly",   value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly",    value: "yearly" },
  { label: "Custom",    value: "custom" },
];

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "Credit Card", value: "credit_card" },
  { label: "Debit Card",  value: "debit_card" },
  { label: "PayPal",      value: "paypal" },
  { label: "Apple Pay",   value: "apple_pay" },
  { label: "Google Pay",  value: "google_pay" },
  { label: "Other",       value: "other" },
];

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, updateSub, deleteSub } = useApp();

  const sub = subscriptions.find((s) => s.id === id);

  const [name, setName]             = useState(sub?.name ?? "");
  const [cost, setCost]             = useState(String(sub?.cost ?? ""));
  const [cycle, setCycle]           = useState<BillingCycle>(sub?.billing_cycle ?? "monthly");
  const [customDays, setCustomDays] = useState(String(sub?.custom_cycle_days ?? "30"));
  const [category, setCategory]     = useState<CategoryId>((sub?.category as CategoryId) ?? "other");
  const [payment, setPayment]       = useState<PaymentMethod>(sub?.payment_method ?? "credit_card");
  const [startDate, setStartDate]   = useState(sub?.start_date ?? new Date().toISOString().split("T")[0]);
  const [notes, setNotes]           = useState(sub?.notes ?? "");
  const [isActive, setIsActive]     = useState(sub?.is_active ?? true);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!sub) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Not found.</Text>
      </View>
    );
  }

  const nextRenewal = getNextRenewalDate(
    new Date(startDate),
    cycle,
    cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined
  );
  const monthly = getMonthlyEquivalent(
    parseFloat(cost) || 0,
    cycle,
    cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined
  );
  const catInfo = getCategoryInfo(category);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a service name.");
      return;
    }
    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      Alert.alert("Validation Error", "Please enter a valid price greater than zero.");
      return;
    }
    await updateSub({
      ...sub,
      name: name.trim(),
      cost: parsedCost,
      billing_cycle: cycle,
      custom_cycle_days: cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined,
      category,
      color: CATEGORIES.find((c) => c.id === category)?.color ?? "#4B9EFF",
      start_date: startDate,
      notes: notes.trim() || undefined,
      is_active: isActive,
      payment_method: payment,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleToggle = async () => {
    const next = !isActive;
    setIsActive(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDelete = () => {
    Alert.alert("Delete Subscription", `Delete "${sub.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSub(sub.id);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.topBar, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Subscription Details</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: "#0F1E40" }]}>
          <View style={[styles.infoIcon, { backgroundColor: catInfo.color + "22" }]}>
            <Ionicons name={catInfo.icon as never} size={28} color={catInfo.color} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoName}>{name || sub.name}</Text>
            <Text style={styles.infoMeta}>
              {formatCurrency(monthly, currency)}/mo · {formatFullDate(nextRenewal)}
            </Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: isActive ? "#2EC4A722" : "#F0484822" }]}>
            <Text style={[styles.activeBadgeText, { color: isActive ? "#2EC4A7" : "#F04848" }]}>
              {isActive ? "Active" : "Paused"}
            </Text>
          </View>
        </View>

        {/* Basic fields */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.fieldInput, { color: colors.foreground }]}
              placeholderTextColor={colors.mutedForeground}
              placeholder="Service name"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Price</Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              style={[styles.fieldInput, { color: colors.foreground }]}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedForeground}
              placeholder="0.00"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Start</Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              style={[styles.fieldInput, { color: colors.foreground }]}
              placeholderTextColor={colors.mutedForeground}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Active</Text>
            <Switch
              value={isActive}
              onValueChange={handleToggle}
              trackColor={{ true: "#2EC4A7", false: colors.border }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Billing Cycle */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BILLING CYCLE</Text>
        <View style={styles.chipRow}>
          {BILLING_CYCLES.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setCycle(c.value)}
              style={[styles.chip, {
                backgroundColor: cycle === c.value ? colors.primary : colors.card,
                borderColor: cycle === c.value ? colors.primary : colors.border,
              }]}
            >
              <Text style={[styles.chipText, { color: cycle === c.value ? "#FFF" : colors.foreground }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom days — only shown when cycle is "custom" */}
        {cycle === "custom" && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>REPEAT EVERY (DAYS)</Text>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Days</Text>
                <TextInput
                  value={customDays}
                  onChangeText={setCustomDays}
                  style={[styles.fieldInput, { color: colors.foreground }]}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>
          </>
        )}

        {/* Category */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategory(cat.id as CategoryId)}
              style={[styles.chip, {
                backgroundColor: category === cat.id ? cat.color + "22" : colors.card,
                borderColor: category === cat.id ? cat.color : colors.border,
              }]}
            >
              <Text style={[styles.chipText, { color: category === cat.id ? cat.color : colors.mutedForeground }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PAYMENT METHOD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.value}
              onPress={() => setPayment(m.value)}
              style={[styles.chip, {
                backgroundColor: payment === m.value ? colors.primary : colors.card,
                borderColor: payment === m.value ? colors.primary : colors.border,
              }]}
            >
              <Text style={[styles.chipText, { color: payment === m.value ? "#FFF" : colors.foreground }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Renewal info */}
        <View style={[styles.renewalCard, { backgroundColor: "#0F1E40" }]}>
          <Ionicons name="calendar-outline" size={16} color="#4B9EFF" />
          <Text style={styles.renewalText}>
            Next renewal: {formatFullDate(nextRenewal)} · {formatCurrency(monthly, currency)}/mo
          </Text>
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.fieldInput, { color: colors.foreground }]}
              multiline
              placeholder="Optional..."
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { borderColor: colors.destructive + "40" }]}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          <Text style={[styles.deleteBtnText, { color: colors.destructive }]}>Delete Subscription</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1,
  },
  screenTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 100 },
  saveBtnText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 12 },
  infoCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16,
  },
  infoIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  infoText: { flex: 1, gap: 4 },
  infoName: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  infoMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  activeBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  fieldRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  fieldLabel: { width: 60, fontSize: 13, fontFamily: "Inter_500Medium" },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 16 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginTop: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  renewalCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, padding: 14,
  },
  renewalText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)", flex: 1 },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginTop: 8,
  },
  deleteBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
