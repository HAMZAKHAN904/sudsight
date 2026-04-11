import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CATEGORIES = [
  { id: "streaming", label: "Streaming", icon: "film", color: "#E11D48" },
  { id: "music", label: "Music", icon: "musical-notes", color: "#7C3AED" },
  { id: "fitness", label: "Fitness", icon: "fitness", color: "#059669" },
  { id: "cloud", label: "Cloud", icon: "cloud", color: "#0284C7" },
  { id: "gaming", label: "Gaming", icon: "game-controller", color: "#D97706" },
  { id: "productivity", label: "Work", icon: "briefcase", color: "#6366F1" },
  { id: "news", label: "News", icon: "newspaper", color: "#DC2626" },
  { id: "food", label: "Food", icon: "restaurant", color: "#EA580C" },
  { id: "education", label: "Education", icon: "school", color: "#0891B2" },
  { id: "social", label: "Social", icon: "people", color: "#9333EA" },
  { id: "finance", label: "Finance", icon: "card", color: "#16A34A" },
  { id: "other", label: "Other", icon: "grid", color: "#6B7280" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function getCategoryInfo(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

interface CategoryIconProps {
  categoryId: string;
  size?: number;
  showBackground?: boolean;
}

export function CategoryIcon({
  categoryId,
  size = 20,
  showBackground = true,
}: CategoryIconProps) {
  const cat = getCategoryInfo(categoryId);
  const iconSize = size * 0.6;

  if (!showBackground) {
    return <Ionicons name={cat.icon as never} size={size} color={cat.color} />;
  }

  return (
    <View
      style={[
        styles.bg,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: cat.color + "22",
        },
      ]}
    >
      <Ionicons name={cat.icon as never} size={iconSize} color={cat.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    alignItems: "center",
    justifyContent: "center",
  },
});
