import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { BillingCycle, Subscription } from "@/utils/calculations";
import { CATEGORIES, CategoryId } from "@/components/CategoryIcon";
import { Ionicons } from "@expo/vector-icons";

const BILLING_CYCLES: { label: string; value: BillingCycle }[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function AddSubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addSub } = useApp();

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [customDays, setCustomDays] = useState("");
  const [category, setCategory] = useState<CategoryId>("other");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave =
    name.trim().length > 0 && parseFloat(cost) > 0;

  const handleSave = useCallback(async () => {
    if (!canSave) {
      Alert.alert("Required", "Please enter a name and cost.");
      return;
    }
    setSaving(true);
    try {
      const sub: Subscription = {
        id: generateId(),
        name: name.trim(),
        cost: parseFloat(cost),
        billing_cycle: cycle,
        custom_cycle_days: cycle === "custom" ? parseInt(customDays, 10) || 30 : undefined,
        start_date: startDate,
        category,
        color: CATEGORIES.find((c) => c.id === category)?.color ?? "#6366F1",
        is_active: true,
        notes: notes.trim() || undefined,
        currency: "USD",
        created_at: new Date().toISOString(),
      };
      await addSub(sub);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save subscription.");
    } finally {
      setSaving(false);
    }
  }, [name, cost, cycle, customDays, category, startDate, notes, canSave, addSub]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

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
          <Ionicons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          New Subscription
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave || saving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: canSave ? colors.primary : colors.muted,
            },
          ]}
        >
          <Text
            style={[
              styles.saveBtnText,
              {
                color: canSave
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
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
              placeholder="Netflix, Spotify..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          <View
            style={[styles.fieldDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Cost
            </Text>
            <TextInput
              value={cost}
              onChangeText={setCost}
              placeholder="9.99"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
          <View
            style={[styles.fieldDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Start Date
            </Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              keyboardType="numbers-and-punctuation"
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
                  backgroundColor:
                    cycle === c.value ? colors.primary : colors.card,
                  borderColor:
                    cycle === c.value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cycleText,
                  {
                    color:
                      cycle === c.value
                        ? colors.primaryForeground
                        : colors.foreground,
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
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.fieldRow}>
              <Text
                style={[styles.fieldLabel, { color: colors.mutedForeground }]}
              >
                Every (days)
              </Text>
              <TextInput
                value={customDays}
                onChangeText={setCustomDays}
                placeholder="30"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                keyboardType="number-pad"
              />
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
                <Ionicons
                  name={cat.icon as never}
                  size={22}
                  color={cat.color}
                />
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
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              marginTop: 8,
            },
          ]}
        >
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional note..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              multiline
            />
          </View>
        </View>
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
  screenTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
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
  sectionLabel: {
    marginTop: 8,
  },
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
});
