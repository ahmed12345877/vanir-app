# VANIR GROUP — Personal Travel Gateway
## Comprehensive Development Blueprint & Architecture Guide

> Ultra-luxury travel concierge, private aviation, and bespoke VIP experiences for high-net-worth individuals.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Database Schema](#3-database-schema-overview)
4. [App User Flow](#4-app-user-flow)
5. [Visual Identity System](#5-visual-identity-system)
6. [AI Studio Architecture](#6-ai-studio-architecture)
7. [API Design](#7-api-design)
8. [Security & Authentication](#8-security--authentication)
9. [Execution Roadmap](#9-execution-roadmap)
10. [Environment Variables](#10-environment-variables)
11. [Getting Started](#11-getting-started)

---

## 1. Tech Stack

### Mobile Application (iOS & Android)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **React Native 0.86** | Cross-platform, production-grade, existing codebase |
| Language | **TypeScript 5** | Type safety throughout |
| Navigation | **React Navigation 7** (Stack + Bottom Tabs) | Industry standard, fully native |
| State | **Zustand** | Minimal, predictable global state |
| Server State | **TanStack Query v5 + tRPC** | Type-safe API layer already wired |
| Auth | **Firebase Auth** (Google + Apple OAuth) | Already integrated |
| Gradients | **react-native-linear-gradient** | Native gradient rendering |
| Animations | **React Native Reanimated 3** | 60fps animations on UI thread |
| Image | **Expo Image** or **FastImage** | Lazy loading with blur placeholders |
| AI Calls | **OpenAI SDK** / **Anthropic SDK** | Direct from app or via tRPC |
| Analytics | **Firebase Analytics** | Already in dependency tree |

### Admin Dashboard (Web)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14** (App Router) | SSR, RSC, excellent DX |
| Language | **TypeScript 5** | Consistent with mobile |
| Styling | **Tailwind CSS 3** | Utility-first, custom gold palette |
| Charts | **Recharts** | React-native charts with SVG |
| Data Fetching | **TanStack Query** | Consistent caching strategy |
| Auth | **Supabase Auth** | Admin session management |
| Animations | **Framer Motion** | Smooth transitions |
| Icons | **Lucide React** | Consistent icon system |
| Rich Text | **TipTap** (optional) | For prompt editing |

### Backend

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API | **tRPC** + **Node.js** (existing) | Already wired; type-safe end-to-end |
| Database | **Supabase (PostgreSQL)** | Real-time + RLS + Edge Functions |
| Auth Provider | **Firebase Auth** → **Supabase Auth** | Migrate or run in parallel |
| Storage | **Supabase Storage** | Profile images, gallery assets |
| AI | **OpenAI GPT-4o** + **Claude Sonnet 4.6** | Complementary capabilities |
| Payments | **Stripe** | PCI-compliant, global coverage |
| Push Notifications | **Firebase Cloud Messaging** | Cross-platform push |
| CDN | **Cloudflare** | Global edge delivery |
| Email | **Resend** | Transactional email |

### AI Integration

| Feature | Technology | Model |
|---------|-----------|-------|
| AI Concierge Chat | OpenAI Chat Completions API | `gpt-4o` |
| Trip Planner | OpenAI Chat Completions API | `gpt-4o` |
| Vision & Translation | OpenAI Vision API | `gpt-4o` |
| Predictive Recommendations | OpenAI Embeddings + pgvector | `text-embedding-3-small` |
| Safety / Content Filtering | Anthropic Claude | `claude-haiku-4-5` |

---

## 2. Repository Structure

```
vanir-group/
├── android/                  # Android native project
├── ios/                      # iOS native project
├── src/                      # Mobile app source
│   ├── components/           # Reusable UI components
│   │   ├── ArtDecoHeader.tsx     # Art Deco decorative headers
│   │   ├── CategorySwitcher.tsx  # Stays/Flights/Cars/AI tab bar
│   │   ├── ChatBubble.tsx        # AI conversation bubbles
│   │   ├── FlightCard.tsx        # Flight result card
│   │   ├── GlassCard.tsx         # Glassmorphism card wrapper
│   │   ├── GoldButton.tsx        # Gold CTA button (3 variants)
│   │   ├── PremiumBadge.tsx      # VIP/Refundable/Elite badges
│   │   ├── PropertyCard.tsx      # Hotel/villa result card
│   │   ├── Screen.tsx            # Base screen layout
│   │   └── SearchCard.tsx        # Unified search input card
│   ├── context/
│   │   └── AuthContext.tsx       # Firebase auth context
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   └── trpc.tsx              # tRPC client setup
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # App navigation tree
│   │   └── types.ts              # Navigation type definitions
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   └── main/
│   │       ├── AIStudioScreen.tsx       # ✨ NEW: AI chat interface
│   │       ├── BlogScreen.tsx
│   │       ├── BookingScreen.tsx
│   │       ├── DashboardScreen.tsx
│   │       ├── GalleryScreen.tsx
│   │       ├── HomeScreen.tsx           # ✨ REDESIGNED: Unified booking
│   │       ├── OffersScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       ├── ReviewsScreen.tsx
│   │       └── SearchResultsScreen.tsx  # ✨ NEW: Premium results
│   ├── services/
│   │   ├── api.ts
│   │   └── firebase.ts
│   └── theme/
│       ├── colors.ts            # ✨ ENHANCED: Full palette
│       ├── spacing.ts           # ✨ NEW: Spacing + shadows
│       └── typography.ts        # ✨ NEW: Text style system
├── admin/                    # Next.js admin dashboard
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── bookings/page.tsx     # Booking management
│   │   ├── users/page.tsx        # Client CRM
│   │   ├── ai-studio/page.tsx    # AI prompt configurator
│   │   └── notifications/page.tsx # Push notification broadcaster
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── RecentBookings.tsx
│   │   ├── ai/
│   │   │   └── PromptEditor.tsx
│   │   └── users/
│   │       └── UserTable.tsx
│   ├── lib/
│   │   └── types.ts
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full PostgreSQL schema
├── App.tsx                    # React Native entry point
├── package.json
└── BLUEPRINT.md               # This document
```

---

## 3. Database Schema Overview

### Core Tables

```
┌─────────────────────────────────────────────────────┐
│                    USERS                            │
│ id, firebase_uid, email, name, tier (ultra/elite/  │
│ standard), total_spend, loyalty_points, preferences │
└──────────────────────┬──────────────────────────────┘
                       │ 1:N
          ┌────────────┼────────────┬────────────────┐
          ▼            ▼            ▼                ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────┐
    │BOOKINGS  │ │AI_CONVS  │ │AI_ITINERARIES│ │  REVIEWS  │
    │status    │ │mode      │ │itinerary_json│ │rating 1-5 │
    │category  │ │messages  │ │budget_usd    │ │body       │
    │total_amt │ └──────────┘ └──────────────┘ └───────────┘
    └────┬─────┘
         │
    ┌────┴──────┐
    │ PROPERTIES│   FLIGHTS   ADMINS   NOTIFS   ADMIN_LOGS
    │ HOTELS    │
    │ VILLAS    │   (separate  (staff)  (push)   (audit)
    │ RESORTS   │    catalogue)
    └───────────┘
```

### Key Relationships

- **Users** → many **Bookings** (hotel, flight, car, experience)
- **Users** → many **AI Conversations** (each with many messages)
- **Users** → many **AI Itineraries** (saved AI-generated plans)
- **Bookings** → one **Property** or **Flight** (polymorphic)
- **Bookings** → one **Admin** (assigned concierge)
- **AI Prompt Configs** → 3 rows (concierge, planner, vision) — admin-managed

### Auto-tier Promotion Rules (DB trigger)

| Cumulative Spend | Tier |
|-----------------|------|
| < $100,000 | Standard |
| ≥ $100,000 | Elite |
| ≥ $1,000,000 | Ultra |

---

## 4. App User Flow

### 4.1 Guest → Booking Flow

```
SPLASH SCREEN
    │ (2s animated logo)
    ▼
HOME SCREEN (Guest Mode)
    │
    ├── [Category: Stays]
    │       │ Enter destination + dates + guests
    │       ▼
    │   SEARCH RESULTS
    │       │ Sorted by recommended
    │       │ Filter by price/rating
    │       ▼
    │   PROPERTY DETAIL
    │       │ Gallery, reviews, amenities
    │       ▼
    │   BOOKING SCREEN ──► [Not signed in?] ──► SIGN IN
    │       │                                      │
    │       │◄─────────────────────────────────────┘
    │       ▼
    │   PAYMENT SCREEN (Stripe)
    │       ▼
    │   BOOKING CONFIRMED ✓
    │       │
    │       ▼
    │   DASHBOARD (bookings history)
    │
    ├── [Category: Flights] ── Same flow with FlightCard
    ├── [Category: Cars] ── Simplified (pickup, date, duration)
    └── [Category: AI Studio] ──► AI STUDIO SCREEN

### 4.2 AI Studio Flow

AI STUDIO
    │
    ├── [Concierge Mode]
    │       │ Quick prompt chips: "Book dinner at Nusr-Et"
    │       │ Free-form conversation
    │       │ AI arranges: restaurants, transfers, modifications
    │       │ Escalation to human concierge if needed
    │
    ├── [Trip Planner Mode]
    │       │ Enter: destination, dates, budget, preferences
    │       │ AI generates full day-by-day itinerary
    │       │ Save itinerary → Dashboard
    │       │ Convert itinerary to actual bookings
    │
    └── [Vision Mode]
            │ Camera opens (with permission request)
            │ Point at landmark/text
            │ AI returns: historical context / translation
```

### 4.3 Admin Flow

```
ADMIN LOGIN (email + password or SSO)
    ▼
ADMIN DASHBOARD
    ├── OVERVIEW
    │       Stats cards, revenue chart, recent bookings
    │       Platform health indicators
    │       Top destinations
    │
    ├── BOOKINGS
    │       Full table with filters (status, category, date)
    │       Inline: approve, cancel, assign concierge
    │       Booking detail modal with full history
    │
    ├── CLIENTS & CRM
    │       User table with tier badges
    │       Travel history per user
    │       Direct chat intervention in AI conversations
    │       Concierge assignment
    │
    ├── AI STUDIO
    │       Module selector (Concierge / Planner / Vision)
    │       System prompt editor (Monaco/CodeMirror)
    │       Model + temperature + max_tokens sliders
    │       Save → Immediate effect on new conversations
    │       Sandbox test interface
    │
    └── NOTIFICATIONS
            Compose form (title + body + audience)
            Audience targeting (All / Elite / Ultra / Segment)
            Schedule for future delivery
            History with open rates
```

---

## 5. Visual Identity System

### Color Palette

```
Backgrounds:
  #080810  — Deep black (primary bg)
  #0f0f1a  — Surface (cards, panels)
  #14141f  — Surface Alt (inputs)
  #1a1a2a  — Elevated (modals)

Gold Palette (Art Deco signature):
  #e8c97a  — Gold Light (headings, icons)
  #c9a84c  — Gold Primary (CTAs, borders)
  #8b6914  — Gold Dark (button gradient end)
  rgba(201,168,76,0.15) — Gold Muted (backgrounds)
  rgba(201,168,76,0.25) — Gold Border
  rgba(201,168,76,0.5)  — Gold Border Strong

Typography:
  #f5f0e8  — Text Primary (warm white)
  #a8a099  — Text Secondary
  #5a5560  — Text Muted

Status:
  #3fb98f  — Success / Confirmed
  #d86a6a  — Danger / Cancelled
  #e0a035  — Warning / Pending
  #7eb3ff  — Info / Informational
```

### Typography Scale

- **Display**: Georgia serif, 48px, tracking +3px — Logo, hero
- **Heading 1**: 34px bold, tracking +0.5px — Screen titles
- **Heading 2**: 28px bold — Section titles
- **Heading 3**: 24px semibold — Card titles
- **Body**: 15px regular, 1.5 line-height — Content
- **Label**: 11px bold, ALL CAPS, tracking +2px, gold — Metadata
- **Price**: 22px bold — Pricing display
- **Caption**: 11px regular, muted — Supporting text

### Art Deco Design Language

- **Geometric ornaments**: Thin diagonal lines, diamond separators, corner brackets
- **Layering**: Dark base → glass overlay → gold accent on top
- **Borders**: Ultra-thin (1px) gold or white/6% borders on all cards
- **Spacing**: 8px base grid, generous internal padding (16–20px)
- **Border radius**: 12px (inputs), 16–20px (cards), 24px (primary cards)
- **Shadows**: Always dark, never light. Gold glow on interactive elements.
- **Egyptian heritage echoes**: Hieroglyph-inspired icons (◈ ◉ ◎ ◆ ✦), column-like vertical dividers, symmetrical layouts

---

## 6. AI Studio Architecture

### Request Flow

```
Mobile App
    │
    ▼ (user sends message)
tRPC Mutation: ai.chat
    │
    ▼
Server (Node.js)
    │
    ├── Load system prompt from DB (ai_prompt_configs)
    ├── Build conversation history (ai_messages)
    ├── Call OpenAI Chat Completions API
    │       model: gpt-4o
    │       system: <admin-configured prompt>
    │       messages: [history...]
    │       stream: true (for streaming responses)
    ├── Save ai_message (user + assistant) to DB
    ├── Check for escalation triggers
    │       keywords: "human", "speak to someone", "emergency"
    │       → set conversation.escalated_at, notify admin
    └── Return streaming response to mobile
```

### Vision API Flow (Multimodal)

```
Mobile Camera → Base64 Image
    ▼
tRPC Mutation: ai.analyzeImage
    ▼
Server → OpenAI Vision API
    │  model: gpt-4o
    │  messages: [{ role: "user", content: [{ type: "image_url", ... }, { type: "text", text: "Describe this..." }] }]
    ▼
Response: Historical context / Translation
    ▼
Display in AI Studio Vision panel
```

### Predictive Recommendations

```
1. On booking completion → generate embedding of (destination + category + travel_style)
2. Store embedding vector in pgvector column on ai_itineraries
3. On home screen load → cosine similarity search against user's past bookings
4. Return top-5 recommended destinations/properties
5. Display in "Just for You" section on HomeScreen
```

---

## 7. API Design

### Key tRPC Routes

```typescript
// Auth
auth.me() → UserProfile
auth.login(email, password) → session
auth.logout() → void

// Search
search.properties(destination, checkIn, checkOut, guests, filters) → Property[]
search.flights(origin, dest, date, passengers, cabinClass) → Flight[]

// Bookings
bookings.create(BookingInput) → { id, confirmationCode }
bookings.list() → Booking[]
bookings.getById(id) → BookingDetail
bookings.cancel(id, reason?) → void

// AI
ai.chat(conversationId?, message, mode) → AIMessage (streaming)
ai.startConversation(mode) → { conversationId, greeting }
ai.analyzeImage(base64, mode) → string
ai.generateItinerary(params) → Itinerary
ai.saveItinerary(itineraryId) → void

// Admin (protected)
admin.bookings.list(filters) → Booking[]
admin.bookings.approve(id) → void
admin.bookings.cancel(id, reason) → void
admin.users.list(filters) → User[]
admin.users.getById(id) → UserDetail
admin.aiConfigs.list() → AIPromptConfig[]
admin.aiConfigs.update(mode, config) → AIPromptConfig
admin.notifications.create(NotificationInput) → Notification
admin.notifications.send(id) → void
admin.analytics.overview() → DashboardStats
admin.analytics.revenue(period) → RevenueDataPoint[]
```

---

## 8. Security & Authentication

### Mobile (Firebase Auth)

- Google Sign-In via `@react-native-google-signin/google-signin`
- Apple Sign-In via `@invertase/react-native-apple-authentication`
- Session token exchanged with server via tRPC (existing pattern)
- Biometric lock (FaceID/TouchID) for sensitive operations (bookings > $5K)

### Admin Dashboard (Supabase Auth)

- Email + password with MFA (TOTP via authenticator app)
- Session managed by Supabase `auth.getSession()`
- Role-based access control (RBAC) via `admin.role` column:
  - `superadmin`: full access
  - `manager`: view all + approve/cancel bookings
  - `concierge`: view assigned clients only
  - `analyst`: read-only analytics access

### Database Security

- Row-Level Security (RLS) enabled on all user-facing tables
- Service role key only on server (never client-side)
- All admin operations logged to `admin_logs` (immutable)
- Passport numbers and payment details encrypted at application layer

### API Security

- All tRPC procedures protected by session middleware
- Rate limiting via Upstash Redis (100 req/min per user, 10 req/min for AI)
- Input validation via Zod schemas
- SQL injection impossible (Supabase SDK uses parameterized queries)

---

## 9. Execution Roadmap

### Phase 1: Foundation (Weeks 1–4)
**Goal: Production-ready MVP booking experience**

- [ ] Mobile: Complete HomeScreen redesign (DONE ✅)
- [ ] Mobile: SearchResults screen with real API integration
- [ ] Mobile: PropertyDetail screen with gallery
- [ ] Mobile: Booking flow with Stripe payment
- [ ] Backend: Supabase migration 001 deployed
- [ ] Backend: tRPC routes for search + bookings wired to DB
- [ ] Backend: Firebase → Supabase session bridge
- [ ] Admin: Deploy Next.js dashboard (Vercel)
- [ ] Admin: Bookings table with approve/cancel actions

**Milestone:** Users can search, book, and pay for a hotel.

---

### Phase 2: AI Studio (Weeks 5–8)
**Goal: Fully functional AI Concierge**

- [ ] Mobile: AI Studio screen with Concierge mode (DONE ✅)
- [ ] Mobile: Trip Planner mode with itinerary saving
- [ ] Mobile: Vision mode with camera integration
- [ ] Backend: OpenAI API integration (streaming responses)
- [ ] Backend: ai_conversations + ai_messages DB logging
- [ ] Backend: Human escalation trigger + admin notification
- [ ] Admin: AI Prompt Editor (DONE ✅)
- [ ] Admin: Live conversation viewer for concierge intervention
- [ ] Push: FCM integration for booking confirmations

**Milestone:** AI Concierge handling 80% of standard requests.

---

### Phase 3: Premium Experience (Weeks 9–12)
**Goal: World-class polish and personalization**

- [ ] Mobile: Personalized Dashboard with booking management
- [ ] Mobile: Reanimated animations (hero card parallax, smooth transitions)
- [ ] Mobile: Predictive AI recommendations on home screen
- [ ] Mobile: Offline mode with optimistic UI
- [ ] Mobile: Dark/light mode toggle (dark default)
- [ ] Backend: pgvector for recommendation embeddings
- [ ] Backend: Loyalty points tracking and redemption
- [ ] Admin: Full analytics dashboard with export
- [ ] Admin: Notification broadcaster (DONE ✅)
- [ ] Push: Scheduled and segmented notifications

**Milestone:** Elite users rate the experience 4.8+ stars.

---

### Phase 4: Scale & Launch (Weeks 13–16)
**Goal: Production launch with monitoring**

- [ ] App Store submission (iOS + Android)
- [ ] Performance: Lighthouse ≥ 90 for admin dashboard
- [ ] Performance: <2s cold start on React Native app
- [ ] Security: Full penetration test
- [ ] Analytics: Mixpanel/Amplitude event tracking
- [ ] Monitoring: Sentry (errors) + Datadog (infrastructure)
- [ ] CDN: All property images on Cloudflare R2
- [ ] Documentation: API docs + admin user manual
- [ ] Training: Concierge team AI handoff protocols

**Milestone:** Public launch to Vanir Group elite client list.

---

### Phase 5: AI Enhancement (Month 5+)
**Goal: Competitive AI moat**

- [ ] Fine-tuned model on Vanir brand voice and luxury travel data
- [ ] Real-time flight price monitoring + proactive alerts
- [ ] Multi-modal itinerary building (with embedded flight + hotel booking)
- [ ] AI voice concierge (using Whisper + TTS)
- [ ] Concierge-to-AI handoff (human concierge → AI continues thread)
- [ ] Apple Watch companion app for booking status
- [ ] Arabic language support (for GCC market)

---

## 10. Environment Variables

### Mobile App (`.env`)

```bash
API_BASE_URL=https://api.vanirgroup.com
FIREBASE_PROJECT_ID=vanir-group-prod
FIREBASE_API_KEY=...
GOOGLE_WEB_CLIENT_ID=...
OPENAI_API_KEY=...           # Only if calling AI directly from app
STRIPE_PUBLISHABLE_KEY=...
```

### Admin Dashboard (`admin/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # Server-only, never exposed
OPENAI_API_KEY=...
RESEND_API_KEY=...
FIREBASE_PROJECT_ID=vanir-group-prod
```

### Backend API (`.env` / Railway / Fly.io)

```bash
DATABASE_URL=postgresql://...   # Supabase connection string
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
FIREBASE_ADMIN_SDK=...          # Base64-encoded service account JSON
STRIPE_SECRET_KEY=...
FCM_SERVER_KEY=...
UPSTASH_REDIS_URL=...           # Rate limiting
JWT_SECRET=...
```

---

## 11. Getting Started

### Mobile App

```bash
# Install dependencies
npm install

# iOS (requires macOS + Xcode)
cd ios && pod install && cd ..
npm run ios

# Android (requires Android Studio)
npm run android

# Metro bundler
npm start
```

### Admin Dashboard

```bash
cd admin
npm install
cp .env.example .env.local    # Fill in Supabase + OpenAI keys
npm run dev                   # http://localhost:3001
```

### Database Setup

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or run directly in Supabase SQL editor:
# Copy contents of supabase/migrations/001_initial_schema.sql
```

---

## Architecture Decision Records (ADRs)

### ADR-001: React Native over Flutter
**Decision:** Keep React Native (existing codebase, Firebase already integrated, tRPC in place).
**Tradeoff:** Flutter has better performance for animation-heavy UIs, but migration cost > benefit.

### ADR-002: tRPC over REST/GraphQL
**Decision:** Continue with tRPC for type-safe end-to-end API.
**Tradeoff:** Tightly couples frontend to backend; acceptable for Vanir's controlled stack.

### ADR-003: Supabase over custom PostgreSQL
**Decision:** Supabase provides RLS, real-time, storage, and auth out of the box.
**Tradeoff:** Vendor dependency; mitigated by standard PostgreSQL underneath.

### ADR-004: GPT-4o for all AI features
**Decision:** Single model simplifies prompt management. Admin can switch per-mode.
**Tradeoff:** More expensive than GPT-4o-mini; justified by luxury positioning.

### ADR-005: Admin as separate Next.js app
**Decision:** Separate deployment, separate auth, separate codebase.
**Rationale:** Clean separation of concerns; admin panel never exposed to app store review.

---

*VANIR GROUP — Where luxury meets intelligence.*
*Built with care by the Vanir Engineering Team.*
