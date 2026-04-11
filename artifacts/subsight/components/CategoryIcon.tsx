import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const CATEGORIES = [
  { id: "entertainment", label: "Entertainment", icon: "film", color: "#F04848" },
  { id: "music",         label: "Music",          icon: "musical-notes", color: "#A855F7" },
  { id: "productivity",  label: "Productivity",   icon: "briefcase", color: "#4B9EFF" },
  { id: "education",     label: "Education",      icon: "school", color: "#8B5CF6" },
  { id: "fitness",       label: "Fitness",        icon: "fitness", color: "#2EC4A7" },
  { id: "cloud",         label: "Cloud",          icon: "cloud", color: "#0EA5E9" },
  { id: "gaming",        label: "Gaming",         icon: "game-controller", color: "#F59E0B" },
  { id: "business",      label: "Business",       icon: "stats-chart", color: "#10B981" },
  { id: "news",          label: "News",           icon: "newspaper", color: "#EF4444" },
  { id: "food",          label: "Food",           icon: "restaurant", color: "#F97316" },
  { id: "finance",       label: "Finance",        icon: "card", color: "#22C55E" },
  { id: "other",         label: "Other",          icon: "grid", color: "#6B7280" },
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

export function CategoryIcon({ categoryId, size = 20, showBackground = true }: CategoryIconProps) {
  const cat = getCategoryInfo(categoryId);
  const iconSize = size * 0.55;

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
          borderRadius: size * 0.26,
          backgroundColor: cat.color + "28",
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
