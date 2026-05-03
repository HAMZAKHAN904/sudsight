import colors from "@/constants/colors";

/**
 * Returns the dark color palette.
 * Subsight uses a forced dark theme.
 */
export function useColors() {
  const palette = (colors as unknown as Record<string, typeof colors.light>).dark ?? colors.light;
  return { ...palette, radius: colors.radius };
}
