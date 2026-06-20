# EcoFlow

**EcoFlow** is an AI-powered sustainability assistant that helps individuals understand, track, and reduce their carbon footprint through personalized insights and practical recommendations. By combining artificial intelligence with intuitive visualizations and eco-friendly planning tools, EcoFlow empowers users to make informed decisions that contribute to a more sustainable future.

---

## Overview

Many people want to adopt a greener lifestyle but struggle to understand how their daily choices impact the environment. EcoFlow bridges this gap by transforming complex carbon emission data into actionable insights tailored to each user.

Instead of acting as a simple carbon calculator, EcoFlow serves as an intelligent sustainability coach that continuously guides users toward better habits based on their activities and goals.

---

## Key Features

### Dashboard
- Personalized carbon footprint overview
- Daily, weekly, and monthly analytics
- Progress tracking and sustainability score
- Recent activity summaries

### Carbon Footprint Logging
Track emissions across multiple categories:
- Transportation
- Food consumption
- Energy usage
- Shopping
- Flights
- Water usage
- Waste generation

### AI Coach
Powered by Google's Gemini API, the AI assistant can:
- Answer sustainability-related questions
- Provide personalized carbon reduction strategies
- Explain environmental impact in simple language
- Recommend practical daily improvements
- Generate motivational insights and summaries

### Eco-Friendly Route Planning
Integrated with Google Maps Platform to:
- Compare transportation methods
- Suggest lower-emission travel options
- Estimate carbon savings
- Promote walking, cycling, and public transport

### Eco Challenges
Encourage sustainable habits through:
- Daily missions
- Weekly challenges
- Achievement badges
- Progress tracking
- Habit-building goals

### Smart Insights
- Identify major emission sources
- Predict future trends
- Recommend impactful changes
- Track long-term improvements

---

## Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS

### AI & Cloud
- Google Gemini API
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- Google Cloud Services

### Maps & Location
- Google Maps Platform

---

## Project Structure

```
EcoFlow/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── utils/
│   ├── types/
│   ├── styles/
│   └── App.tsx
│
├── firebase/
├── functions/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Core Workflow

1. User signs in securely.
2. User logs daily activities.
3. EcoFlow estimates carbon emissions.
4. AI analyzes behavior and identifies patterns.
5. Personalized recommendations are generated.
6. Users complete eco challenges and monitor progress.
7. Google Maps suggests greener transportation alternatives.

---

## AI-Powered Decision Making

EcoFlow goes beyond static calculations by providing context-aware recommendations based on:

- User history
- Transportation preferences
- Energy consumption
- Food habits
- Lifestyle trends
- Sustainability goals

Examples:
- Suggest public transport for frequently driven routes.
- Recommend reducing electricity usage during peak periods.
- Encourage sustainable food choices based on logged meals.
- Highlight high-impact opportunities for carbon reduction.

---

## Accessibility

EcoFlow is designed with inclusivity in mind:
- Responsive across devices
- Keyboard-friendly navigation
- Screen reader compatibility
- High-contrast visual design
- Accessible forms and controls
- Clear and simple language

---

## Security

The application follows modern security best practices:
- Secure authentication
- Protected API communication
- Input validation and sanitization
- Environment variable management
- Principle of least privilege
- Privacy-conscious handling of user data

---

## Performance Optimizations

- Modular architecture
- Efficient state management
- Optimized API usage
- Lazy-loaded components
- Responsive rendering
- Scalable cloud infrastructure

---

## Future Enhancements

- Carbon footprint forecasting using machine learning
- Community sustainability leaderboards
- Household and family accounts
- Smart device integrations
- Carbon offset recommendations
- Voice-enabled AI assistant
- Wearable and health platform integrations
- Business sustainability dashboards

---

## Why EcoFlow?

EcoFlow is designed to make sustainability practical rather than overwhelming. By combining AI-driven personalization, intuitive design, and Google technologies, it enables users to understand their environmental impact and take meaningful steps toward reducing it.

The goal is not only to measure carbon emissions but also to inspire lasting behavioral change through education, guidance, and continuous engagement.

---

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase project
- Google Gemini API key
- Google Maps API key

### Installation

```bash
git clone https://github.com/your-username/ecoflow.git

cd ecoflow

npm install

npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a pull request.

Please ensure your code follows the project's style guidelines and includes appropriate testing where applicable.

---

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it in accordance with the license terms.

---

## Acknowledgements

- Google Gemini API
- Firebase
- Google Maps Platform
- React
- Tailwind CSS

---

**EcoFlow** — *Empowering smarter choices for a more sustainable future.*
