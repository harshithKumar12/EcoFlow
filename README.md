# EcoFlow — Intelligent Carbon Footprint Tracker & AI Coach

EcoFlow is a production-grade, highly optimized Web application designed to help individuals understand, track, and reduce their carbon footprint through simple, contextual actions, collaborative metrics, and highly personalized, context-aware AI coaching.

---

## 🚀 Key Features

* **Real-Time Sustainability Logging**: Granular Carbon footprint calculators covering Transport, Energy, Food Diet, Shopping, Flights, Water, and Waste management.
* **Simulated Eco-Route Matrix**: Side-by-side travel alternatives showing greenhouse gas comparisons before committing, backed by Simulated Google Maps.
* **Interactive AI Advisor Chat**: Context-aware companion driven securely by server-side **Google Gemini API** (`gemini-3.5-flash`), analyzing active history, completed challenges, and current trends to deliver precise, science-grounded actions.
* **Collaborative Quests & Gamification**: Streak trackers, achievement badges, and points multipliers integrated directly with persistent user profiles.
* **Persistent User Storage**: Reliable, sandboxed guest-mode fallbacks synced with optional Cloud-hosted FireStore structures.

---

## 📂 Project Directory Structure

```text
├── .env.example              # Documented server configurations and secret variables
├── ARCHITECTURE.md           # Deep-dive system flow diagram, secure routing and WCAG documentation
├── package.json              # NPM build scripts, full-stack development, and test configurations
├── server.ts                 # Secure Express enterprise backend hosting Gemini & maps calculators
├── tsconfig.json             # Enterprise TypeScript compiler strict rules configuration
├── src/
│   ├── App.tsx               # Orchestrates UI layout composition using custom hooks cleanly
│   ├── main.tsx              # Application front-end mounting and layout routing
│   ├── index.css             # Tailwind styled canvas paired with custom Inter & Fira Mono fonts
│   ├── types.ts              # Strongly typed, shared model definitions (no implicit casts)
│   ├── hooks/
│   │   └── useEcoFlow.ts     # Main customized React hook encapsulating auth, logs state, and API routing
│   ├── lib/
│   │   ├── firebase.ts       # Secure FireBase app initialization and Auth parameters
│   │   ├── firebaseHelper.ts # FireStore CRUD operations wrapped in robust transactional error boundaries
│   │   └── carbonCalculator.ts # Pure mathematical emission offsets and coefficients algorithms
│   └── components/
│       ├── AICoach.tsx       # Secure server-side Coach Panel rendering customizable quick question chips
│       ├── Challenges.tsx    # Gamified badges, daily missions, and streaks system filtered by category
│       ├── Dashboard.tsx     # Recharts multi-trend analytical area-charts, categories breakdowns, and feed ledger
│       ├── LogActivity.tsx   # Fluid, tabbed carbon pre-estimating tracking wizard
│       └── RoutePlanner.tsx  # Dynamic route comparer, map modes, and shortcut presets
```

---

## 🛠️ Technology Stack & Dependencies

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion (framer-motion).
* **Analytics**: Recharts, Lucide React (for fully scalable, lightweight visual icons).
* **Backend**: Express, ESBuild, TSX (TypeScript execution tool).
* **Google Cloud Integration**:
  * **Google Gemini API** (`@google/genai` TypeScript SDK proxy via backend routing).
  * **Google FireStore & Auth** (isolated user collections with custom security rules).

---

## ⚙️ Environment Variables & Setup

Before running the server locally, create a `.env` file in the root directory in accordance with `.env.example`:

```env
# Google Gemini SDK Secret API Key
GEMINI_API_KEY="your_api_key_here"

# Front-End App Ingress URL Parameter
APP_URL="http://localhost:3000"
```

---

## 💻 Local Installation & Operations Guide

### 1. Extract and Install Dependencies
```bash
npm install
```

### 2. Launch Development Server (Express + Vite)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the workspace in active live preview mode.

### 3. Build & Compile for Production Ingress
```bash
npm run build
```
This runs Vite to compile front-end bundles into `/dist`, and bundles `server.ts` into a self-contained, enterprise-compliant `dist/server.cjs` bundle with ESBuild.

### 4. Execute Certified Production Services
```bash
npm run start
```

---

## 🧪 Comprehensive Verification & Testing

EcoFlow includes a rich test matrix with Unit and Integration tests verifying UI state flow, state rollbacks, mathematical core controllers, and layout structures.

```bash
# Run all unit tests
npm run test

# Run tests with complete statement, function, and branch coverage reports
npm run test:coverage
```

All source assets have verified strict compliance to typings, zero unused variables, and accessible color contrast.

---

## 🛡️ Security Strategy & Conformance Matrix

* **Server-bound Secrets**: To prevent API key leakages, all Gemini connections are proxy-routed through `/api/coach/chat` server-side, protecting the system from client-side sniffing.
* **WCAG AA Compliance**: Elements feature minimum touch sizes of 44x44px. Custom color pallets and high contrast text ratios are actively verified.
* **Robust Firestore Interceptor**: Custom error schemas handle transaction failures elegantly, passing precise logs to terminal runtimes without leaking system paths on client side.
