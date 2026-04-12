/**
 * AdBanner — renders a Google AdMob banner (native only).
 * The .web.tsx stub handles the web platform automatically.
 */
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNIT_IDS } from "@/constants/admob";

type BannerSize = keyof typeof BannerAdSize;

interface AdBannerProps {
  size?: BannerSize;
}

export function AdBanner({ size = "BANNER" }: AdBannerProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner ?? ""}
        size={BannerAdSize[size] ?? BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

export function AdBannerSeparator() {
  return <AdBanner size="BANNER" />;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
});
