import { describe, it, expect } from "vitest";
import { calculateCO2 } from "../lib/carbonCalculator";
import { ActivityType } from "../types";

describe("Carbon Footprint Math Utility - Exhaustive Coverage", () => {
  describe("TRANSPORT Mode", () => {
    const modesAndRates = [
      { mode: "gas_car", rate: 0.20 },
      { mode: "diesel_car", rate: 0.18 },
      { mode: "hybrid_car", rate: 0.10 },
      { mode: "ev", rate: 0.03 },
      { mode: "bus", rate: 0.05 },
      { mode: "train", rate: 0.02 },
      { mode: "motorbike", rate: 0.12 },
      { mode: "bicycle", rate: 0.0 },
      { mode: "walk", rate: 0.0 }
    ] as const;

    modesAndRates.forEach(({ mode, rate }) => {
      it(`calculates transportation logic correctly for ${mode}`, () => {
        const distance = 100;
        const details = { transport: { distance, mode } };
        const { footprint, saved } = calculateCO2(ActivityType.TRANSPORT, details);
        const expectedFootprint = distance * rate;
        const expectedBaseline = distance * 0.20;
        expect(footprint).toBe(Number(expectedFootprint.toFixed(2)));
        expect(saved).toBe(Number(Math.max(0, expectedBaseline - expectedFootprint).toFixed(2)));
      });
    });
  });

  describe("ELECTRICITY Mode", () => {
    const sourcesAndRates = [
      { source: "grid", rate: 0.45 },
      { source: "solar", rate: 0.02 },
      { source: "wind", rate: 0.01 },
      { source: "green_tariff", rate: 0.04 }
    ] as const;

    sourcesAndRates.forEach(({ source, rate }) => {
      it(`calculates electricity emissions correctly for ${source}`, () => {
        const amount = 200;
        const details = { electricity: { amount, source } };
        const { footprint, saved } = calculateCO2(ActivityType.ELECTRICITY, details);
        const expectedFootprint = amount * rate;
        const expectedBaseline = amount * 0.45;
        expect(footprint).toBe(Number(expectedFootprint.toFixed(2)));
        expect(saved).toBe(Number(Math.max(0, expectedBaseline - expectedFootprint).toFixed(2)));
      });
    });
  });

  describe("FOOD Mode", () => {
    const dietTypesAndRates = [
      { dietType: "heavy_meat", rate: 3.0 },
      { dietType: "moderate_meat", rate: 1.8 },
      { dietType: "pescatarian", rate: 1.2 },
      { dietType: "vegetarian", rate: 0.8 },
      { dietType: "vegan", rate: 0.4 }
    ] as const;

    dietTypesAndRates.forEach(({ dietType, rate }) => {
      it(`calculates food diet emissions correctly for ${dietType}`, () => {
        const meals = 10;
        const details = { food: { meals, dietType } };
        const { footprint, saved } = calculateCO2(ActivityType.FOOD, details);
        const expectedFootprint = meals * rate;
        const expectedBaseline = meals * 3.0;
        expect(footprint).toBe(Number(expectedFootprint.toFixed(2)));
        expect(saved).toBe(Number(Math.max(0, expectedBaseline - expectedFootprint).toFixed(2)));
      });
    });
  });

  describe("SHOPPING Mode", () => {
    const categoriesAndRates = [
      { category: "clothing", rate: 0.15 },
      { category: "electronics", rate: 0.45 },
      { category: "furniture", rate: 0.25 },
      { category: "groceries", rate: 0.08 },
      { category: "second_hand", rate: 0.01 }
    ] as const;

    categoriesAndRates.forEach(({ category, rate }) => {
      it(`calculates shopping categories impact correctly for ${category}`, () => {
        const spent = 150;
        const details = { shopping: { spent, category } };
        const { footprint, saved } = calculateCO2(ActivityType.SHOPPING, details);
        const expectedFootprint = spent * rate;
        const expectedBaseline = spent * 0.15;
        expect(footprint).toBe(Number(expectedFootprint.toFixed(2)));
        expect(saved).toBe(Number(Math.max(0, expectedBaseline - expectedFootprint).toFixed(2)));
      });
    });
  });

  describe("FLIGHTS Mode", () => {
    const flightClassesAndRates = [
      { flightClass: "economy", rate: 90 },
      { flightClass: "business", rate: 180 },
      { flightClass: "first", rate: 270 }
    ] as const;

    flightClassesAndRates.forEach(({ flightClass, rate }) => {
      it(`calculates flight offsets properly for class ${flightClass}`, () => {
        const hours = 8;
        const details = { flights: { hours, class: flightClass } };
        const { footprint, saved } = calculateCO2(ActivityType.FLIGHTS, details);
        const expectedFootprint = hours * rate;
        let expectedSaved = 0;
        if (flightClass !== "economy") {
          expectedSaved = Math.max(0, (hours * 270) - expectedFootprint);
        } else {
          expectedSaved = 25;
        }
        expect(footprint).toBe(Number(expectedFootprint.toFixed(2)));
        expect(saved).toBe(Number(expectedSaved.toFixed(2)));
      });
    });
  });

  describe("WATER & WASTE Modes", () => {
    it("calculates water savings based on standard multipliers", () => {
      const liters = 350;
      const details = { water: { liters } };
      const { footprint, saved } = calculateCO2(ActivityType.WATER, details);
      
      const rawFootprint = liters * 0.0003;
      const rawSaved = Math.max(0, (liters * 1.5) * 0.0003 - rawFootprint);
      
      expect(footprint).toBe(Number(rawFootprint.toFixed(2)));
      expect(saved).toBe(Number(rawSaved.toFixed(2)));
    });

    it("calculates recycled and non-recycled waste emissions correctly", () => {
      const recycledDetail = { waste: { weight: 50, recycled: true } };
      const nonRecycledDetail = { waste: { weight: 50, recycled: false } };

      const resRec = calculateCO2(ActivityType.WASTE, recycledDetail);
      expect(resRec.footprint).toBe(50 * 0.1); // 5
      expect(resRec.saved).toBe(50 * 0.8); // 40

      const resNon = calculateCO2(ActivityType.WASTE, nonRecycledDetail);
      expect(resNon.footprint).toBe(50 * 0.9); // 45
      expect(resNon.saved).toBe(0);
    });
  });

  describe("Edge Cases and Fallbacks", () => {
    it("returns zero when detail object is empty or missing required schemas", () => {
      expect(calculateCO2(ActivityType.TRANSPORT, {})).toEqual({ footprint: 0, saved: 0 });
      expect(calculateCO2(ActivityType.TRANSPORT, null)).toEqual({ footprint: 0, saved: 0 });
      expect(calculateCO2(ActivityType.ELECTRICITY, { electricity: null })).toEqual({ footprint: 0, saved: 0 });
    });
  });
});
