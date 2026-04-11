import { BillingCycle } from "./calculations";

export function getNextRenewalDate(
  startDate: Date,
  cycle: BillingCycle,
  customDays?: number
): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let next = new Date(startDate);
  next.setHours(0, 0, 0, 0);

  const advanceByOneCycle = (date: Date): Date => {
    const d = new Date(date);
    switch (cycle) {
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "biweekly":
        d.setDate(d.getDate() + 14);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "quarterly":
        d.setMonth(d.getMonth() + 3);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      case "custom":
        d.setDate(d.getDate() + (customDays ?? 30));
        break;
    }
    return d;
  };

  while (next <= now) {
    next = advanceByOneCycle(next);
  }

  return next;
}

export function getDaysUntilRenewal(renewalDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = renewalDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatRenewalDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date): string {
  const days = getDaysUntilRenewal(date);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`;
  return formatRenewalDate(date);
}

export function isRenewingSoon(date: Date, thresholdDays: number = 7): boolean {
  return getDaysUntilRenewal(date) <= thresholdDays;
}
