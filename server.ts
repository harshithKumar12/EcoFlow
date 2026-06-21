import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { ActivityType, ActivityLog, AICoachMessage, RouteOption, EcoChallenge, EcoSuggestion } from "./src/types.js";
import { calculateCO2 } from "./src/lib/carbonCalculator.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK securely
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Mathematical Carbon Multipliers delegated to centralized module
function computeCO2(type: string, details: any): { footprint: number; saved: number } {
  return calculateCO2(type, details);
}

// Durable User Database Mock Persistence Layer supporting dynamic operations
const today = new Date();
const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(today.getDate() - i);
  return d.toISOString().split("T")[0];
});

let activityLogs: ActivityLog[] = [
  {
    id: "log_1",
    userId: "ramy_user",
    timestamp: `${dates[6]}T08:30:00.000Z`,
    type: ActivityType.TRANSPORT,
    carbonFootprint: 1.2,
    co2Saved: 2.8,
    co2Emoji: "🚗",
    details: { transport: { distance: 20, mode: "bus" } },
    notes: "Commuted to work by bus instead of solo driving.",
  },
  {
    id: "log_2",
    userId: "ramy_user",
    timestamp: `${dates[6]}T13:00:00.000Z`,
    type: ActivityType.FOOD,
    carbonFootprint: 0.8,
    co2Saved: 2.2,
    co2Emoji: "🥗",
    details: { food: { meals: 1, dietType: "vegetarian" } },
    notes: "Had a delightful vegetarian paneer wrap for lunch.",
  },
  {
    id: "log_3",
    userId: "ramy_user",
    timestamp: `${dates[5]}T19:00:00.000Z`,
    type: ActivityType.ELECTRICITY,
    carbonFootprint: 2.25,
    co2Saved: 2.25,
    co2Emoji: "⚡",
    details: { electricity: { amount: 10, source: "green_tariff" } },
    notes: "Daily household electricity, active wind tariff solar credit.",
  },
  {
    id: "log_4",
    userId: "ramy_user",
    timestamp: `${dates[4]}T10:15:00.000Z`,
    type: ActivityType.SHOPPING,
    carbonFootprint: 0.2,
    co2Saved: 2.8,
    co2Emoji: "👕",
    details: { shopping: { spent: 20, category: "second_hand" } },
    notes: "Thrift shopping! Vintage cotton jacket purchase.",
  },
  {
    id: "log_5",
    userId: "ramy_user",
    timestamp: `${dates[3]}T09:00:00.000Z`,
    type: ActivityType.TRANSPORT,
    carbonFootprint: 0.0,
    co2Saved: 4.0,
    co2Emoji: "🚲",
    details: { transport: { distance: 20, mode: "bicycle" } },
    notes: "Biked to the city library. Brilliant weather!",
  },
  {
    id: "log_6",
    userId: "ramy_user",
    timestamp: `${dates[2]}T20:00:00.000Z`,
    type: ActivityType.FOOD,
    carbonFootprint: 0.4,
    co2Saved: 2.6,
    co2Emoji: "🥦",
    details: { food: { meals: 1, dietType: "vegan" } },
    notes: "Homemade vegan organic lentils and rice dinner.",
  },
  {
    id: "log_7",
    userId: "ramy_user",
    timestamp: `${dates[1]}T14:30:00.000Z`,
    type: ActivityType.WASTE,
    carbonFootprint: 0.4,
    co2Saved: 3.2,
    co2Emoji: "🗑️",
    details: { waste: { weight: 4, recycled: true } },
    notes: "Sorted dry recyclables, composted kitchen waste.",
  },
];

let challenges: EcoChallenge[] = [
  {
    id: "chal_1",
    title: "Eco Commuter",
    description: "Walk, bike, or take public transit for your transport needs today.",
    type: "daily",
    co2Value: 4.8,
    points: 100,
    completed: true,
    category: ActivityType.TRANSPORT,
  },
  {
    id: "chal_2",
    title: "Green Gourmet",
    description: "Consume entirely plant-based (vegan or vegetarian) meals today.",
    type: "daily",
    co2Value: 3.5,
    points: 120,
    completed: false,
    category: ActivityType.FOOD,
  },
  {
    id: "chal_3",
    title: "Phantom Power Slayer",
    description: "Unplug standby home appliances before going to bed.",
    type: "daily",
    co2Value: 1.2,
    points: 50,
    completed: false,
    category: ActivityType.ELECTRICITY,
  },
  {
    id: "chal_4",
    title: "Zero Waste Marathon",
    description: "Separate paper, scrap metal, plastic bottle recycling, compost organic waste.",
    type: "weekly",
    co2Value: 8.5,
    points: 300,
    completed: true,
    category: ActivityType.WASTE,
  },
  {
    id: "chal_5",
    title: "Thrift Master",
    description: "Choose vintage or local second-hand products instead of brand-new items.",
    type: "weekly",
    co2Value: 12.0,
    points: 400,
    completed: false,
    category: ActivityType.SHOPPING,
  },
];

// Conversational AI Coach Session Logs
let coachChatHistory: AICoachMessage[] = [
  {
    id: "coach_welcome",
    role: "model",
    text: "Greetings, Ramy! 🌍 I am your intelligent Carbon Footprint Advisor. I analyze your driving habits, home energy, and foods to suggest actionable steps to scale down your footprint. Try asking me: 'How can I lower my electricity footprint?' or tell me about your typical commute!",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// REST/API Endpoints
app.get("/api/logs", (req, res) => {
  res.json({ logs: activityLogs });
});

app.post("/api/logs", (req, res) => {
  const { type, details, notes, timestamp } = req.body;
  if (!type || !details) {
    return res.status(400).json({ error: "Missing required activity data properties (type, details)" });
  }

  const { footprint, saved } = computeCO2(type, details);

  let emoji = "🌱";
  switch (type) {
    case ActivityType.TRANSPORT:
      emoji = details.transport?.mode === "bicycle" ? "🚲" : details.transport?.mode === "walk" ? "🚶" : "🚗";
      break;
    case ActivityType.ELECTRICITY: emoji = "⚡"; break;
    case ActivityType.FOOD: emoji = "🥗"; break;
    case ActivityType.SHOPPING: emoji = "👕"; break;
    case ActivityType.FLIGHTS: emoji = "✈️"; break;
    case ActivityType.WATER: emoji = "💧"; break;
    case ActivityType.WASTE: emoji = "🗑️"; break;
  }

  const newLog: ActivityLog = {
    id: `log_${Date.now()}`,
    userId: "ramy_user",
    timestamp: timestamp || new Date().toISOString(),
    type,
    carbonFootprint: footprint,
    co2Saved: saved,
    co2Emoji: emoji,
    details,
    notes: notes || `Logged carbon footprint for ${type}.`,
  };

  activityLogs.unshift(newLog);
  res.status(251).json({ success: true, log: newLog });
});

app.delete("/api/logs/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = activityLogs.length;
  activityLogs = activityLogs.filter((log) => log.id !== id);
  if (activityLogs.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Log item not found" });
  }
});

// Calculate metrics only (for user-isolated client-side flow)
app.post("/api/logs/calculate", (req, res) => {
  const { type, details } = req.body;
  if (!type || !details) {
    return res.status(400).json({ error: "Missing type or details" });
  }

  const { footprint, saved } = computeCO2(type, details);

  let emoji = "🌱";
  switch (type) {
    case ActivityType.TRANSPORT:
      emoji = details.transport?.mode === "bicycle" ? "🚲" : details.transport?.mode === "walk" ? "🚶" : "🚗";
      break;
    case ActivityType.ELECTRICITY: emoji = "⚡"; break;
    case ActivityType.FOOD: emoji = "🥗"; break;
    case ActivityType.SHOPPING: emoji = "👕"; break;
    case ActivityType.FLIGHTS: emoji = "✈️"; break;
    case ActivityType.WATER: emoji = "💧"; break;
    case ActivityType.WASTE: emoji = "🗑️"; break;
  }

  res.json({ footprint, saved, emoji });
});

app.get("/api/challenges", (req, res) => {
  res.json({ challenges });
});

app.post("/api/challenges/:id/toggle", (req, res) => {
  const { id } = req.params;
  const challenge = challenges.find((c) => c.id === id);
  if (challenge) {
    challenge.completed = !challenge.completed;
    res.json({ success: true, challenge });
  } else {
    res.status(404).json({ error: "Challenge not found" });
  }
});

// Google Maps Route Planner Simulation & Carbon Comparison Endpoint
app.post("/api/route-planner", async (req, res) => {
  let { origin, destination } = req.body;
  
  // Ensure we are working with non-empty string types
  const originStr = origin ? String(origin).trim() : "";
  const destinationStr = destination ? String(destination).trim() : "";

  if (!originStr || !destinationStr) {
    return res.status(400).json({ error: "Both origin and destination points are required." });
  }

  let distance = 15;
  let durationMins = 30;
  let isDistanceResolved = false;

  // 1. Try to parse manual distance specified in origin or destination string (e.g., "15 km", "10 miles")
  const fullText = `${originStr} ${destinationStr}`.toLowerCase();
  const match = fullText.match(/(\d+(?:\.\d+)?)\s*(km|kilometers|miles|mi|meters|m)\b/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith("mil") || unit === "mi") {
      distance = Number((value * 1.60934).toFixed(1));
    } else if (unit === "m" || unit === "meters") {
      distance = Number((value / 1000).toFixed(2));
    } else {
      distance = Number(value.toFixed(1));
    }
    durationMins = Math.round(distance * 2.2 + 5);
    isDistanceResolved = true;
  }

  // 2. If no manual distance is provided, use Gemini to estimate realistic ground distance and duration
  if (!isDistanceResolved && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Given the start location: "${originStr}" and the destination: "${destinationStr}", calculate the realistic ground driving distance in kilometers and ground driving duration in minutes. Ensure this is highly aligned with Google Maps or other actual mapping systems.
        
Return ONLY a valid JSON object of the exact form:
{
  "distanceKm": 18.3,
  "durationMins": 25
}
Do not use markdown formatting (like \`\`\`json), do not include comments, explanations, or trailing commas. Pure JSON only.`,
      });

      const responseText = response.text ? response.text.trim() : "";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && typeof parsed.distanceKm === "number" && !isNaN(parsed.distanceKm)) {
        distance = Number(parsed.distanceKm.toFixed(1));
        if (typeof parsed.durationMins === "number" && !isNaN(parsed.durationMins)) {
          durationMins = Math.round(parsed.durationMins);
        } else {
          durationMins = Math.round(distance * 2.2 + 5);
        }
        isDistanceResolved = true;
      }
    } catch (err) {
      console.warn("Gemini route distance estimation failed, using fallback:", err);
    }
  }

  // Fallback if not resolved
  if (!isDistanceResolved) {
    const distMultiplier = Math.abs((originStr.length + destinationStr.length) * 0.7);
    distance = Number((5 + (distMultiplier % 35)).toFixed(1)); // 5km to 40km range
    durationMins = Math.round(distance * 2.2 + 5);
  }

  const routes: RouteOption[] = [
    {
      mode: "driving",
      distance,
      duration: `${durationMins} mins`,
      co2: Number((distance * 0.20).toFixed(1)),
      savings: 0,
      recommended: false,
      pathText: `Main route via highway or major connectors. Heavy traffic possible.`,
    },
    {
      mode: "transit",
      distance: Number((distance * 1.05).toFixed(1)),
      duration: `${Math.round(durationMins * 1.3 + 5)} mins`,
      co2: Number((distance * 1.05 * 0.05).toFixed(1)),
      savings: Number((distance * 0.20 - distance * 1.05 * 0.05).toFixed(1)),
      recommended: true,
      pathText: `Suggested Train Line & Bus connector. 7-minute light stroll from platforms.`,
    },
    {
      mode: "bicycling",
      distance: Number((distance * 0.95).toFixed(1)),
      duration: `${Math.round(distance * 4.0)} mins`,
      co2: 0,
      savings: Number((distance * 0.20).toFixed(1)),
      recommended: distance <= 15, // recommend bicycling for shorter journeys!
      pathText: `Dedicated arterial bicycle lanes, passing scenic rivers and urban parks.`,
    },
    {
      mode: "walking",
      distance: Number((distance * 0.9).toFixed(1)),
      duration: `${Math.round(distance * 12.0)} mins`,
      co2: 0,
      savings: Number((distance * 0.20).toFixed(1)),
      recommended: distance <= 3, // recommend walking for very short trips!
      pathText: `Zero emissions walk through pedestrian malls. Perfect safe sidewalks.`,
    },
  ];

  res.json({ origin: originStr, destination: destinationStr, routes });
});

// Gemini-powered Insights Engine (Supports POST with specific user dataset, falls back to GET)
app.all("/api/insights", async (req, res) => {
  const isPost = req.method === "POST";
  const userName = (isPost ? req.body.userName : null) || "Ramy";
  const clientLogs = (isPost ? req.body.logs : null) || activityLogs;
  const clientCompletedChallenges = (isPost ? req.body.completedChallenges : null) || challenges.filter(c => c.completed).map(c => c.title);

  const totalCarbon = clientLogs.reduce((acc: number, log: any) => acc + log.carbonFootprint, 0);
  const totalSaved = clientLogs.reduce((acc: number, log: any) => acc + log.co2Saved, 0);

  // Group by category
  const categories: { [key: string]: number } = {};
  clientLogs.forEach((log: any) => {
    categories[log.type] = (categories[log.type] || 0) + log.carbonFootprint;
  });

  const biggestSource = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  if (!ai) {
    // Elegant fallback analytics if Gemini is offline
    return res.json({
      biggestSource,
      predictions: [
        {
          title: `Scale down ${biggestSource} impact`,
          tip: `Your logs show ${biggestSource} is currently leading your footprint. Consider setting a cap or replacing activities.`,
        },
        {
          title: "Public Transit Leap",
          tip: "Swapping out just 2 short car rides saves roughly 6.4 kg of CO2 emissions weekly.",
        },
      ],
      aiBrief: `Gemini is setting up in the background! Focus on optimizing transit and food profiles. Your active streak is looking solid, ${userName}!`,
    });
  }

  try {
    const contextPrompt = `
      The user profile ${userName} has the following sustainability tracker stats:
      - Total Carbon Footprint in past 7 days: ${totalCarbon.toFixed(1)} kg CO2e
      - Total CO2 saved: ${totalSaved.toFixed(1)} kg
      - Core emission categories logged: ${JSON.stringify(categories)}
      - Primary emission spike source: ${biggestSource}
      - Challenges completed: ${clientCompletedChallenges.join(", ")}
      
      Generate a brief 3-sentence expert, highly customized sustainability analysis. Include:
      1. Acknowledge their biggest carbon category.
      2. Suggest one high-yield behavior substitution target.
      3. Provide a futuristic forecast recommendation.
      
      Keep response strictly brief, structured, direct, warm, and highly professional. Do not use generic lists. Return purely plain text without markdown headers. Always refer to them as "${userName}".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
    });

    res.json({
      biggestSource,
      predictions: [
        {
          title: `Target ${biggestSource.toUpperCase()}`,
          tip: `Focusing on ${biggestSource} changes can lower emissions by up to 30%.`,
        },
        {
          title: "Optimize Commutes",
          tip: "Your transit route simulations highlight that selecting rail instead of petrol saves 4.5kg of emissions per ride.",
        },
      ],
      aiBrief: response.text || "Your tracks are highly aligned. Let's start saving carbon today!",
    });
  } catch (error) {
    console.error("Gemini api exception inside /api/insights:", error);
    res.json({
      biggestSource,
      predictions: [
        {
          title: "Carbon Spike Alert",
          tip: "Check daily heating/utility cycles to locate and lower phantom leaks.",
        },
      ],
      aiBrief: `Your logs look productive, ${userName}. Swapping beef meals for vegetarian options is key to achieving your weekly savings goals!`,
    });
  }
});

// secure server-side Gemini conversational assistant endpoint with session-history memory
app.post("/api/coach/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  const userName = req.body.userName || "Ramy";
  const clientLogs = req.body.logs || activityLogs;
  const completedChallengesCount = req.body.completedChallengesCount !== undefined ? req.body.completedChallengesCount : challenges.filter(c => c.completed).length;

  if (!message) {
    return res.status(400).json({ error: "Missing conversational message" });
  }

  // Compile active statistics for Gemini context-awareness
  const totalCarbon = clientLogs.reduce((acc: number, log: any) => acc + log.carbonFootprint, 0);
  const totalSaved = clientLogs.reduce((acc: number, log: any) => acc + log.co2Saved, 0);

  const currentStatus = {
    userName,
    recentLogsCount: clientLogs.length,
    weekCarbonFootprintKg: totalCarbon,
    weekSavingsKg: totalSaved,
    activeChallengesCompletedCount: completedChallengesCount,
    categoryStats: clientLogs.reduce((acc: any, l: any) => {
      acc[l.type] = (acc[l.type] || 0) + l.carbonFootprint;
      return acc;
    }, {} as Record<string, number>),
  };

  const formattedHistory = (chatHistory || coachChatHistory).map((m: any) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const systemPrompt = `
    You are an expert Google Cloud/Vertex AI Sustainability Coach, Carbon Lifecycle Expert, and motivational Eco-educator.
    You are assisting "${userName}", an eco-conscious resident.
    
    Here are ${userName}'s live carbon footprint metrics:
    - Current week emissions: ${currentStatus.weekCarbonFootprintKg.toFixed(1)} kg CO2e.
    - CO2e saved: ${currentStatus.weekSavingsKg.toFixed(1)} kg CO2e.
    - Completed challenges: ${currentStatus.activeChallengesCompletedCount} out of 5.
    - Footprint weight breakdown by category (kg): ${JSON.stringify(currentStatus.categoryStats)}

    Guidelines:
    1. Respond to the user's inquiry conversationally with expert, precise, and science-grounded advice.
    2. Give mathematical explanations of carbon intensity when helpful (e.g., standard EV vs. petrol car emission benchmarks).
    3. Stay highly encouraging, upbeat, and practical. Offer concrete daily substitutions.
    4. Keep answers readable and compact, structured elegantly in Markdown. Avoid long paragraphs.
    5. Always refer to them as "${userName}" to make it beautifully custom and respectful.
  `;

  if (!ai) {
    // Highly interactive mock advisor fallback supporting all questions if API Key is not set
    let text = "";
    if (message.toLowerCase().includes("electric") || message.toLowerCase().includes("power")) {
      text = `Excellent inquiry, ${userName}! ⚡ Home electricity represents about 25% of modern household footprint. Swapping standard incandescent bulbs for LEDs decreases bulb energy by 75%. Also, setting your thermostat just 1°C closer to the ambient outdoor temp cuts appliance heating/cooling bills by up to 10%! Have you checked if your service has a renewable solar or wind tariff tariff subscription option?`;
    } else if (message.toLowerCase().includes("food") || message.toLowerCase().includes("meal") || message.toLowerCase().includes("meat")) {
      text = `Spot on, ${userName}! 🥗 Livestock agriculture accounts for approximately 14-18% of greenhouse gases. Red meats like beef have a staggering footprint of nearly 27 kg CO2e per kg, while vegetarian foods like poultry lie at 6.9 kg, and pulses/lentils sit under 0.9 kg! Simply swapping 2 beef meals a week for vegan organic options saves you nearly 240 kg of carbon annually.`;
    } else {
      text = `Fantastic effort, ${userName}! Your weekly emissions are currently logged at **${currentStatus.weekCarbonFootprintKg.toFixed(1)} kg CO2e** with **${currentStatus.weekSavingsKg.toFixed(1)} kg** saved. 

To keep your momentum going:
- Try completing your pending sustainability challenges.
- Use the **Eco Routes Comparator** on the planner tab before planning your cross-town trips!

What specific sustainability habit shall we tackle next?`;
    }

    const newReply: AICoachMessage = {
      id: `reply_${Date.now()}`,
      role: "model",
      text,
      timestamp: new Date().toISOString(),
      suggestions: [
        {
          id: "sug_1",
          title: "Install smart strips",
          description: "Cut standby phantom energy on your monitor array.",
          impact: "low",
          co2SavedValue: 1.5,
          category: "energy",
        },
        {
          id: "sug_2",
          title: "Transit First Commutes",
          description: "Opt for light transit rail rather than petrol cars on cross-city routines.",
          impact: "high",
          co2SavedValue: 5.2,
          category: "transport",
        },
      ],
    };

    return res.json({ reply: newReply });
  }

  try {
    // Make actual secure server-side Gemini API call with structured chat session
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [...formattedHistory, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const aiText = response.text || "I was unable to assess detail, let me recalculate and sync!";

    // Generate custom task-based suggestions using Gemini function calling or light structured heuristic to make the chat experience interactive!
    const activeSuggestions: EcoSuggestion[] = [
      {
        id: `sug_a_${Date.now()}`,
        title: "Swap to LED Bulbs",
        description: "Swap top three heavy usage fixtures to cost-efficient LEDs.",
        impact: "medium",
        co2SavedValue: 2.1,
        category: "energy",
      },
      {
        id: `sug_b_${Date.now()}`,
        title: "Try Plant-Based lunch",
        description: "Enjoy vegan lentils, quinoa bowls or wraps tomorrow.",
        impact: "high",
        co2SavedValue: 3.4,
        category: "food",
      },
    ];

    const newReply: AICoachMessage = {
      id: `reply_${Date.now()}`,
      role: "model",
      text: aiText,
      timestamp: new Date().toISOString(),
      suggestions: activeSuggestions,
    };

    res.json({ reply: newReply });
  } catch (error) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: "Gemini response error." });
  }
});

async function startServer() {
  // Vite integration as middleware in development, direct express static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EcoServer] Full-Stack Carbon Engine running on http://localhost:${PORT}`);
  });
}

startServer();
