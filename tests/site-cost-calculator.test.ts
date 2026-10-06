import { describe, expect, it } from "vitest";
import { calculateSiteCost, compareSiteCosts, feaseWebScenario } from "@/lib/site-cost-calculator";

describe("site cost calculator", () => {
  it("calculates one year with initial and recurring costs", () => {
    const result = calculateSiteCost({ initialCost: 600, monthlyCost: 20, annualDomain: 12, annualMaintenance: 100, annualSeo: 0, annualSupport: 50, years: 1 });
    expect(result.total).toBe(1002);
    expect(result.averageMonthly).toBe(83.5);
    expect(result.yearOne).toBe(1002);
  });

  it("calculates the FeaseWeb scenario over three years", () => {
    const result = calculateSiteCost(feaseWebScenario);
    expect(result.total).toBe(1764);
    expect(result.averageMonthly).toBe(49);
    expect(result.annualTotals).toEqual([588, 1176, 1764]);
  });

  it("supports five years and separates following years", () => {
    const result = calculateSiteCost({ ...feaseWebScenario, years: 5 });
    expect(result.total).toBe(2940);
    expect(result.followingYears).toBe(588);
  });

  it("compares scenarios without division by zero", () => {
    const empty = calculateSiteCost({ initialCost: 0, monthlyCost: 0, annualDomain: 0, annualMaintenance: 0, annualSeo: 0, annualSupport: 0, years: 3 });
    const other = calculateSiteCost({ ...feaseWebScenario, years: 3 });
    expect(compareSiteCosts(empty, empty)).toEqual({ difference: 0, percentage: 0 });
    expect(compareSiteCosts(empty, other)).toEqual({ difference: 1764, percentage: 100 });
  });

  it("normalizes negative, non-finite and unsupported values safely", () => {
    const result = calculateSiteCost({ initialCost: -1, monthlyCost: Number.NaN, annualDomain: Number.POSITIVE_INFINITY, annualMaintenance: 0, annualSeo: 0, annualSupport: 0, years: 4 as 1 | 2 | 3 | 5 });
    expect(result.total).toBe(0);
    expect(Number.isNaN(result.total)).toBe(false);
  });

  it("keeps decimals and very large values finite", () => {
    const decimal = calculateSiteCost({ initialCost: 125.5, monthlyCost: 49.99, annualDomain: 12.5, annualMaintenance: 0, annualSeo: 0, annualSupport: 0, years: 1 });
    const huge = calculateSiteCost({ initialCost: Number.MAX_VALUE, monthlyCost: Number.MAX_VALUE, annualDomain: Number.MAX_VALUE, annualMaintenance: Number.MAX_VALUE, annualSeo: Number.MAX_VALUE, annualSupport: Number.MAX_VALUE, years: 5 });

    expect(decimal.total).toBeCloseTo(737.88, 2);
    expect(Number.isFinite(huge.total)).toBe(true);
    expect(Number.isFinite(huge.averageMonthly)).toBe(true);
    expect(huge.total).toBeGreaterThanOrEqual(0);
  });
});
