import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { getCategoryInfo } from "./CategoryIcon";
import { formatCurrency } from "@/utils/currency";

interface DonutSegment {
  category: string;
  value: number;
  percentage: number;
}

interface DonutChartProps {
  data: DonutSegment[];
  total: number;
  currency: string;
  size?: number;
}

export function DonutChart({ data, total, currency, size = 180 }: DonutChartProps) {
  const colors = useColors();
  const radius = (size - 32) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativeOffset = 0;

  const segments = data.map((seg) => {
    const cat = getCategoryInfo(seg.category);
    const dashLength = (seg.percentage / 100) * circumference;
    const gapLength = circumference - dashLength;
    const offset = cumulativeOffset;
    cumulativeOffset += dashLength;

    return { ...seg, cat, dashLength, gapLength, offset };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${cx}, ${cy}`}>
            {segments.map((seg, i) => (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.cat.color}
                strokeWidth={22}
                strokeDasharray={`${seg.dashLength} ${seg.gapLength}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
              />
            ))}
          </G>
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={[styles.centerAmount, { color: colors.foreground }]}>
            {formatCurrency(total, currency)}
          </Text>
          <Text style={[styles.centerSub, { color: colors.mutedForeground }]}>
            /month
          </Text>
        </View>
      </View>

      <View style={styles.legend}>
        {data.slice(0, 6).map((seg) => {
          const cat = getCategoryInfo(seg.category);
          return (
            <View key={seg.category} style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: cat.color }]}
              />
              <Text
                style={[styles.legendLabel, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
              <Text style={[styles.legendValue, { color: colors.foreground }]}>
                {seg.percentage.toFixed(0)}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerAmount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  centerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  legend: {
    width: "100%",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  legendValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
