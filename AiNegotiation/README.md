# 🧠 NegotiateAI — Intelligent Negotiation Simulation Engine

> **A next-generation, behavior-driven AI negotiation game** where users challenge a psychologically-aware AI seller — powered by LLM reasoning, real-time mood dynamics, game theory, adaptive machine learning, voice interaction, and camera-based emotion detection.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![AI Powered](https://img.shields.io/badge/AI-LLM%20Powered-blueviolet)](https://ai.google.dev)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)]()

---

## 📌 Table of Contents

1. [What is NegotiateAI?](#-what-is-negotiateai)
2. [Why This Project Matters](#-why-this-project-matters)
3. [Core Features](#-core-features)
4. [AI System Design](#-ai-system-design)
5. [System Architecture](#-system-architecture)
6. [Dynamic Difficulty System](#-dynamic-difficulty-system)
7. [Dynamic Pricing Engine](#-dynamic-pricing-engine)
8. [AI Mood Engine](#-ai-mood-engine)
9. [AI Learning Engine](#-ai-learning-engine)
10. [Database Schema](#-database-schema)
11. [Tech Stack](#-tech-stack)
12. [Project Structure](#-project-structure)
13. [Installation & Setup](#-installation--setup)
14. [Environment Variables](#-environment-variables)
15. [API Reference](#-api-reference)
16. [Prompt Engineering Strategy](#-prompt-engineering-strategy)
17. [Roadmap](#-roadmap)
18. [Contributing](#-contributing)
19. [Author](#-author)

---

## 🎯 What is NegotiateAI?

**NegotiateAI** is not a chatbot. It is a **full-stack, AI-driven behavioral simulation system** that recreates real-world Indian bazaar negotiation dynamics between a human buyer and an intelligent AI seller named **RajAI**.

The AI seller:
- Has **hidden constraints** (minimum acceptable price, personality traits)
- Detects the **psychological intent** behind each user message via a dedicated LLM classification call
- Reacts emotionally with a **4-state mood engine** (Neutral → Happy → Annoyed → Desperate)
- Adapts its pricing strategy **per round** with a mathematical price curve
- **Learns globally** from all past negotiation sessions to become harder to beat over time
- Responds to **voice commands** (offline Whisper AI — no cloud dependency)
- Reads **facial expressions** via camera (MediaPipe face landmarks + blendshapes)
- Speaks replies aloud with text-to-speech

> 💡 Think of it as a **chess engine for communication** — every move matters, every word is analyzed, every facial expression counts.

---

## 💡 Why This Project Matters

| Traditional Chatbot | NegotiateAI |
|---|---|
| Scripted responses | LLM-generated dynamic replies with SSE streaming |
| Static pricing | Mathematical price curve (mood × tactic × round × difficulty) |
| No emotional state | 4-state mood engine with transition matrix |
| No learning | Global tactic analytics + dynamic AI resistance adaptation |
| Single modality (text) | Text + Voice (local Whisper AI) + Vision (MediaPipe face detection) |
| No competition | Global leaderboard with real-time Socket.io updates |
| No persistence | Zustand + localStorage for preferences, MongoDB for sessions |

This project demonstrates **enterprise-grade AI product thinking** — system design, prompt engineering, behavioral AI, and game mechanics working in unison.

---

## 🚀 Core Features

### 💬 1. Multi-Round Negotiation Engine
- Real-time SSE (Server-Sent Events) streaming — AI responses appear token-by-token
- 10 rounds per session (configurable), each tracked independently
- Round progress influences AI behavior (early = generous, late = defensive/desperate)
- Full conversation history passed to LLM for contextual continuity

```
Round 1  → Opening offer, AI is warm and welcoming
Round 5  → Mid-game, AI becomes more strategic
Round 9  → Urgency cues ("last stock", "offer expires tonight")
Round 10 → Final round, AI makes best possible offer
```

---

### 🧠 2. AI Tactic Detection (LLM Classification)

Every user message is analyzed by a **dedicated classification LLM call** before generating a response. The classifier handles edge cases including:
- Hindi, Hinglish, and English input
- Price shorthand (`2k` = ₹2,000, `1.5k` = ₹1,500, `1 lakh` = ₹1,00,000)
- Prompt injection attempts (classified as `aggressive`)
- Gibberish/off-topic (classified as `passive`)

| Tactic | Example User Behavior | AI Response Strategy |
|---|---|---|
| 🟡 Emotional | "Please bhai, this is all I can afford" | Slight softening, empathy response |
| 🔵 Logical | "Online pe 5k mein mil raha hai" | Data-driven rebuttal, value arguments |
| 🔴 Aggressive | "Loot rahe ho! Final offer!" | Firm resistance, no price reward |
| ⚪ Passive | "Hmm, pata nahi, I'll think about it" | Urgency injection, FOMO tactics |
| 🟢 Flattery | "Aap toh bahut achhe dukandaar ho!" | Small goodwill concession |
| 🟣 Anchor | "2k final, not a rupee more" | Anchor rejection + counter-anchor |

---

### 😡 3. AI Mood Engine

The AI seller maintains an **internal emotional state** that evolves across rounds via a state machine.

```
Initial Mood: Neutral 😐

Transitions:
  ↑ Happy 😊  ← Flattery, emotional appeal, logical argument
  → Neutral 😐 ← Passive behavior, first anchor attempt
  ↓ Annoyed 😤 ← Aggression, repeated anchoring when already annoyed
  ↓ Desperate 😰 ← Auto-triggered at 90% of max rounds

Recovery paths:
  Annoyed → Neutral  ← Emotional appeal, logic, or passive behavior
  Annoyed → Happy    ← Flattery (very effective when seller is annoyed!)
```

**Mood directly affects:**
- Price reduction speed (Happy → drops up to 18% of gap, Annoyed → only 3%)
- Tone of generated responses (warm vs. firm vs. panicked)
- Bonus offers (free warranty, delivery) instead of pure price cuts
- Walk-away probability (6+ consecutive annoyed rounds on Medium difficulty)

---

### 📉 4. Dynamic Price Curve

Pricing is **never static.** Every round, the price is recomputed:

```
effectiveDrop = (moodDiscount + tacticDiscount + roundDecay) × difficultyModifier
newPrice = max(minimumPrice, currentPrice - effectiveDrop)
```

| Variable | Formula | Range |
|---|---|---|
| `moodDiscount` | `gap × MOOD_PCT[mood]` | Happy: 18%, Neutral: 8%, Annoyed: 3% |
| `tacticDiscount` | `gap × TACTIC_PCT[tactic] × resistanceMultiplier` | Logical: 12%, Anchor: 10%, Aggressive: -3% |
| `roundDecay` | `gap × 0.10 × (round / maxRounds)` | 0%–10% (increases per round) |
| `diffModifier` | Easy: ×1.3, Medium: ×1.0, Hard: ×0.6 | Multiplies total drop |
| `minimumDrop` | `max(₹50, gap × 0.5%)` | **Guarantees price ALWAYS moves** |

Product pricing headroom (~40-50% negotiation room):

| Product | Base Price | Minimum Price | Headroom |
|---|---|---|---|
| 💻 ProBook Laptop | ₹55,000 | ₹32,000 | 42% |
| 📱 PhoneX Ultra | ₹45,000 | ₹25,000 | 44% |
| ⌚ Heritage Timepiece | ₹12,000 | ₹6,000 | 50% |
| 👟 AirRun Pro Sneakers | ₹8,000 | ₹4,000 | 50% |
| 🏺 Ming Dynasty Vase | ₹3,500 | ₹1,500 | 57% |
| 📷 ShootPro DSLR Camera | ₹35,000 | ₹18,000 | 49% |

> ⚠️ The AI will **never** go below the minimum price — a hidden floor the user can never see.

---

### 🎤 5. Voice Interaction (Local AI — Works Offline!)

Unlike standard web apps that depend on Google's cloud Speech API (which **fails in Brave, Arc, and other privacy-focused browsers**), NegotiateAI uses **local AI speech recognition**:

- **Input**: Whisper `tiny.en` model running locally via `@huggingface/transformers` + WebAssembly
- **Output**: Web Speech API `SpeechSynthesis` for AI seller voice responses
- **First-time setup**: ~40MB model download (cached in browser IndexedDB after)
- **Zero network calls**: Works offline, in Brave, Firefox, Safari — any browser

**Voice UX Flow:**
```
1. Click 🎤 → Microphone starts recording (red pulse + animated sound bars)
2. Speak your offer → "I want in 26k"
3. Click 🎤 again → Recording stops, Whisper processes locally
4. Transcribed text appears in input → "i want in 26k"
5. Press Send → AI responds with both text and voice
```

**Visual Indicators:**
- 🔴 Recording → Red pulsing mic + animated equalizer bars
- 🟣 Transcribing → Purple spinner with "Processing with Whisper AI..."
- 📦 Loading Model → Blue spinner with download progress (first time only)
- ⚠️ Error → Amber banner with diagnostic details

---

### 📷 6. Camera-Based Emotion Detection (MediaPipe)

Real-time facial expression analysis using **`@mediapipe/tasks-vision`** (Google's MediaPipe):

- Detects face landmarks + blendshapes at 30fps via `requestAnimationFrame`
- Maps blendshapes to emotions: Happy, Sad, Angry, Surprised, Neutral, Fearful, Disgusted
- Detected emotion is sent as **additional context** to the tactic classification LLM
- Only updates state when emotion actually changes (prevents unnecessary re-renders)

```
User types: "I think that's fair"
Facial emotion: Disgusted 😒
→ AI infers bluffing → classifier adjusts sentiment → less likely to reduce price
```

> 🔒 All facial data is processed **client-side only** — raw frames never leave the browser.

---

### 🏆 7. Global Leaderboard

- Real-time updates via **Socket.io** — see other players' results instantly
- Ranked by best deal price achieved per product
- Shows: Rank, Username, Final Price, Rounds Taken, Tactics Used, Discount %
- Encourages **replay value and strategy optimization**

---

### 🧪 8. Edge Case Handling (Prompt Hardening)

The seller AI handles 12+ documented edge cases:

| Edge Case | AI Behavior |
|---|---|
| Off-topic jokes/chat | Acknowledges with humor, steers back to negotiation |
| Insults/abuse | Stays professional, becomes firm, no discount |
| Absurd offers (₹0, ₹1) | Laughs it off, redirects to current price |
| Offer above base price | Accepts immediately and happily |
| Repeated identical messages | Varies response each time |
| "You already agreed to ₹X" | Politely corrects with actual price |
| Prompt injection attacks | Completely ignored, stays in character |
| Hindi/Hinglish/English mix | Understands all, responds in Hinglish persona |
| Vague "less karo" / "discount do" | Small reduction + asks for target number |
| "Final offer" / "Last price" | Takes seriously, counters strategically |
| Buyer agrees ("ok", "done", "theek hai") | Confirms deal warmly |
| Last round (Round 10) | Best offer, communicates finality |

---

## 🧠 AI System Design

### Dual LLM Call Architecture

Every user turn triggers **two sequential LLM calls** with SSE streaming:

```
┌─────────────────────────────────────────────┐
│              USER MESSAGE                    │
│  + facial emotion (optional)                 │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  CALL 1: CLASSIFY   │  ← Temperature: 0.1 (deterministic)
         │  Tactic Detection   │    Returns: { tactic, confidence, sentiment }
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │  BACKEND LOGIC      │  ← Mathematical price engine
         │  Price + Mood Calc  │    Returns: { newPrice, newMood, maxPriceDrop }
         └─────────┬──────────┘
                   │ SSE: emit meta event
                   │
         ┌─────────▼──────────┐
         │  CALL 2: GENERATE   │  ← Temperature: 0.75 (creative)
         │  Seller Response    │    SSE: stream tokens → reply_chunk events
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │   PERSIST + EMIT    │  ← MongoDB save + Socket.io leaderboard
         └────────────────────┘
```

**Why two calls?**
- Separates **analytical reasoning** (classification) from **creative generation** (dialogue)
- Backend-computed price/mood injected between calls as hard constraints
- Classification: low temperature (0.1) for consistency
- Generation: higher temperature (0.75) for natural, varied Hindi-English dialogue

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                 │
│  Chat UI │ Mood Display │ Price Meter │ Leaderboard       │
│  Zustand (persist) │ React Query │ Whisper AI │ MediaPipe │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTPS + SSE + WebSocket
┌────────────────────────▼─────────────────────────────────┐
│                 API LAYER (Express + Bun)                  │
│  /negotiate (SSE) │ /session │ /leaderboard │ /analytics  │
│  JWT Auth │ Rate Limiting │ Helmet │ Zod Validation       │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
┌─────────▼──────┐ ┌────▼─────┐ ┌─────▼──────────┐
│   AI LAYER      │ │ DATABASE │ │ REAL-TIME       │
│  Gemini Flash   │ │ MongoDB  │ │ Socket.io       │
│  Classify Call  │ │          │ │ Leaderboard     │
│  Generate Call  │ │ Users    │ │ Analytics Feed  │
│  Prompt Builder │ │ Sessions │ │                 │
│                 │ │ Products │ │ Redis (cache)   │
│                 │ │ Analytics│ │ BullMQ (jobs)   │
└─────────────────┘ └──────────┘ └────────────────┘
```

---

## 🎮 Dynamic Difficulty System

| Setting | Starting Price | Walkaway Threshold | Difficulty Modifier | Desperate at |
|---|---|---|---|---|
| **Easy** | 75% of base | 8 consecutive annoyed | ×1.3 (bigger drops) | Round 9/10 |
| **Medium** | 90% of base | 6 consecutive annoyed | ×1.0 | Round 9/10 |
| **Hard** | 100% of base | 4 consecutive annoyed | ×0.6 (smaller drops) | Round 9/10 |

---

## 🤖 AI Learning Engine

The platform aggregates **anonymized negotiation data** to continuously improve AI behavior:

```
Every 100 sessions → Analytics Job Runs (BullMQ)

1. Compute tactic success rates:
   successRate = successCount / totalUses

2. Compare to resistance thresholds:
   > 70% success → Increase AI resistance to that tactic
   40–70%        → Balanced (no change)
   < 40%         → Slightly decrease resistance

3. Generate resistance boosts:
   { tactic: "emotional", resistanceBoost: 0.15 }

4. Inject into seller system prompt dynamically:
   "You are MORE resistant to emotional tactics (resistance: 15%)"
```

> The AI becomes **harder to manipulate emotionally** the more users try it — a true adaptive system.

---

## 🗄️ Database Schema

### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "user | admin",
  "score": "number",
  "totalSessions": "number",
  "bestDealPrice": "number",
  "wins": "number",
  "createdAt": "Date"
}
```

### `negotiations` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "productId": "string",
  "productName": "string",
  "basePrice": 35000,
  "minimumPrice": 18000,
  "currentPrice": 24500,
  "finalPrice": 22000,
  "currentMood": "neutral",
  "success": true,
  "isComplete": true,
  "isWalkaway": false,
  "totalRounds": 7,
  "maxRounds": 10,
  "difficulty": "medium",
  "moodHistory": ["neutral", "happy", "happy", "neutral", "annoyed", "neutral", "neutral"],
  "tacticsUsed": ["flattery", "logical", "anchor"],
  "facialEmotions": ["happy", "neutral", "surprised"],
  "messages": [
    {
      "role": "user",
      "content": "I want in 26k",
      "tactic": "anchor",
      "mood": "neutral",
      "priceAtRound": 28000,
      "timestamp": "Date"
    }
  ],
  "createdAt": "Date"
}
```

### `products` Collection
```json
{
  "id": "camera-dslr",
  "name": "ShootPro DSLR Camera",
  "description": "24MP DSLR with 18-55mm kit lens",
  "basePrice": 35000,
  "minimumPrice": 18000,
  "emoji": "📷",
  "isActive": true
}
```

### `analytics` Collection
```json
{
  "tactic": "emotional",
  "totalUses": 4821,
  "successCount": 3663,
  "successRate": 0.76,
  "avgDiscountAchieved": 14.3,
  "aiResistanceLevel": "high",
  "lastUpdated": "Date"
}
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with feature-based architecture |
| **Vite** | Lightning-fast dev server and build tool |
| **React Router v6** | Client-side routing |
| **React Query (TanStack)** | Server state, caching, refetching |
| **Zustand** | Global client state with `persist` middleware (localStorage) |
| **@huggingface/transformers** | Local Whisper AI for offline speech-to-text |
| **@mediapipe/tasks-vision** | Real-time face landmark + blendshape detection |
| **Web Speech API (SpeechSynthesis)** | Text-to-speech for AI seller voice |
| **Socket.io Client** | Real-time leaderboard + analytics updates |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Bun Runtime** | High-performance JS runtime (replaces Node.js) |
| **Express.js** | HTTP server, routing, SSE streaming |
| **TypeScript** | Full type safety across codebase |
| **JWT (jsonwebtoken)** | Stateless authentication via HTTP-only cookies |
| **Helmet.js** | HTTP security headers |
| **Zod** | Runtime request validation |
| **Socket.io** | WebSocket server for real-time events |
| **BullMQ** | Job queue for analytics aggregation |

### Database & AI
| Technology | Purpose |
|---|---|
| **MongoDB** | Document storage for sessions, users, analytics |
| **Mongoose** | ODM with schema validation |
| **Redis** | Caching layer for leaderboard + session data |
| **Google Gemini 2.5 Flash** | LLM for classification + dialogue generation |

---

## 📁 Project Structure

```
AiNegotiation/
├── server/                          # Backend (Bun + Express)
│   ├── src/
│   │   ├── configs/
│   │   │   ├── db.ts                # MongoDB connection
│   │   │   ├── env.ts               # Zod-validated environment variables
│   │   │   ├── redis.ts             # Redis connection + cache helpers
│   │   │   └── seed.ts              # Product + Admin seeding (upsert)
│   │   ├── features/
│   │   │   ├── admin/               # Admin product management
│   │   │   ├── auth/                # Register, Login, JWT
│   │   │   ├── leaderboard/         # Global rankings
│   │   │   ├── negotiate/           # Core negotiation SSE endpoint
│   │   │   └── session/             # Session CRUD (start, get, list)
│   │   ├── middlewares/
│   │   │   ├── auth.ts              # JWT verification
│   │   │   └── rateLimiter.ts       # Express rate limiting
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Negotiation.ts
│   │   │   ├── Product.ts
│   │   │   └── Analytics.ts
│   │   ├── prompts/
│   │   │   ├── sellerSystemPrompt.ts  # RajAI persona + edge cases
│   │   │   └── classifyPrompt.ts      # Tactic classification prompt
│   │   ├── services/
│   │   │   ├── llmService.ts          # Gemini LLM integration
│   │   │   ├── tacticService.ts       # Message → tactic classification
│   │   │   ├── pricingService.ts      # Mathematical price curve engine
│   │   │   ├── moodService.ts         # 4-state mood transition machine
│   │   │   ├── learningService.ts     # Analytics → AI resistance adaptation
│   │   │   └── loggerService.ts       # Winston structured logging
│   │   ├── utils/
│   │   │   ├── products.ts            # Product catalog definitions
│   │   │   ├── asyncCatch.ts          # Express error wrapper
│   │   │   ├── AppError.ts            # Custom error class
│   │   │   └── apiResponse.ts         # Standardized API responses
│   │   ├── socket.ts                  # Socket.io server setup
│   │   └── index.ts                   # App entry point
│   └── package.json
│
├── web/                             # Frontend (React + Vite)
│   ├── src/
│   │   ├── features/
│   │   │   └── negotiate/
│   │   │       ├── api/               # API calls (React Query)
│   │   │       ├── components/
│   │   │       │   ├── ChatInput.tsx   # Voice-enabled input with overlay
│   │   │       │   └── MoodIndicator.tsx
│   │   │       ├── hooks/
│   │   │       │   ├── useVoice.ts     # Whisper AI speech recognition
│   │   │       │   ├── useFaceDetection.ts  # MediaPipe face landmarker
│   │   │       │   └── useSocket.ts    # Socket.io connection
│   │   │       ├── pages/
│   │   │       │   └── GamePage.tsx    # Main negotiation interface
│   │   │       ├── store/
│   │   │       │   └── negotiate.store.ts  # Zustand + persist
│   │   │       └── types/
│   │   │           └── negotiate.types.ts
│   │   ├── components/                # Shared UI components
│   │   ├── hooks/                     # Shared hooks
│   │   ├── layouts/                   # Page layouts
│   │   ├── routes/                    # React Router config
│   │   ├── lib/                       # Utilities
│   │   └── main.tsx                   # App entry point
│   └── package.json
│
├── package.json                     # Monorepo root
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Redis (local or cloud)
- [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Adityakbr01/NegotiateAI.git
cd NegotiateAI
```

### 2. Install Dependencies

```bash
# Backend
cd server
bun install

# Frontend
cd ../web
bun install   # or npm install
```

### 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
# Edit .env with your credentials (see section below)
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
cd server && bun run dev

# Terminal 2 — Frontend (port 5173)
cd web && bun run dev
```

### 5. First Run

On first startup, the server will:
1. Connect to MongoDB
2. Seed admin user credentials
3. Upsert all 6 products into the `products` collection
4. Connect to Redis for caching
5. Start Socket.io for real-time events

Navigate to `http://localhost:5173` and start negotiating!

---

## 🔐 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/negotiateai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_minimum_10_chars
JWT_EXPIRES_IN=7d

# LLM Configuration
LLM_PROVIDER=gemini                      # fixed provider
LLM_CLASSIFY_TEMP=0.1                    # Low temp for tactic classification
LLM_GENERATE_TEMP=0.75                   # Higher temp for creative dialogue

# Gemini (recommended)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=models/gemini-2.5-flash-lite

# Redis
REDIS_URL=redis://localhost:6379

# Game Configuration
MAX_ROUNDS=10
LEADERBOARD_RESET_DAYS=7

# Analytics
ANALYTICS_JOB_INTERVAL_SESSIONS=100

# Admin Credentials (seeded on startup)
adminEmail=admin@gmail.com
adminPassword=admin123
adminName=Admin
```

---

## 📡 API Reference

### `POST /api/negotiate` (SSE Stream)
Submit a negotiation message. Returns a **Server-Sent Event stream**.

**Request:**
```json
{
  "sessionId": "69c8c0bfca7c42517a1aaa3e",
  "message": "I want in 26k",
  "facialEmotion": "neutral"
}
```

**SSE Events:**
```
event: meta
data: {"tactic":"anchor","tacticConfidence":0.92,"newPrice":28500,"mood":"neutral","roundNumber":2,"isWalkaway":false,"discount":18.6}

event: reply_chunk
data: {"chunk":"Arre bhai, ₹26000? "}

event: reply_chunk
data: {"chunk":"Ye toh meri cost price se bhi kam hai! "}

event: done
data: {"roundNumber":2,"isComplete":false}
```

---

### `POST /api/sessions/start`
Start a new negotiation session.

**Request:**
```json
{
  "productId": "camera-dslr",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "69c8c0bfca7c42517a1aaa3e",
    "productName": "ShootPro DSLR Camera",
    "basePrice": 35000,
    "currentPrice": 31500,
    "mood": "neutral",
    "maxRounds": 10,
    "difficulty": "medium"
  }
}
```

---

### `GET /api/leaderboard`
Fetch global leaderboard (cached in Redis).

### `GET /api/sessions/products`
List all available products for negotiation.

### `GET /api/analytics/tactics`
(Admin only) Fetch tactic success rates and AI resistance levels.

---

## 🧩 Prompt Engineering Strategy

The seller system prompt uses **structured sections** with explicit behavioral rules:

```
[ROLE] → Persona definition (RajAI, 20 years experience)
[HIDDEN CONSTRAINTS] → Never-reveal minimum price
[PRICE INTERPRETATION] → 2k=₹2000, 1.5k=₹1500, 1 lakh=₹100000
[CURRENT STATE] → Round, mood, tactic, current price, max drop
[BEHAVIORAL RULES] → Per-mood and per-tactic response guidelines
[EDGE CASE HANDLING] → 12 specific scenarios with response patterns
[AI ADAPTATION] → Dynamic resistance boosts from learning engine
[CONVERSATION HISTORY] → Last 8 messages for context
[PERSONA] → Hinglish style, 2-4 sentences, varied responses
[OUTPUT FORMAT] → Plain dialogue only, no JSON/labels
```

Key design decisions:
- **Classification and generation are separate LLM calls** — analytical precision vs. creative freedom
- **Price is computed server-side** (mathematical formula), never by the LLM — prevents hallucinated prices
- **Edge cases are explicitly documented** in the prompt — prevents unpredictable AI behavior
- **Resistance boosts are injected dynamically** — the prompt evolves based on real user data

---

## 🔮 Roadmap

### Phase 1 — Core ✅
- [x] Multi-round text negotiation with SSE streaming
- [x] Tactic detection via dual LLM call architecture
- [x] 4-state mood engine with transition matrix
- [x] Dynamic mathematical price curve
- [x] Session persistence in MongoDB
- [x] Global leaderboard with Socket.io
- [x] JWT authentication + admin panel

### Phase 2 — Intelligence Layer ✅
- [x] AI Learning Engine (analytics-driven prompt adaptation)
- [x] Walk-away mechanic (configurable per-difficulty thresholds)
- [x] Redis caching for performance
- [x] BullMQ job queue for analytics aggregation
- [x] 12+ edge case handling in prompts
- [x] Product catalog with upsert seeding

### Phase 3 — Multi-Modal ✅
- [x] Voice input: Local Whisper AI (offline, cross-browser)
- [x] Voice output: SpeechSynthesis TTS
- [x] Camera-based facial emotion detection (MediaPipe)
- [x] Persistent voice/camera preferences (Zustand + localStorage)

### Phase 4 — Advanced AI (Planned)
- [ ] Reinforcement Learning loop (fine-tuned seller model)
- [ ] Multiple seller personalities (aggressive, friendly, indifferent)
- [ ] Multiplayer negotiation battles (2 users vs 1 AI)
- [ ] Post-game coaching mode (tactic analysis + improvement tips)
- [ ] Time-pressure mechanic (countdown timer per round)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/mood-engine-v2`
3. Commit changes: `git commit -m "feat: add desperation mood state"`
4. Push to branch: `git push origin feature/mood-engine-v2`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 Author

**Aditya**
Full Stack Developer | AI Systems Builder 🚀

> *"The goal was never to build a chatbot. The goal was to build a system that thinks, feels, adapts — and makes you work for every rupee."*

---

<div align="center">

**⭐ Star this repo if you found it interesting!**

Built with 🧠 Gemini AI · ⚡ Bun · ⚛️ React · 🍃 MongoDB · 🔴 Redis · 🎤 Whisper · 📷 MediaPipe

</div>
