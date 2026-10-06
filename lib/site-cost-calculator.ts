export type SiteCostInputs = {
  initialCost: number;
  monthlyCost: number;
  annualDomain: number;
  annualMaintenance: number;
  annualSeo: number;
  annualSupport: number;
  years: 1 | 2 | 3 | 5;
};

export type SiteCostBreakdown = {
  initialCost: number;
  recurringAnnualCost: number;
  recurringCost: number;
  total: number;
  averageMonthly: number;
  yearOne: number;
  followingYears: number;
  initialShare: number;
  recurringShare: number;
  annualTotals: number[];
};

export const DURATIONS = [1, 2, 3, 5] as const;
const MAX_AMOUNT = Number.MAX_SAFE_INTEGER;

function safeAmount(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.min(value, MAX_AMOUNT) : 0;
}

export function calculateSiteCost(inputs: SiteCostInputs): SiteCostBreakdown {
  const initialCost = safeAmount(inputs.initialCost);
  const monthlyCost = safeAmount(inputs.monthlyCost);
  const recurringAnnualCost =
    safeAmount(inputs.annualDomain) +
    safeAmount(inputs.annualMaintenance) +
    safeAmount(inputs.annualSeo) +
    safeAmount(inputs.annualSupport) +
    monthlyCost * 12;
  const years = DURATIONS.includes(inputs.years) ? inputs.years : 3;
  const recurringCost = recurringAnnualCost * years;
  const total = initialCost + recurringCost;
  const firstYearRecurring = recurringAnnualCost;

  return {
    initialCost,
    recurringAnnualCost,
    recurringCost,
    total,
    averageMonthly: total / (years * 12),
    yearOne: initialCost + firstYearRecurring,
    followingYears: recurringAnnualCost,
    initialShare: total === 0 ? 0 : (initialCost / total) * 100,
    recurringShare: total === 0 ? 0 : (recurringCost / total) * 100,
    annualTotals: Array.from({ length: years }, (_, index) => initialCost + recurringAnnualCost * (index + 1)),
  };
}

export function compareSiteCosts(first: SiteCostBreakdown, second: SiteCostBreakdown) {
  const difference = Math.abs(first.total - second.total);
  const reference = Math.max(first.total, second.total);

  return {
    difference,
    percentage: reference === 0 ? 0 : (difference / reference) * 100,
  };
}

export const feaseWebScenario: SiteCostInputs = {
  initialCost: 0,
  monthlyCost: 49,
  annualDomain: 0,
  annualMaintenance: 0,
  annualSeo: 0,
  annualSupport: 0,
  years: 3,
};
