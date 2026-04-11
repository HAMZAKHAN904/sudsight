import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription } from "@/utils/calculations";

const STORAGE_KEY = "subsight_subscriptions";
const CURRENCY_KEY = "subsight_currency";
const NOTIFICATIONS_KEY = "subsight_notifications";

export async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Subscription[];
  } catch {
    return [];
  }
}

export async function saveSubscriptions(
  subscriptions: Subscription[]
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
}

export async function addSubscription(sub: Subscription): Promise<void> {
  const existing = await loadSubscriptions();
  await saveSubscriptions([...existing, sub]);
}

export async function updateSubscription(
  updated: Subscription
): Promise<void> {
  const existing = await loadSubscriptions();
  const next = existing.map((s) => (s.id === updated.id ? updated : s));
  await saveSubscriptions(next);
}

export async function deleteSubscription(id: string): Promise<void> {
  const existing = await loadSubscriptions();
  await saveSubscriptions(existing.filter((s) => s.id !== id));
}

export async function toggleSubscription(id: string): Promise<void> {
  const existing = await loadSubscriptions();
  const next = existing.map((s) =>
    s.id === id ? { ...s, is_active: !s.is_active } : s
  );
  await saveSubscriptions(next);
}

export async function loadCurrency(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(CURRENCY_KEY);
    return data ?? "USD";
  } catch {
    return "USD";
  }
}

export async function saveCurrency(currency: string): Promise<void> {
  await AsyncStorage.setItem(CURRENCY_KEY, currency);
}

export async function loadNotificationsEnabled(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return data === null ? true : data === "true";
  } catch {
    return true;
  }
}

export async function saveNotificationsEnabled(
  enabled: boolean
): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(enabled));
}
