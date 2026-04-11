import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Subscription } from "@/utils/calculations";
import {
  addSubscription,
  deleteSubscription,
  loadCurrency,
  loadSubscriptions,
  saveCurrency,
  saveSubscriptions,
  toggleSubscription,
  updateSubscription,
} from "@/store/subscriptionStore";

interface AppContextValue {
  subscriptions: Subscription[];
  currency: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addSub: (sub: Subscription) => Promise<void>;
  updateSub: (sub: Subscription) => Promise<void>;
  deleteSub: (id: string) => Promise<void>;
  toggleSub: (id: string) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currency, setCurrencyState] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subs, cur] = await Promise.all([
        loadSubscriptions(),
        loadCurrency(),
      ]);
      setSubscriptions(subs);
      setCurrencyState(cur);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSub = useCallback(async (sub: Subscription) => {
    await addSubscription(sub);
    setSubscriptions((prev) => [...prev, sub]);
  }, []);

  const updateSub = useCallback(async (updated: Subscription) => {
    await updateSubscription(updated);
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  }, []);

  const deleteSub = useCallback(async (id: string) => {
    await deleteSubscription(id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleSub = useCallback(async (id: string) => {
    await toggleSubscription(id);
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, is_active: !s.is_active } : s
      )
    );
  }, []);

  const setCurrency = useCallback(async (cur: string) => {
    await saveCurrency(cur);
    setCurrencyState(cur);
  }, []);

  return (
    <AppContext.Provider
      value={{
        subscriptions,
        currency,
        isLoading,
        refresh,
        addSub,
        updateSub,
        deleteSub,
        toggleSub,
        setCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
