import React, { useState, useEffect } from "react";
import { RouteOption, ActivityType } from "../types";
import {
  Compass,
  MapPin,
  ArrowRight,
  Car,
  Navigation,
  CheckCircle2,
  BookmarkPlus,
  Bus,
  Bike,
  Footprints,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RoutePlannerProps {
  onAddCommuteLog: (type: ActivityType, details: any, notes: string) => void;
}

export default function RoutePlanner({ onAddCommuteLog }: RoutePlannerProps) {
  const [origin, setOrigin] = useState("University Campus Dorms");
  const [destination, setDestination] = useState("Downtown Technology Park");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [mapMode, setMapMode] = useState<"interactive" | "simulated">("interactive");

  const shortcutTrips = [
    { origin: "San Jose Diridon Station", destination: "Palo Alto Caltrain Station" },
    { origin: "Greenwood Suburbs", destination: "Civic Center Office" },
    { origin: "Sunnyvale Town Center", destination: "NASA Ames Research Center" },
  ];

  const handleCalculateRoutes = async (start: string = origin, end: string = destination, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!start.trim() || !end.trim()) return;

    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);
    setFeedback("");

    try {
      const resp = await fetch("/api/route-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: start, destination: end }),
      });
      const data = await resp.json();
      if (data.routes) {
        setRoutes(data.routes);
        // Default select the recommended route
        const rec = data.routes.find((r: RouteOption) => r.recommended) || data.routes[1] || data.routes[0];
        setSelectedRoute(rec);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRoutes("University Campus Dorms", "Downtown Technology Park");
  }, []);

  const handleLogRouteCommute = (route: RouteOption) => {
    let modeLabel = "gas_car";
    if (route.mode === "transit") modeLabel = "train";
    else if (route.mode === "bicycling") modeLabel = "bicycle";
    else if (route.mode === "walking") modeLabel = "walk";

    const details = {
      transport: {
        distance: route.distance,
        mode: modeLabel,
      },
    };

    const notes = `Saved ${route.savings} kg carbon by taking the ${route.mode} instead of solo driving from ${origin} to ${destination}!`;

    onAddCommuteLog(ActivityType.TRANSPORT, details, notes);
    setFeedback(`Successfully registered ${route.mode} ride commute! Saved ${route.savings}kg offset CO₂.`);
    setTimeout(() => setFeedback(""), 4000);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "driving": return Car;
      case "transit": return Bus;
      case "bicycling": return Bike;
      default: return Footprints;
    }
  };

  return (
    <div id="route-planner-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Route Inputs Form */}
      <div className="lg:col-span-4 bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/95 shadow-sm rounded-2xl p-5 space-y-4 h-fit">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Eco-Route Planner</span>
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
            Compare travel pathways using actual transit alternatives and see potential carbon savings before committing your trip.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculateRoutes();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="route-origin-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Trip Starting Origin
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="route-origin-input"
                type="text"
                placeholder="Starting street, station, or building..."
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-slate-350 shadow-inner transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="route-destination-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Destination Point
            </label>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="route-destination-input"
                type="text"
                placeholder="Arriving terminal or city zone..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-810 placeholder-slate-400 focus:outline-none focus:border-slate-350 shadow-inner transition"
              />
            </div>
          </div>

          <button
            id="route-calculate-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 hover:border-emerald-400 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{loading ? "Searching Green matrix..." : "Analyze Route Alternatives"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Shortcut Presets */}
        <div className="pt-2">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Try Quick Demos
          </span>
          <div className="space-y-1.5">
            {shortcutTrips.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOrigin(sc.origin);
                  setDestination(sc.destination);
                  handleCalculateRoutes(sc.origin, sc.destination);
                }}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200/80 text-left px-3.5 py-2.5 rounded-xl text-[10px] text-slate-550 hover:text-slate-800 transition truncate flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-semibold text-emerald-600">Drive:</span>
                <span>{sc.origin.split(" ")[0]} ➔ {sc.destination.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Graphics & Comparison Dashboard */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Simulated Map Visual panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden relative min-h-[340px] flex flex-col justify-between shadow-sm">
          {/* Header route indicators & Toggle buttons */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md px-3 py-2 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold">Active Path Tracking</div>
              <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5 flex-wrap">
                <span>{origin || "Point A"}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{destination || "Point B"}</span>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-1 border border-slate-200 shadow-md rounded-xl flex self-start sm:self-center gap-1">
              <button
                id="map-mode-interactive-btn"
                type="button"
                onClick={() => setMapMode("interactive")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${
                  mapMode === "interactive"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                🗺️ Live Map
              </button>
              <button
                id="map-mode-simulated-btn"
                type="button"
                onClick={() => setMapMode("simulated")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${
                  mapMode === "simulated"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-650 hover:bg-slate-50"
                }`}
              >
                🍃 Co2 Vectors
              </button>
            </div>
          </div>

          {/* Interactive Google Map vs Simulated Canvas Container */}
          <div className="relative w-full h-[280px] sm:h-[300px] bg-slate-100 flex items-center justify-center">
            {mapMode === "interactive" ? (
              <iframe
                id="google-maps-iframe"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(origin)}+to+${encodeURIComponent(destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
                title="Google Maps Router Directions"
              ></iframe>
            ) : (
              <div className="bg-slate-50/10 absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                {/* SVG Roads & Dashlines Representation */}
                <svg className="w-full h-full opacity-90" viewBox="0 0 600 300">
                  <defs>
                    <pattern id="grid-map" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    </pattern>
                    <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
                      <circle cx="5" cy="5" r="5" fill="#10b981" />
                    </marker>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-map)" />

                  {/* Grid Road vectors representing simulated landscape */}
                  <line x1="10" y1="50" x2="590" y2="50" stroke="#e2e8f0" strokeWidth="2" />
                  <line x1="80" y1="10" x2="80" y2="290" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="300" y1="10" x2="300" y2="290" stroke="#e2e8f0" strokeWidth="1.5" />
                  <line x1="10" y1="210" x2="590" y2="210" stroke="#e2e8f0" strokeWidth="2.5" />

                  {/* Forest reserve polygons green */}
                  <rect x="360" y="80" width="120" height="80" rx="10" fill="#e6f4ea" opacity="0.9" stroke="#ceead6" strokeWidth="1" />
                  <text x="420" y="125" fill="#137333" fontSize="9.5" fontWeight="bold" textAnchor="middle" opacity="0.9">
                    Eco Green Reserve
                  </text>

                  {routes.length > 0 && (
                    <>
                      {/* Driving Route Red line */}
                      {selectedRoute?.mode === "driving" && (
                        <motion.path
                          d="M 100 210 Q 300 120 450 70"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3.5"
                          strokeDasharray="4 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5 }}
                        />
                      )}

                      {/* Public Transit Green dashed line */}
                      {selectedRoute?.mode === "transit" && (
                        <motion.path
                          d="M 100 210 C 220 210 220 50 450 70"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5 }}
                        />
                      )}

                      {/* Bicycling Scenic path */}
                      {selectedRoute?.mode === "bicycling" && (
                        <motion.path
                          d="M 100 210 L 180 210 L 300 130 L 450 70"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray="6 3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.8 }}
                        />
                      )}

                      {/* Walking shortest walkway */}
                      {selectedRoute?.mode === "walking" && (
                        <motion.path
                          d="M 100 210 L 300 210 L 450 70"
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="2.5"
                          strokeDasharray="2 3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2 }}
                        />
                      )}

                      {/* Node Pins */}
                      <circle cx="100" cy="210" r="7" fill="#137333" stroke="#e6f4ea" strokeWidth="2" />
                      <circle cx="450" cy="70" r="7" fill="#c5221f" stroke="#fce8e6" strokeWidth="2" />
                      <text x="100" y="235" fill="#137333" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        Origin (Start)
                      </text>
                      <text x="450" y="50" fill="#c5221f" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                        Destination (End)
                      </text>
                    </>
                  )}
                </svg>
              </div>
            )}
          </div>

          {/* Prompt/Guide details inside map frame */}
          <div className="z-10 bg-white/95 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 mt-auto shadow-inner rounded-b-2xl">
            {routes.length === 0 ? (
              <span className="text-slate-400 font-medium">Please calculate to load standard simulation vectors.</span>
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-800 capitalize animate-pulse">{selectedRoute?.mode} Directions:</span>
                <span className="text-[11px] text-slate-500 leading-snug">{selectedRoute?.pathText}</span>
              </div>
            )}
            {selectedRoute && (
              <div className="text-right shrink-0 ml-4 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                <span className="block text-[8px] text-slate-400 font-bold">EMISSIONS</span>
                <span className="text-xs font-bold text-emerald-800">
                  {selectedRoute.co2 === 0 ? "0.0 kg" : `${selectedRoute.co2} kg CO₂e`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback popups */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison list */}
        {routes.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-500 px-1">Available Route alternatives:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {routes.map((route) => {
                const IconComp = getModeIcon(route.mode);
                const isSelected = selectedRoute?.mode === route.mode;
                return (
                  <div
                    key={route.mode}
                    onClick={() => setSelectedRoute(route)}
                    className={`p-4 border rounded-xl flex flex-col justify-between cursor-pointer transition duration-300 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-gradient-to-b from-white to-slate-50/50 text-slate-600 hover:border-slate-350 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-2 rounded-lg shrink-0 ${
                          isSelected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold capitalize text-slate-800">{route.mode}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            {route.distance} km • {route.duration}
                          </div>
                        </div>
                      </div>

                      {route.recommended && (
                        <span className="text-[8.5px] font-bold px-2 py-0.5 bg-emerald-105 text-emerald-700 border border-emerald-200 rounded-full uppercase tracking-wider">
                          Rec
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Net CO₂</span>
                        <span className="text-xs font-bold text-slate-800">
                          {route.co2 === 0 ? "0.0 kg (Zero)" : `${route.co2} kg`}
                        </span>
                      </div>

                      {route.savings > 0 ? (
                        <div className="text-right">
                          <span className="block text-[8.5px] text-emerald-600 font-bold uppercase">Carbon Saved</span>
                          <span className="text-xs font-bold text-emerald-600">-{route.savings} kg</span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Baseline</span>
                          <span className="text-xs text-slate-550">-</span>
                        </div>
                      )}
                    </div>

                    {route.mode !== "driving" && isSelected && (
                      <button
                        id={`log-commute-${route.mode}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogRouteCommute(route);
                        }}
                        className="mt-3.5 w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-[10px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Add this transit path to daily carbon records"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Log Trip Savings</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
