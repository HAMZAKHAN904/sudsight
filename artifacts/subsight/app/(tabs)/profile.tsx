import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { CURRENCIES } from "@/utils/currency";
import { getTotalMonthlyBurn, getTotalYearlyBurn } from "@/utils/calculations";
import { formatCurrency } from "@/utils/currency";

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  tint?: string;
  destructive?: boolean;
}

function Row({ icon, label, value, onPress, tint, destructive }: RowProps) {
  const colors = useColors();
  const iconColor = destructive ? colors.destructive : tint ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: iconColor + "18" },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.mutedForeground}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { subscriptions, currency, setCurrency } = useApp();
  const [currencyModal, setCurrencyModal] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const monthly = getTotalMonthlyBurn(subscriptions);
  const yearly = getTotalYearlyBurn(subscriptions);
  const active = subscriptions.filter((s) => s.is_active).length;

  const handleCurrencySelect = async (code: string) => {
    await setCurrency(code);
    setCurrencyModal(false);
  };

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
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {active}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Active
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatCurrency(monthly, currency)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Monthly
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatCurrency(yearly, currency)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Yearly
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Preferences
        </Text>
        <Row
          icon="cash-outline"
          label="Currency"
          value={currency}
          onPress={() => setCurrencyModal(true)}
        />
      </View>

      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          About
        </Text>
        <Row
          icon="information-circle-outline"
          label="Subsight"
          value="v1.0.0"
          onPress={() => {}}
          tint={colors.accent}
        />
      </View>

      <Modal
        visible={currencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCurrencyModal(false)}
      >
        <View
          style={[styles.modal, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Select Currency
            </Text>
            <TouchableOpacity onPress={() => setCurrencyModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur.code}
                onPress={() => handleCurrencySelect(cur.code)}
                style={[
                  styles.currencyRow,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor:
                      currency === cur.code
                        ? colors.primary + "12"
                        : "transparent",
                  },
                ]}
              >
                <Text style={[styles.currencySymbol, { color: colors.primary }]}>
                  {cur.symbol}
                </Text>
                <View style={styles.currencyInfo}>
                  <Text
                    style={[styles.currencyCode, { color: colors.foreground }]}
                  >
                    {cur.code}
                  </Text>
                  <Text
                    style={[
                      styles.currencyName,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {cur.name}
                  </Text>
                </View>
                {currency === cur.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
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
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  summaryDivider: {
    width: 1,
    height: 36,
  },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  modal: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    width: 30,
    textAlign: "center",
  },
  currencyInfo: { flex: 1 },
  currencyCode: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  currencyName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
