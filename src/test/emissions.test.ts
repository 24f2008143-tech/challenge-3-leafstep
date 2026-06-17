import { describe, it, expect } from "vitest";
import { EMISSION_FACTORS } from "../data/emissionFactors";

describe("CO2 emission factor accuracy", () => {
  it("petrol car: 15km should emit 3.6 kg CO2", () => {
    const result = 15 * EMISSION_FACTORS.car_petrol.factor;
    expect(result).toBeCloseTo(3.6, 1);
  });

  it("EV should emit significantly less than petrol per km", () => {
    expect(EMISSION_FACTORS.car_ev.factor)
      .toBeLessThan(EMISSION_FACTORS.car_petrol.factor);
  });

  it("vegan day emits less than vegetarian day", () => {
    expect(EMISSION_FACTORS.diet_vegan_day.factor)
      .toBeLessThan(EMISSION_FACTORS.diet_vegetarian_day.factor);
  });

  it("vegetarian day emits less than meat day", () => {
    expect(EMISSION_FACTORS.diet_vegetarian_day.factor)
      .toBeLessThan(EMISSION_FACTORS.diet_meat_day.factor);
  });

  it("train emits less than bus per km", () => {
    expect(EMISSION_FACTORS.train.factor)
      .toBeLessThan(EMISSION_FACTORS.bus.factor);
  });

  it("bus emits less than petrol car per km", () => {
    expect(EMISSION_FACTORS.bus.factor)
      .toBeLessThan(EMISSION_FACTORS.car_petrol.factor);
  });

  it("beef emits more than poultry per kg", () => {
    expect(EMISSION_FACTORS.meat_beef.factor)
      .toBeGreaterThan(EMISSION_FACTORS.meat_pork_poultry.factor);
  });

  it("all factors are positive numbers", () => {
    Object.entries(EMISSION_FACTORS).forEach(([key, { factor }]) => {
      expect(factor, `${key} factor should be positive`).toBeGreaterThan(0);
    });
  });
});

describe("CO2 calculation math", () => {
  it("correctly calculates total for a commute week (5 days x 15km petrol)", () => {
    const dailyKm = 15;
    const days = 5;
    const factor = EMISSION_FACTORS.car_petrol.factor;
    const total = dailyKm * days * factor;
    expect(total).toBeCloseTo(18.0, 1);
  });

  it("correctly calculates monthly electricity bill (300 kWh)", () => {
    const kwh = 300;
    const factor = EMISSION_FACTORS.electricity.factor;
    const total = kwh * factor;
    expect(total).toBeCloseTo(135.0, 1);
  });
});
