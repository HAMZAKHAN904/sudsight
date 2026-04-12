import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon = "grid-outline", actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();

  const pulse = useRef(new Animated.Value(1)).current;
  const ring1  = useRef(new Animated.Value(0.7)).current;
  const ring2  = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulsAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 2000, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1,    duration: 2000, useNativeDriver: false }),
      ])
    );
    const ringAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1,   duration: 2500, useNativeDriver: false }),
        Animated.timing(ring1, { toValue: 0.7, duration: 2500, useNativeDriver: false }),
      ])
    );
    const ring2Anim = Animated.loop(
      Animated.sequence([
        Animated.timing(ring2, { toValue: 0.7, duration: 2000, useNativeDriver: false }),
        Animated.timing(ring2, { toValue: 0.4, duration: 2000, useNativeDriver: false }),
      ])
    );
    pulsAnim.start();
    ringAnim.start();
    ring2Anim.start();
    return () => { pulsAnim.stop(); ringAnim.stop(); ring2Anim.stop(); };
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated rings */}
      <View style={styles.ringsWrapper}>
        <Animated.View style={[styles.ring, styles.ring3, { opacity: ring2 }]} />
        <Animated.View style={[styles.ring, styles.ring2, { opacity: ring1 }]} />
        <Animated.View style={[styles.ring, styles.ring1]} />

        {/* Center icon */}
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient
            colors={["#1E3A6E", "#0F2040"]}
            style={styles.iconWrap}
          >
            <Ionicons name={icon} size={32} color="#4B9EFF" />
          </LinearGradient>
        </Animated.View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.desc, { color: colors.mutedForeground }]}>{description}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.85}>
          <LinearGradient
            colors={["#4B9EFF", "#2D7DD2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.btnText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const ICON_SIZE = 80;
const R1 = ICON_SIZE / 2 + 16;
const R2 = ICON_SIZE / 2 + 34;
const R3 = ICON_SIZE / 2 + 56;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 52,
    paddingHorizontal: 32,
    gap: 14,
  },
  ringsWrapper: {
    width: ICON_SIZE + R3 * 2,
    height: ICON_SIZE + R3 * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: (R1) * 2,
    height: (R1) * 2,
    borderColor: "rgba(75,158,255,0.25)",
    backgroundColor: "rgba(75,158,255,0.05)",
  },
  ring2: {
    width: (R2) * 2,
    height: (R2) * 2,
    borderColor: "rgba(75,158,255,0.12)",
  },
  ring3: {
    width: (R3) * 2,
    height: (R3) * 2,
    borderColor: "rgba(75,158,255,0.06)",
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(75,158,255,0.3)",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 21,
    opacity: 0.8,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
  },
  btnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
