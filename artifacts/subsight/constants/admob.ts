import { Platform } from "react-native";

/**
 * AdMob ad unit IDs.
 *
 * Currently set to Google's official TEST IDs so no real ads are served
 * during development. Replace with your real AdMob unit IDs before release.
 *
 * To get real IDs:
 *  1. Create an app in https://admob.google.com
 *  2. Create ad units (Banner, Interstitial, Rewarded) for iOS and Android
 *  3. Replace the strings below with your real unit IDs
 *  4. Also update the androidAppId / iosAppId in app.json
 */

const IS_TEST = __DEV__;

export const AD_UNIT_IDS = {
  banner: IS_TEST
    ? Platform.select({
        ios: "ca-app-pub-3940256099942544/2934735716",
        android: "ca-app-pub-3940256099942544/6300978111",
        default: "ca-app-pub-3940256099942544/6300978111",
      })
    : Platform.select({
        ios: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",       // ← replace
        android: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",   // ← replace
        default: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      }),

  interstitial: IS_TEST
    ? Platform.select({
        ios: "ca-app-pub-3940256099942544/4411468910",
        android: "ca-app-pub-3940256099942544/1033173712",
        default: "ca-app-pub-3940256099942544/1033173712",
      })
    : Platform.select({
        ios: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",       // ← replace
        android: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",   // ← replace
        default: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      }),

  rewarded: IS_TEST
    ? Platform.select({
        ios: "ca-app-pub-3940256099942544/1712485313",
        android: "ca-app-pub-3940256099942544/5224354917",
        default: "ca-app-pub-3940256099942544/5224354917",
      })
    : Platform.select({
        ios: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",       // ← replace
        android: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",   // ← replace
        default: "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
      }),
} as const;
