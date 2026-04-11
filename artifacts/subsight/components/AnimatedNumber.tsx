import React, { useEffect } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  style,
  decimals = 2,
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 20,
      stiffness: 80,
    });
  }, [value, animatedValue]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${prefix}${animatedValue.value.toFixed(decimals)}${suffix}`,
  }));

  return (
    <AnimatedText
      style={[styles.text, style]}
      animatedProps={animatedProps as never}
    >
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </AnimatedText>
  );
}

const styles = StyleSheet.create({
  text: {},
});
