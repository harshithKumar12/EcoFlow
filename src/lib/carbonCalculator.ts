import { ActivityType } from "../types";

export interface CO2Result {
  footprint: number;
  saved: number;
}

export function calculateCO2(type: ActivityType | string, details: any): CO2Result {
  let footprint = 0;
  let saved = 0;

  if (!details) {
    return { footprint: 0, saved: 0 };
  }

  const actType = type as ActivityType;

  if (actType === ActivityType.TRANSPORT && details.transport) {
    const { distance = 0, mode = "gas_car" } = details.transport;
    const baselineCo2 = distance * 0.20; // Driving standard gas car baseline

    let rate = 0.20;
    switch (mode) {
      case "gas_car": rate = 0.20; break;
      case "diesel_car": rate = 0.18; break;
      case "hybrid_car": rate = 0.10; break;
      case "ev": rate = 0.03; break;
      case "bus": rate = 0.05; break;
      case "train": rate = 0.02; break;
      case "motorbike": rate = 0.12; break;
      case "bicycle": rate = 0.0; break;
      case "walk": rate = 0.0; break;
    }
    footprint = distance * rate;
    saved = Math.max(0, baselineCo2 - footprint);
  } else if (actType === ActivityType.ELECTRICITY && details.electricity) {
    const { amount = 0, source = "grid" } = details.electricity;
    const baselineCo2 = amount * 0.45; // grid standard baseline
    let rate = 0.45;
    switch (source) {
      case "grid": rate = 0.45; break;
      case "solar": rate = 0.02; break;
      case "wind": rate = 0.01; break;
      case "green_tariff": rate = 0.04; break;
    }
    footprint = amount * rate;
    saved = Math.max(0, baselineCo2 - footprint);
  } else if (actType === ActivityType.FOOD && details.food) {
    const { meals = 0, dietType = "heavy_meat" } = details.food;
    const baselineCo2 = meals * 3.0; // Heavy beef standard baseline
    let rate = 3.0;
    switch (dietType) {
      case "heavy_meat": rate = 3.0; break;
      case "moderate_meat": rate = 1.8; break;
      case "pescatarian": rate = 1.2; break;
      case "vegetarian": rate = 0.8; break;
      case "vegan": rate = 0.4; break;
    }
    footprint = meals * rate;
    saved = Math.max(0, baselineCo2 - footprint);
  } else if (actType === ActivityType.SHOPPING && details.shopping) {
    const { spent = 0, category = "clothing" } = details.shopping;
    const baselineCo2 = spent * 0.15; // standard fast fashion/shopping baseline
    let rate = 0.15;
    switch (category) {
      case "clothing": rate = 0.15; break;
      case "electronics": rate = 0.45; break;
      case "furniture": rate = 0.25; break;
      case "groceries": rate = 0.08; break;
      case "second_hand": rate = 0.01; break;
    }
    footprint = spent * rate;
    saved = Math.max(0, baselineCo2 - footprint);
  } else if (actType === ActivityType.FLIGHTS && details.flights) {
    const { hours = 0, class: flightClass = "economy" } = details.flights;
    let rate = 90; // general economy emission hourly rate
    switch (flightClass) {
      case "economy": rate = 90; break;
      case "business": rate = 180; break;
      case "first": rate = 270; break;
    }
    footprint = hours * rate;
    // choosing economy flight over first class or alternative saves CO2
    saved = flightClass !== "economy" ? Math.max(0, (hours * 270) - footprint) : 25;
  } else if (actType === ActivityType.WATER && details.water) {
    const { liters = 0 } = details.water;
    footprint = liters * 0.0003;
    saved = Math.max(0, (liters * 1.5) * 0.0003 - footprint);
  } else if (actType === ActivityType.WASTE && details.waste) {
    const { weight = 0, recycled = false } = details.waste;
    footprint = weight * (recycled ? 0.1 : 0.9);
    saved = Math.max(0, (weight * 0.9) - footprint);
  }

  return {
    footprint: Number(footprint.toFixed(2)),
    saved: Number(saved.toFixed(2)),
  };
}
