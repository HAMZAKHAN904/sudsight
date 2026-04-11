import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BillingCycle, getCycleLabel, getMonthlyEquivalent } from "@/utils/calculations";
import { CATEGORIES, CategoryIcon, CategoryId } from "@/components/CategoryIcon";
import { getNextRenewalDate, formatFullDate } from "@/utils/dates";
import { formatCurrency } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";

const BILLING_CYCLES: { label: string; value: BillingCycle }[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, updateSub, deleteSub, toggleSub } = useApp();

  const sub = subscriptions.find((s) => s.id === id);

  const [name, setName] = useState(sub?.name ?? "");
  const [cost, setCost] = useState(String(sub?.cost ?? ""));
  const [cycle, setCycle] = useState<BillingCycle>(sub?.billing_cycle ?? "monthly");
  const [customDays, setCustomDays] = useState(String(sub?.custom_cycle_days ?? "30"));
  const [category, setCategory] = useState<CategoryId>((sub?.category as CategoryId) ?? "other");
  const [startDate, setStartDate] = useState(sub?.start_date ?? new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(sub?.notes ?? "");
  const [isActive, setIsActive] = useState(sub?.is_active ?? true);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  if (!sub) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Subscription not found.</Text>
      </View>
    );
  }

  const nextRenewal = getNextRenewalDate(new Date(startDate || sub.start_date), cycle, cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined);
  const monthly = getMonthlyEquivalent(parseFloat(cost) || 0, cycle, cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined);

  const handleToggleActive = async () => {
    const next = !isActive;
    setIsActive(next);
    await Haptics.notificationAsync(
      next
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    await toggleSub(sub.id);
  };

  const handleSave = async () => {
    await updateSub({
      ...sub,
      name: name.trim(),
      cost: parseFloat(cost) || 0,
      billing_cycle: cycle,
      custom_cycle_days: cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined,
      category,
      start_date: startDate,
      notes: notes.trim() || undefined,
      is_active: isActive,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete "${sub.name}"?`,
      [
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
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <CategoryIcon categoryId={category} size={36} />
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            Save
          </Text>
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
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Monthly
            </Text>
            <Text style={[styles.infoValue, { color: colors.primary }]}>
              {formatCurrency(monthly, currency)}/mo
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Next Renewal
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {formatFullDate(nextRenewal)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.foreground }]}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Cost
            </Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              style={[styles.input, { color: colors.foreground }]}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Start Date
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              style={[styles.input, { color: colors.foreground }]}
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={[styles.fieldDivider, { backgroundColor: colors.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Active
            </Text>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ true: colors.primary, false: colors.muted }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.sectionLabel}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Billing Cycle
          </Text>
        </View>
        <View style={styles.cycleGrid}>
          {BILLING_CYCLES.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setCycle(c.value)}
              style={[
                styles.cycleChip,
                {
                  backgroundColor: cycle === c.value ? colors.primary : colors.card,
                  borderColor: cycle === c.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cycleText,
                  {
                    color: cycle === c.value ? colors.primaryForeground : colors.foreground,
                  },
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {cycle === "custom" && (
          <View
            style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                Every
              </Text>
              <TextInput
                value={customDays}
                onChangeText={setCustomDays}
                style={[styles.input, { color: colors.foreground }]}
                keyboardType="number-pad"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>days</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionLabel}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Category
          </Text>
        </View>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id as CategoryId)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? cat.color + "20" : colors.card,
                    borderColor: selected ? cat.color : colors.border,
                  },
                ]}
              >
                <Ionicons name={cat.icon as never} size={20} color={cat.color} />
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: selected ? cat.color : colors.mutedForeground },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 },
          ]}
        >
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, { color: colors.foreground }]}
              multiline
              placeholderTextColor={colors.mutedForeground}
              placeholder="Optional..."
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.deleteBtn, { borderColor: colors.destructive + "50" }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
          <Text style={[styles.deleteBtnText, { color: colors.destructive }]}>
            Delete Subscription
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 20,
    gap: 12,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  infoDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  fieldLabel: {
    width: 80,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  fieldDivider: {
    height: 1,
    marginLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: { marginTop: 8 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  cycleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cycleChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  cycleText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
