# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Holiday AI Planner is an AI-first travel platform built as a monorepo with a web frontend (Next.js), Python backend (FastAPI), and native mobile app (Expo/React Native). The platform generates personalized travel itineraries by integrating with 25+ travel APIs, AI services, and payment providers. It supports B2C travel planning, B2B agent tools, and specialized Umrah/halal travel features.

### 🚨 CRITICAL: Project Status & Security

**Overall Completion:** 70% (Frontend: 65%, Backend: 75-80%, Infrastructure: 55%)

**⚠️ SECURITY ALERT:** This project has critical security vulnerabilities that MUST be addressed before any deployment:
- Hardcoded API keys in `docker-compose.yml` (EXPOSED in version control)
- Mock authentication using localStorage (NO real security)
- Weak database credentials
- No rate limiting enforced
- No secrets management

**See `PROJECT_STATUS.md` for complete analysis and remediation plan.**

### Project Status Documents

1. **PROJECT_STATUS.md** - Comprehensive project analysis including:
   - Component-by-component completion status
   - Critical security vulnerabilities and fixes
   - 10-week completion roadmap
   - Cost estimates and resource planning
   - Production deployment checklist

2. **CLAUDE.md** (this file) - Development guide for working in this codebase

3. **README.md** - User-facing project documentation

When working on this project, always consult PROJECT_STATUS.md first to understand current state and priorities.

## Architecture

### Monorepo Structure
```
Holiday AI Planner/
├── apps/
│   ├── web/          # Next.js 14 frontend (App Router)
│   ├── mobile/       # Expo React Native app (iOS + Android)
│   └── api/          # FastAPI Python backend
├── packages/         # (Future: shared packages)
└── infra/           # Docker, database configs
```

### Tech Stack
- **Web Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Mobile App**: Expo SDK 55, Expo Router v4, React Native, TypeScript, Zustand v5, React Native Reanimated v4, Moti
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15 + pgvector (for AI embeddings)
- **Cache**: Redis (with intelligent TTL strategies per data type)
- **AI**: OpenAI GPT-4 (primary), Anthropic Claude (fallback)
- **Auth**: Supabase
- **Payments**: Stripe (international), iPay88 (Malaysian market)
- **PWA**: next-pwa with extensive service worker caching

## Development Commands

### Full Stack Development
```bash
# Start all services (requires Docker)
docker-compose up -d

# Start individual services
docker-compose up db redis -d    # Infrastructure only
docker-compose up api -d         # Backend + infra
docker-compose up web -d         # Frontend + backend + infra

# Or use npm workspace commands
npm run dev              # All services via concurrently
npm run dev:web          # Frontend only (port 3010)
npm run dev:api          # Backend only (port 8000)
```

### Frontend (apps/web)
```bash
cd apps/web
npm run dev              # Dev server on port 3010
npm run build            # Production build
npm start                # Production server
npm run lint             # ESLint
npm run type-check       # TypeScript validation
```

### Backend (apps/api)
```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Database migrations
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Mobile App (apps/mobile)
```bash
cd apps/mobile
npx expo start           # Dev server (Expo Go or dev client)
npx expo start --ios     # Launch iOS simulator
npx expo start --android # Launch Android emulator
npx tsc --noEmit         # TypeScript type checking

# EAS Build (requires eas-cli)
npx eas build --profile development --platform ios    # Dev build (simulator)
npx eas build --profile preview --platform ios        # Internal distribution
npx eas build --profile preview --platform android    # APK for testing
npx eas build --profile production                    # Store submission
```

### Testing
```bash
npm test                 # All tests
npm run test:web         # Frontend tests
npm run test:api         # Backend tests
```

## Key Architecture Patterns

### Frontend Architecture

**App Router Structure**: Uses Next.js 14 App Router with file-based routing:
- `/app/page.tsx` - Homepage with hero carousel and trip planning form
- `/app/results/page.tsx` - Search results with AI-generated itineraries
- `/app/itinerary/[id]/page.tsx` - Detailed itinerary view
- `/app/bookings/page.tsx` - Booking management dashboard
- `/app/halal/page.tsx` - Halal/Muslim-friendly travel features
- `/app/payment-plans/page.tsx` - BNPL payment options

**State Management**: Zustand for global state, React Query (@tanstack/react-query) for server state caching

**Authentication**: Supabase Auth with custom AuthProvider at `/apps/web/components/providers/AuthProvider.tsx`

**API Communication**: Centralized in `/apps/web/lib/api-config.ts` with axios instances

**UI Components**: shadcn/ui (Radix primitives) in `/apps/web/components/ui/`

### Mobile Architecture

**Purpose**: Demo/pitch app for investors. Pure simulation with mock data — zero API calls, no backend dependency.

**Routing**: Expo Router v4 file-based routing in `apps/mobile/app/`:
- `index.tsx` - Redirect logic (onboarding -> auth -> tabs)
- `onboarding/index.tsx` - 3-slide intro with parallax
- `(auth)/login.tsx, register.tsx` - Mock auth (pre-filled demo credentials)
- `(tabs)/` - 5-tab bottom nav: Home | Explore | Bookings | Halal | Profile

**State Management**: Zustand v5 stores in `apps/mobile/store/`:
- `authStore` - Login state, onboarding flag
- `tripStore` - 4-step wizard, AI generation simulation (rotating messages), package selection
- `bookingStore` - Bookings, wallet (MYR), payment processing (2s simulated delay)
- `halalStore` - Prayer times, halal restaurants, Umrah packages
- `appStore` - Theme, notifications, first-launch

**Design System** (`apps/mobile/constants/`):
- Primary: `#059669` (green), Secondary: `#d97706` (gold), Accent: `#0ea5e9` (blue)
- Fonts: Poppins (headings) + Inter (body) via @expo-google-fonts
- 3 tiers: Budget (`#10B981`), Comfort (`#3B82F6`), Luxury (`#D97706`)

**Mock Data** (`apps/mobile/data/`): Destinations, categories, packages (3-tier Tokyo), itineraries (5-day), bookings, halal info, Malaysian banks (FPX), e-wallets, user profile. All MYR currency.

**UI Components** (`apps/mobile/components/ui/`): Button, Card, Input, Badge, Chip, Skeleton, GlassCard, StarRating, ProgressBar

**Demo Flow**: Onboarding -> Login -> Home -> Plan Trip (4-step wizard) -> AI Loading -> 3-tier Results -> Itinerary Timeline -> Review + Add-ons -> Payment (FPX/Card/E-Wallet/BNPL) -> Confetti Success -> My Bookings

**EAS Config**: Bundle ID `com.holidayai.app`, EAS project ID `d75090bc-b325-4b84-86db-06188d253bfb`, profiles: development (simulator), preview (internal), production (store)

**TestFlight**: https://testflight.apple.com/join/HpxejJa9

### Backend Architecture

**AI Orchestrator** (`apps/api/services/ai_orchestrator.py`): The core "itinerary brain" that:
1. Normalizes user input (airports, currency, dates)
2. Searches across multiple providers in parallel
3. Generates 3 tier options (Budget/Comfort/Luxury)
4. Creates hour-by-hour itineraries with alternatives
5. Generates deep links to booking platforms

**API Key Manager** (`apps/api/config/api_keys.py`):
- Centralized validation and management of 25+ API providers
- Startup health checks with missing key warnings
- Non-blocking validation to allow platform to run with partial APIs
- Access via `/api/system/health` and `/api/system/api-keys/status`

**Caching Strategy** (`apps/api/services/cache_service.py`):
- Intelligent TTL by data type:
  - Flights: 5min (real-time pricing)
  - Hotels: 30min (availability)
  - Activities: 1hr (stable data)
  - AI itineraries: 24hr (content-based)
  - Weather: 30min
- Management endpoints: `/api/cache/health`, `/api/cache/stats`, `/api/cache/optimize`

**Vendor Broker System** (located in `packages/lib/`):
- Intelligent provider selection based on region, budget, and market segment
- Automatic failover between providers
- Partnership and affiliate status tracking

**Route Organization**:
- `apps/api/routes/` - Core routes (top10, planning, system, payments, cache)
- `apps/api/app/routers/` - Feature routes (umrah, auth, agents)
- All routers registered in `apps/api/main.py`

## Important API Endpoints

### Core Planning
- `POST /api/plan/create` - Create new trip itinerary
- `GET /api/plan/:id` - Fetch itinerary details
- `GET /api/top10` - AI-curated destination recommendations with real-time pricing

### System Management
- `GET /api/system/health` - Complete system health check
- `GET /api/system/api-keys/status` - Validate configured API keys
- `GET /api/system/env-template` - Generate .env template for setup

### Cache Management
- `GET /api/cache/health` - Redis connection status
- `GET /api/cache/stats` - Cache hit rates and performance metrics
- `POST /api/cache/warm` - Pre-warm cache for popular routes
- `DELETE /api/cache/flush/{type}` - Clear specific cache type

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/verify` - Verify payment status
- `POST /api/payments/stripe/webhook` - Stripe webhook handler
- `POST /api/payments/ipay88/callback` - iPay88 callback handler

### B2B & Umrah
- `POST /api/agents/formula/import` - Import agent pricing formulas
- `POST /api/umrah/plan` - Create Umrah-specific itinerary

## Environment Configuration

The platform requires API keys for full functionality. Key providers:

**Required for Basic Operation**:
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (AI generation)
- `AMADEUS_CLIENT_ID/SECRET` or `KIWI_API_KEY` (flights)
- `OPENWEATHER_API_KEY` (weather data)
- `GOOGLE_PLACES_API_KEY` (activities/places)

**Payment Processing**:
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- `IPAY88_MERCHANT_CODE`, `IPAY88_MERCHANT_KEY` (Malaysian market)

**Database & Cache**:
- `DATABASE_URL` (PostgreSQL connection string)
- `REDIS_URL` (Redis connection string)

**Authentication**:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

See `env.example` and run `curl http://localhost:8000/api/system/env-template` for complete template.

## Service Ports

- **Web Frontend**: http://localhost:3010
- **Mobile (Expo)**: http://localhost:8081 (Metro bundler)
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Recent Progress

### ✅ Latest Updates (March 2026)

**Expo Mobile App (apps/mobile)**:
- Built complete demo/pitch mobile app with 72 source files (~25k lines)
- 5-tab navigation: Home, Explore (AI trip wizard), Bookings, Halal Hub, Profile
- Full mock data layer — no backend dependency, all simulated
- Malaysian payment methods: FPX (8 banks), e-wallets (TnG/Boost/GrabPay/ShopeePay), BNPL
- Halal features: prayer times with countdown, JAKIM-certified restaurants, Umrah packages
- EAS project linked (ID: d75090bc-b325-4b84-86db-06188d253bfb)
- Tested on iOS simulator (iPhone 17 Pro Max), 2035 modules bundled successfully

### Previous Updates (February 2026)

**API Status Dashboard & Data Source Transparency**:
- Created comprehensive API Status Dashboard (`/api-dashboard`) showing real-time health of all API providers
- Added `APIStatusBanner` component that displays system health on homepage and results page
- Implemented `ProviderBadge` component showing which APIs power each feature (Amadeus, OpenAI, Google Places, etc.)
- Created backend health endpoint proxy (`/api/system/health`) connecting to FastAPI backend
- Added visual data source indicators on package cards showing whether data is from:
  - 🤖 AI Generated (OpenAI)
  - ✈️ Amadeus API (real flight/hotel data)
  - 📍 Google Places (hotel ratings)
  - ⚠️ Sample Data (hardcoded fallbacks)
- Fixed `getBasicDestinations` missing function error in destinations API
- Updated API configuration to support both server-side and client-side environment variables

**Files Modified**:
- `/apps/web/components/ProviderBadge.tsx` (created)
- `/apps/web/components/APIStatusBanner.tsx` (created)
- `/apps/web/components/EnhancedPackageCard.tsx` (updated with data source badges)
- `/apps/web/app/api-dashboard/page.tsx` (updated to use backend health)
- `/apps/web/app/api/system/health/route.ts` (created proxy route)
- `/apps/web/app/page.tsx` (added API status banner and provider badges)
- `/apps/web/app/results/page.tsx` (added data source tracking and console debugging)
- `/apps/web/app/api/destinations/search/route.ts` (fixed missing getBasicDestinations function)
- `/apps/web/lib/api-config.ts` (updated environment variable handling)

## Development Notes

### ⚠️ Known Issues & Limitations

**Frontend:**
- Authentication is currently MOCKED using localStorage (not production-ready)
- TypeScript strict mode is DISABLED (370+ instances of `any` types)
- State management (Zustand/React Query) installed but NOT configured
- Missing UI component library (only 1 of ~20 shadcn/ui components)
- NO tests written (0% coverage)
- Payment frontend incomplete (Stripe Elements not integrated)

**Backend:**
- Database models are Pydantic only (NO SQLAlchemy ORM for persistence)
- Alembic NOT configured (SQL migrations exist but no tooling)
- Some endpoints use mock data (agents dashboard, Umrah packages, Top-10)
- NO tests written (pytest configured but unused)

**Mobile:**
- Pure demo app — all mock data, no real backend integration
- No tests written
- Placeholder app icon (needs proper design asset)
- No push notifications configured
- No deep linking configured

**Infrastructure:**
- 🚨 CRITICAL: API keys exposed in docker-compose.yml
- 🚨 CRITICAL: Weak database password ("holiday_pass")
- NO CI/CD pipeline
- NO production Dockerfiles (only dev versions)
- NO automated backups

### Starting Development
1. **NEVER commit the .env file** - it contains real API keys
2. The platform runs with limited functionality even without API keys
3. On startup, the API validates configured keys and warns about missing ones
4. Use `/api/system/health` to check which services are operational
5. Mock data is used as fallback when real APIs are unavailable

### Database Migrations
- ⚠️ **Alembic is NOT configured** - needs initialization
- SQL migration files exist in `apps/api/migrations/` and `infra/init.sql`
- Need to initialize: `cd apps/api && alembic init alembic`
- Future: Use `alembic revision --autogenerate -m "description"` for schema changes

### PWA & Caching
- Service worker configured in `apps/web/next.config.js`
- Extensive runtime caching for travel API responses (Booking, Skyscanner, etc.)
- Different cache strategies per provider (CacheFirst vs NetworkFirst)
- Disabled in development mode

### AI Itinerary Generation
- Primary logic in `apps/api/services/ai_orchestrator.py`
- Generates 3 tiered options with different budgets
- Includes hour-by-hour schedules with buffer times
- Content-based caching for 24 hours
- Falls back to Claude if OpenAI fails

### Payment Flow
- Supports both Stripe (international) and iPay88 (Malaysia)
- Webhook handlers for async payment confirmations
- Digital receipt generation in `apps/web/lib/services/digital-receipt.ts`
- BNPL integration in `apps/web/lib/bnpl/`

### Halal/Muslim Travel Features
- Prayer times widget integration
- Halal dining filters in activity search
- Umrah-specific planning routes
- Family-friendly activity scoring

## Common Tasks

**Add new travel API provider**:
1. Add enum to `apps/api/config/api_keys.py` (APIProvider)
2. Create client in `apps/api/clients/{provider}_client.py`
3. Register in vendor broker selection logic
4. Add validation logic to api_key_manager
5. Update environment template

**Create new page**:
1. Add file to `apps/web/app/{route}/page.tsx`
2. Optionally add layout in `apps/web/app/{route}/layout.tsx`
3. Update Navigation component if needed
4. Add API routes in backend if required

**Database schema change**:
1. Modify models in `apps/api/models/`
2. Run `alembic revision --autogenerate -m "description"`
3. Review generated migration
4. Apply with `alembic upgrade head`

**Add caching to endpoint**:
1. Import cache_service in route handler
2. Use `await cache_service.get(key)` before expensive operation
3. Use `await cache_service.set(key, data, ttl)` to cache result
4. Set appropriate TTL based on data type (see caching strategy above)

**Add new mobile screen**:
1. Add file to `apps/mobile/app/{tab}/{screen}.tsx`
2. Use `ScreenHeader` component for consistent headers
3. Use design tokens from `constants/` (Colors, Typography, Spacing)
4. Add mock data to `apps/mobile/data/` if needed
5. Wire state through appropriate Zustand store in `apps/mobile/store/`

### Mobile Development Notes

- **Reanimated v4**: Does NOT need `react-native-reanimated/plugin` in babel.config.js (removed for v4 compatibility)
- **Static app.json**: EAS CLI requires static `app.json` (not dynamic `app.config.ts`) for `eas init` and project linking
- **Google Fonts**: Install with `--legacy-peer-deps` flag due to peer dependency conflicts
- **Expo Go testing**: App runs in Expo Go for development. For sharing with others, use `eas build --profile preview` for internal distribution (TestFlight-like)
- **Dependencies**: Use `npx expo install <package>` to auto-resolve SDK-compatible versions instead of `npm install`
- **Path alias**: `@/*` maps to project root (configured in tsconfig.json)
