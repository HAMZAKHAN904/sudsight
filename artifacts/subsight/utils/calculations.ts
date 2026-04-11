export type BillingCycle =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "apple_pay"
  | "google_pay"
  | "other";

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billing_cycle: BillingCycle;
  custom_cycle_days?: number;
  start_date: string;
  category: string;
  color: string;
  logo_url?: string;
  is_active: boolean;
  notes?: string;
  currency: string;
  payment_method: PaymentMethod;
  created_at: string;
}

export function getMonthlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  customDays?: number
): number {
  switch (cycle) {
    case "weekly":
      return (cost * 52) / 12;
    case "biweekly":
      return (cost * 26) / 12;
    case "monthly":
      return cost;
    case "quarterly":
      return cost / 3;
    case "yearly":
      return cost / 12;
    case "custom":
      if (!customDays || customDays <= 0) return cost;
      return (cost / customDays) * 30.44;
    default:
      return cost;
  }
}

export function getTotalMonthlyBurn(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.is_active)
    .reduce(
      (total, sub) =>
        total +
        getMonthlyEquivalent(sub.cost, sub.billing_cycle, sub.custom_cycle_days),
      0
    );
}

export function getTotalYearlyBurn(subscriptions: Subscription[]): number {
  return getTotalMonthlyBurn(subscriptions) * 12;
}

export function getMonthlyByCategory(
  subscriptions: Subscription[]
): Record<string, number> {
  return subscriptions
    .filter((s) => s.is_active)
    .reduce(
      (acc, sub) => {
        const monthly = getMonthlyEquivalent(
          sub.cost,
          sub.billing_cycle,
          sub.custom_cycle_days
        );
        acc[sub.category] = (acc[sub.category] || 0) + monthly;
        return acc;
      },
      {} as Record<string, number>
    );
}

export function getMonthlyByPaymentMethod(
  subscriptions: Subscription[]
): Record<PaymentMethod, number> {
  return subscriptions
    .filter((s) => s.is_active)
    .reduce(
      (acc, sub) => {
        const monthly = getMonthlyEquivalent(
          sub.cost,
          sub.billing_cycle,
          sub.custom_cycle_days
        );
        acc[sub.payment_method] = (acc[sub.payment_method] || 0) + monthly;
        return acc;
      },
      {} as Record<PaymentMethod, number>
    );
}

export function getCycleLabel(cycle: BillingCycle, customDays?: number): string {
  switch (cycle) {
    case "weekly":       return "Weekly";
    case "biweekly":     return "Bi-Weekly";
    case "monthly":      return "Monthly";
    case "quarterly":    return "Quarterly";
    case "yearly":       return "Yearly";
    case "custom":       return `Every ${customDays ?? "?"} days`;
    default:             return "Monthly";
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "credit_card":  return "Credit Card";
    case "debit_card":   return "Debit Card";
    case "paypal":       return "PayPal";
    case "apple_pay":    return "Apple Pay";
    case "google_pay":   return "Google Pay";
    default:             return "Other";
  }
}
