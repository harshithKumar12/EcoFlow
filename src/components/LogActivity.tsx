import React, { useState, useEffect } from "react";
import { ActivityType } from "../types";
import {
  Car,
  Lightbulb,
  UtensilsCrossed,
  ShoppingBag,
  Plane,
  Droplet,
  Trash2,
  BookmarkPlus,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LogActivityProps {
  onAddLog: (type: ActivityType, details: any, notes: string) => void;
}

export default function LogActivity({ onAddLog }: LogActivityProps) {
  const [activeTab, setActiveTab] = useState<ActivityType>(ActivityType.TRANSPORT);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [distance, setDistance] = useState(15);
  const [transportMode, setTransportMode] = useState<
    "gas_car" | "diesel_car" | "hybrid_car" | "ev" | "bus" | "train" | "motorbike" | "bicycle" | "walk"
  >("gas_car");

  const [kwh, setKwh] = useState(12);
  const [energySource, setEnergySource] = useState<"grid" | "solar" | "wind" | "green_tariff">("grid");

  const [meals, setMeals] = useState(2);
  const [dietType, setDietType] = useState<
    "heavy_meat" | "moderate_meat" | "pescatarian" | "vegetarian" | "vegan"
  >("moderate_meat");

  const [spent, setSpent] = useState(30);
  const [shopCategory, setShopCategory] = useState<
    "clothing" | "electronics" | "furniture" | "groceries" | "second_hand"
  >("groceries");

  const [flightHours, setFlightHours] = useState(4);
  const [flightClass, setFlightClass] = useState<"economy" | "business" | "first">("economy");

  const [liters, setLiters] = useState(150);

  const [wasteWeight, setWasteWeight] = useState(5);
  const [isRecycled, setIsRecycled] = useState(true);

  // Real-Time Pre-estimation logic for quick feedback
  const [estFootprint, setEstFootprint] = useState(0);
  const [estSaved, setEstSaved] = useState(0);

  useEffect(() => {
    let fp = 0;
    let sv = 0;

    switch (activeTab) {
      case ActivityType.TRANSPORT:
        const baseTrans = distance * 0.20;
        let tRate = 0.20;
        if (transportMode === "gas_car") tRate = 0.20;
        else if (transportMode === "diesel_car") tRate = 0.18;
        else if (transportMode === "hybrid_car") tRate = 0.10;
        else if (transportMode === "ev") tRate = 0.03;
        else if (transportMode === "bus") tRate = 0.05;
        else if (transportMode === "train") tRate = 0.02;
        else if (transportMode === "motorbike") tRate = 0.12;
        else if (transportMode === "bicycle" || transportMode === "walk") tRate = 0.0;

        fp = distance * tRate;
        sv = Math.max(0, baseTrans - fp);
        break;

      case ActivityType.ELECTRICITY:
        const baseGrid = kwh * 0.45;
        let eRate = 0.45;
        if (energySource === "grid") eRate = 0.45;
        else if (energySource === "solar") eRate = 0.02;
        else if (energySource === "wind") eRate = 0.01;
        else if (energySource === "green_tariff") eRate = 0.04;

        fp = kwh * eRate;
        sv = Math.max(0, baseGrid - fp);
        break;

      case ActivityType.FOOD:
        const baseMeat = meals * 3.0;
        let fRate = 3.0;
        if (dietType === "heavy_meat") fRate = 3.0;
        else if (dietType === "moderate_meat") fRate = 1.8;
        else if (dietType === "pescatarian") fRate = 1.2;
        else if (dietType === "vegetarian") fRate = 0.8;
        else if (dietType === "vegan") fRate = 0.4;

        fp = meals * fRate;
        sv = Math.max(0, baseMeat - fp);
        break;

      case ActivityType.SHOPPING:
        const baseShop = spent * 0.15;
        let sRate = 0.15;
        if (shopCategory === "clothing") sRate = 0.15;
        else if (shopCategory === "electronics") sRate = 0.45;
        else if (shopCategory === "furniture") sRate = 0.25;
        else if (shopCategory === "groceries") sRate = 0.08;
        else if (shopCategory === "second_hand") sRate = 0.01;

        fp = spent * sRate;
        sv = Math.max(0, baseShop - fp);
        break;

      case ActivityType.FLIGHTS:
        let flRate = 90;
        if (flightClass === "economy") flRate = 90;
        else if (flightClass === "business") flRate = 180;
        else if (flightClass === "first") flRate = 270;

        fp = flightHours * flRate;
        sv = flightClass !== "economy" ? Math.max(0, (flightHours * 270) - fp) : 25;
        break;

      case ActivityType.WATER:
        fp = liters * 0.0003;
        sv = Math.max(0, (liters * 1.5) * 0.0003 - fp);
        break;

      case ActivityType.WASTE:
        fp = wasteWeight * (isRecycled ? 0.1 : 0.9);
        sv = Math.max(0, (wasteWeight * 0.9) - fp);
        break;
    }

    setEstFootprint(Number(fp.toFixed(2)));
    setEstSaved(Number(sv.toFixed(2)));
  }, [
    activeTab,
    distance,
    transportMode,
    kwh,
    energySource,
    meals,
    dietType,
    spent,
    shopCategory,
    flightHours,
    flightClass,
    liters,
    wasteWeight,
    isRecycled,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let details: any = {};
    let categoryNote = notes;

    switch (activeTab) {
      case ActivityType.TRANSPORT:
        details = { transport: { distance, mode: transportMode } };
        if (!categoryNote) {
          categoryNote = `Commuted ${distance} km via ${transportMode.replace("_", " ")}.`;
        }
        break;
      case ActivityType.ELECTRICITY:
        details = { electricity: { amount: kwh, source: energySource } };
        if (!categoryNote) {
          categoryNote = `Used ${kwh} kWh of electricity with clean ${energySource} generation source.`;
        }
        break;
      case ActivityType.FOOD:
        details = { food: { meals, dietType } };
        if (!categoryNote) {
          categoryNote = `Consumed ${meals} healthy meals on a lovely ${dietType.replace("_", " ")} diet option.`;
        }
        break;
      case ActivityType.SHOPPING:
        details = { shopping: { spent, category: shopCategory } };
        if (!categoryNote) {
          categoryNote = `Spent $${spent} on green ${shopCategory.replace("_", " ")} lifestyle accessories.`;
        }
        break;
      case ActivityType.FLIGHTS:
        details = { flights: { hours: flightHours, class: flightClass } };
        if (!categoryNote) {
          categoryNote = `Logged ${flightHours} flight emissions in comfortable ${flightClass} cabin space.`;
        }
        break;
      case ActivityType.WATER:
        details = { water: { liters } };
        if (!categoryNote) {
          categoryNote = `Consumed around ${liters} liters of fresh water daily conservation style.`;
        }
        break;
      case ActivityType.WASTE:
        details = { waste: { weight: wasteWeight, recycled: isRecycled } };
        if (!categoryNote) {
          categoryNote = `Separated ${wasteWeight} kg of trash containing recyclable items? ${isRecycled ? "Yes" : "No"}.`;
        }
        break;
    }

    // Call callback to parent
    setTimeout(() => {
      onAddLog(activeTab, details, categoryNote);
      setNotes("");
      setIsSubmitting(false);
    }, 300);
  };

  const tabsConfig = [
    { value: ActivityType.TRANSPORT, label: "Transport", icon: Car, color: "text-emerald-650 bg-emerald-50/70", selectedClass: "border-emerald-500 bg-emerald-500/10 text-emerald-700 shadow-sm font-extrabold" },
    { value: ActivityType.ELECTRICITY, label: "Energy", icon: Lightbulb, color: "text-amber-655 bg-amber-50/70", selectedClass: "border-amber-500 bg-amber-500/10 text-amber-700 shadow-sm font-extrabold" },
    { value: ActivityType.FOOD, label: "Food Diet", icon: UtensilsCrossed, color: "text-blue-650 bg-blue-50/70", selectedClass: "border-blue-500 bg-blue-500/10 text-blue-700 shadow-sm font-extrabold" },
    { value: ActivityType.SHOPPING, label: "Shopping", icon: ShoppingBag, color: "text-violet-650 bg-violet-50/70", selectedClass: "border-violet-500 bg-violet-500/10 text-violet-700 shadow-sm font-extrabold" },
    { value: ActivityType.FLIGHTS, label: "Flights", icon: Plane, color: "text-pink-650 bg-pink-50/70", selectedClass: "border-pink-500 bg-pink-500/10 text-pink-700 shadow-sm font-extrabold" },
    { value: ActivityType.WATER, label: "Water", icon: Droplet, color: "text-cyan-650 bg-cyan-50/70", selectedClass: "border-cyan-500 bg-cyan-500/10 text-cyan-700 shadow-sm font-extrabold" },
    { value: ActivityType.WASTE, label: "Waste", icon: Trash2, color: "text-slate-650 bg-slate-100", selectedClass: "border-slate-500 bg-slate-500/10 text-slate-705 shadow-sm font-extrabold" },
  ];

  return (
    <div id="log-activity-form" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category selector panel */}
      <div className="lg:col-span-1 bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/90 shadow-sm rounded-2xl p-5 flex flex-col gap-1.5 h-fit">
        <h3 className="text-sm font-bold text-slate-505 px-2.5 mb-2">Category selection</h3>
        {tabsConfig.map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.value;
          return (
            <button
              id={`tab-btn-${tab.value}`}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl border text-left transition cursor-pointer duration-300 ${
                isSelected
                  ? tab.selectedClass
                  : "border-transparent bg-transparent text-slate-500 hover:border-slate-200/60 hover:text-slate-800 hover:bg-slate-100/40"
              }`}
              type="button"
            >
              <span className={`p-2 rounded-lg ${tab.color} shrink-0 shadow-sm`}>
                <IconComp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Fields Panel */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/90 shadow-sm rounded-2xl p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === ActivityType.TRANSPORT && (
              <motion.div
                key="transport-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Commute Transportation Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "gas_car", label: "Solo Gas Car" },
                      { value: "diesel_car", label: "Diesel Car" },
                      { value: "hybrid_car", label: "Hybrid" },
                      { value: "ev", label: "Tesla/EV" },
                      { value: "bus", label: "City Bus" },
                      { value: "train", label: "Metro/Train" },
                      { value: "motorbike", label: "Motorbike" },
                      { value: "bicycle", label: "Cycling" },
                      { value: "walk", label: "Walking" },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setTransportMode(mode.value as any)}
                        className={`py-2 px-3 border text-[11px] font-bold rounded-xl text-center cursor-pointer transition ${
                          transportMode === mode.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-350 hover:text-slate-800"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      One-way commute Distance
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">{distance} km</span>
                  </div>
                  <input
                    id="transport-distance-range"
                    type="range"
                    min="1"
                    max="150"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 km</span>
                    <span>75 km</span>
                    <span>150 km</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.ELECTRICITY && (
              <motion.div
                key="energy-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Electricity Supplier Source
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { value: "grid", desc: "Standard Coal/Gas Grid mix", label: "Standard Coal Grid" },
                      { value: "solar", desc: "Local rooftop Solar panels", label: "Rooftop Solar" },
                      { value: "wind", desc: "Dedicated wind credit tariff", label: "Wind Offset" },
                      { value: "green_tariff", desc: "Green green energy provider utility", label: "Green Certified Utility" },
                    ].map((src) => (
                      <button
                        key={src.value}
                        type="button"
                        onClick={() => setEnergySource(src.value as any)}
                        className={`p-3 border rounded-xl text-left transition flex flex-col justify-between cursor-pointer ${
                          energySource === src.value
                            ? "border-amber-500 bg-amber-50 text-amber-600 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-350 hover:text-slate-705"
                        }`}
                      >
                        <span className="text-xs font-bold">{src.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          {src.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Calculated Power Usage
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">{kwh} kWh</span>
                  </div>
                  <input
                    id="electricity-usage-range"
                    type="range"
                    min="1"
                    max="60"
                    value={kwh}
                    onChange={(e) => setKwh(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 kWh</span>
                    <span>30 kWh</span>
                    <span>60 kWh</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.FOOD && (
              <motion.div
                key="food-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Active Diet Protocol
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    {[
                      { value: "heavy_meat", desc: "Beef, steak, heavy lamb daily", label: "High Beef" },
                      { value: "moderate_meat", desc: "Moderate chicken, seafood or pork", label: "Mod Meat" },
                      { value: "pescatarian", desc: "Fish, eggs, cheeses, vegetables", label: "Pesca" },
                      { value: "vegetarian", desc: "Paneer, dairy proteins, soy proteins", label: "Veggie" },
                      { value: "vegan", desc: "Entirely plant-based organic foods", label: "Strict Vegan" },
                    ].map((diet) => (
                      <button
                        key={diet.value}
                        type="button"
                        onClick={() => setDietType(diet.value as any)}
                        className={`py-2.5 px-2 border text-[11px] font-bold rounded-xl text-center cursor-pointer transition ${
                          dietType === diet.value
                            ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-550 hover:border-slate-355"
                        }`}
                      >
                        {diet.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Count of Daily Meals
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">{meals} meal(s)</span>
                  </div>
                  <input
                    id="food-meals-range"
                    type="range"
                    min="1"
                    max="5"
                    value={meals}
                    onChange={(e) => setMeals(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.SHOPPING && (
              <motion.div
                key="shopping-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Shopping Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "clothing", label: "Fast Clothing & Apparel" },
                      { value: "electronics", label: "Electronics & New Hardware" },
                      { value: "furniture", label: "Home Decor & Furniture" },
                      { value: "groceries", label: "Organic General Groceries" },
                      { value: "second_hand", label: "Thrift & Second Hand" },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setShopCategory(cat.value as any)}
                        className={`p-3 border rounded-xl text-left text-xs font-bold tracking-tight cursor-pointer transition ${
                          shopCategory === cat.value
                            ? "border-violet-500 bg-violet-50 text-violet-600 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-550 hover:border-slate-350"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Money Spend Amount (USD)
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">${spent}</span>
                  </div>
                  <input
                    id="shopping-spend-range"
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={spent}
                    onChange={(e) => setSpent(Number(e.target.value))}
                    className="w-full accent-violet-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.FLIGHTS && (
              <motion.div
                key="flights-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Cabin Class Allocation
                    </label>
                    <div className="flex flex-col gap-2">
                      {[
                        { value: "economy", label: "Economy Flight Share" },
                        { value: "business", label: "Business Class seating" },
                        { value: "first", label: "First Class Luxury suite" },
                      ].map((cl) => (
                        <button
                          key={cl.value}
                          type="button"
                          onClick={() => setFlightClass(cl.value as any)}
                          className={`p-3 border rounded-xl text-left text-xs font-bold cursor-pointer transition ${
                            flightClass === cl.value
                              ? "border-pink-500 bg-pink-50 text-pink-650 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-550 hover:border-slate-350"
                          }`}
                        >
                          {cl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Estimated Flight Duration
                      </label>
                      <span className="text-xs text-slate-800 font-mono font-bold">{flightHours} hrs</span>
                    </div>
                    <input
                      id="flight-hours-range"
                      type="range"
                      min="1"
                      max="15"
                      value={flightHours}
                      onChange={(e) => setFlightHours(Number(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500 leading-snug mt-4 bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        First & Business class occupy larger footprints, hence their calculated emissions multiplier is 2x to 3x higher compared to standard Economy cabins.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.WATER && (
              <motion.div
                key="water-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Daily Water Intake/Use (Liters)
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">{liters} L</span>
                  </div>
                  <input
                    id="water-liters-range"
                    type="range"
                    min="10"
                    max="600"
                    step="10"
                    value={liters}
                    onChange={(e) => setLiters(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>10 L (Quick wash)</span>
                    <span>300 L (Avg household)</span>
                    <span>600 L (High garden yard)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === ActivityType.WASTE && (
              <motion.div
                key="waste-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Total Discarded Trash Weight
                    </label>
                    <span className="text-xs text-slate-800 font-mono font-bold">{wasteWeight} kg</span>
                  </div>
                  <input
                    id="waste-weight-range"
                    type="range"
                    min="1"
                    max="40"
                    value={wasteWeight}
                    onChange={(e) => setWasteWeight(Number(e.target.value))}
                    className="w-full accent-slate-500 bg-slate-100 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <input
                    id="waste-recycled-checkbox"
                    type="checkbox"
                    checked={isRecycled}
                    onChange={(e) => setIsRecycled(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-500 accent-emerald-500 bg-white cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="waste-recycled-checkbox"
                      className="text-xs font-bold text-slate-850 cursor-pointer"
                    >
                      Strict Recycle & Composting Separation
                    </label>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      Properly sorting compostables, plastics, metals cuts landfill emissions multipliers from 0.9kg to 0.1kg.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes textbox section */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Personal Reflection Notes (Optional)
            </label>
            <input
              id="log-notes-input"
              type="text"
              placeholder="e.g. Swapped commuting route to avoid gridlock noise..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          {/* Real-Time Carbon Footprint Previews */}
          <div className="bg-gradient-to-r from-teal-50/20 via-slate-50 to-emerald-50/20 rounded-2xl p-5 flex items-center justify-between border border-slate-200/90 shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Calculation Value
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-950 font-sans tracking-tight">
                  {estFootprint}
                </span>
                <span className="text-xs font-semibold text-slate-500">kg CO₂e</span>
              </div>
            </div>

            {estSaved > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Est. Saved Offset
                </span>
                <div className="flex items-baseline gap-1 mt-0.5 text-emerald-650">
                  <span className="text-2xl font-extrabold font-sans">-{estSaved}</span>
                  <span className="text-[10px] font-bold">kg</span>
                </div>
              </div>
            )}
          </div>

          <button
            id="publish-log-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-500 hover:to-teal-600 active:scale-98 text-white text-xs font-extrabold py-3.5 px-4 rounded-xl transition cursor-pointer shadow-md shadow-emerald-650/15"
          >
            <BookmarkPlus className="w-4.5 h-4.5 shrink-0" />
            <span>{isSubmitting ? "Publishing track..." : "Publish To Carbon Ledger"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
