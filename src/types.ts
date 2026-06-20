export enum ActivityType {
  TRANSPORT = "transport",
  ELECTRICITY = "electricity",
  FOOD = "food",
  SHOPPING = "shopping",
  FLIGHTS = "flights",
  WATER = "water",
  WASTE = "waste"
}

export interface TransportActivity {
  distance: number; // in km
  mode: "gas_car" | "diesel_car" | "hybrid_car" | "ev" | "bus" | "train" | "motorbike" | "bicycle" | "walk";
}

export interface ElectricityActivity {
  amount: number; // in kWh
  source: "grid" | "solar" | "wind" | "green_tariff";
}

export interface FoodActivity {
  meals: number; // count
  dietType: "heavy_meat" | "moderate_meat" | "pescatarian" | "vegetarian" | "vegan";
}

export interface ShoppingActivity {
  spent: number; // in USD
  category: "clothing" | "electronics" | "furniture" | "groceries" | "second_hand";
}

export interface FlightActivity {
  hours: number; // flight hours
  class: "economy" | "business" | "first";
}

export interface WaterActivity {
  liters: number;
}

export interface WasteActivity {
  weight: number; // kg
  recycled: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  timestamp: string; // ISO String
  type: ActivityType;
  co2Emoji?: string;
  co2Saved: number; // estimated co2 saved compared to average baseline (kg)
  carbonFootprint: number; // kg CO2e
  details: {
    transport?: TransportActivity;
    electricity?: ElectricityActivity;
    food?: FoodActivity;
    shopping?: ShoppingActivity;
    flights?: FlightActivity;
    water?: WaterActivity;
    waste?: WasteActivity;
  };
  notes?: string;
}

export interface AICoachMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  suggestions?: EcoSuggestion[];
}

export interface EcoSuggestion {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  co2SavedValue: number; // in kg
  category: "transport" | "food" | "energy" | "shopping" | "waste";
}

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  co2Value: number; // potential savings
  points: number;
  completed: boolean;
  category: ActivityType;
}

export interface RouteOption {
  mode: "driving" | "transit" | "walking" | "bicycling";
  distance: number; // km
  duration: string; // friendly duration e.g., "25 mins"
  co2: number; // kg CO2
  savings: number; // comparing against driving
  recommended: boolean;
  pathText: string;
}

export interface CarbonSummary {
  dailyScores: { date: string; value: number }[];
  weeklyBreakdown: { category: string; value: number }[];
  currentDailyFootprint: number;
  weeklyGoal: number;
  totalSavedCo2: number;
  unlockedBadges: string[];
}
