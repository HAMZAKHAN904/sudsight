/**
 * useInterstitialAd — shows an AdMob interstitial on demand (native only).
 * The .web.ts stub handles the web platform automatically.
 *
 * Usage:
 *   const { showAd } = useInterstitialAd();
 *   await showAd(); // call after saving a subscription, etc.
 */
import { useCallback, useEffect, useRef } from "react";
import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";
import { AD_UNIT_IDS } from "@/constants/admob";

export function useInterstitialAd() {
  const adRef     = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  const loadAd = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial ?? "", {
      requestNonPersonalizedAdsOnly: false,
    });
    ad.addAdEventListener(AdEventType.LOADED, () => { loadedRef.current = true; });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      loadAd(); // pre-load the next one
    });
    ad.addAdEventListener(AdEventType.ERROR, () => { loadedRef.current = false; });
    ad.load();
    adRef.current = ad;
  }, []);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const showAd = useCallback((): Promise<void> => {
    if (!adRef.current || !loadedRef.current) return Promise.resolve();
    return new Promise<void>((resolve) => {
      adRef.current!.addAdEventListener(AdEventType.CLOSED, () => resolve());
      adRef.current!.show();
    });
  }, []);

  return { showAd };
}
