# Holiday AI Planner 🚀✈️

**AI-first, one-stop travel OS for individuals, travel agents, and Umrah/halal travel**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)

## 🌟 Overview

Holiday AI Planner is a comprehensive travel planning platform that leverages artificial intelligence to create personalized itineraries. Users input their budget, preferences, and travel dates, and our AI generates bookable itineraries with flights, accommodations, activities, and transfers.

### ✨ Key Features

- **AI-Powered Itinerary Generation**: Get 3 personalized options (Budget/Comfort/Luxury) based on your preferences
- **Top-10 Destination Recommendations**: Real-time ranking based on budget, trends, weather, and events
- **Halal & Family Focus**: Specialized filters for halal dining and family-friendly activities
- **Multi-Provider Coverage**: Access to major travel providers (Amadeus, Kiwi, Expedia, etc.)
- **B2B Travel Agent Tools**: White-label solutions for agencies with pricing formulas
- **Umrah Specialization**: Dedicated planning for religious travel with licensed operators
- **Real-Time Pricing**: Live quotes with deep links to booking platforms
- **PWA Support**: Offline-capable progressive web app

## 🏗️ Architecture

```
Holiday AI Planner/
├── apps/
│   ├── web/           # Next.js 14 frontend (App Router, TypeScript)
│   ├── api/           # FastAPI backend (Python 3.11)
│   └── workers/       # Celery workers for background tasks
├── packages/
│   ├── ui/            # Shared UI components
│   ├── types/         # Shared TypeScript types
│   └── lib/           # Shared utilities and vendor broker
└── infra/             # Docker, database, and deployment configs
```

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15 + pgvector (for embeddings)
- **Cache & Queue**: Redis, Celery
- **AI/ML**: OpenAI API, Anthropic Claude
- **Monitoring**: Sentry, OpenTelemetry
- **Deployment**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.11+

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/holiday-ai-planner.git
cd holiday-ai-planner
```

### 2. Set Up Environment Variables

```bash
cp env.example .env
# Edit .env with your API keys and configuration
```

### 3. Start the Development Environment

```bash
# Start all services
docker-compose up -d

# Or start individual services
docker-compose up db redis -d
docker-compose up api -d
docker-compose up web -d
```

### 4. Access the Applications

- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (postgres/holiday)

## 📱 Features in Detail

### Top-10 Destination Recommendations

Our AI analyzes real-time data to rank destinations by:
- **Price Value**: Flight + hotel costs vs. budget
- **Popularity Trends**: Search/click patterns
- **Seasonality**: Weather comfort and peak timing
- **Events & Festivals**: Local happenings and holidays
- **Halal/Family Score**: Cultural and accessibility factors
- **Operational Reliability**: Flight performance and safety

### AI Itinerary Brain

The core AI system:
1. **Normalizes** user input (airport codes, currency conversion)
2. **Discovers** destinations if "suggest" mode is selected
3. **Searches** across multiple providers for best coverage
4. **Builds** hour-by-hour plans with buffers and alternatives
5. **Generates** deep links and caches results

### Vendor Broker System

Intelligent provider selection based on:
- Geographic region and market segment
- Partnership agreements and affiliate status
- Performance metrics and reliability scores
- Coverage and pricing competitiveness

## 🔧 Development

### Local Development Setup

```bash
# Install dependencies
npm install
cd apps/web && npm install
cd ../api && pip install -r requirements.txt

# Start development servers
npm run dev:web    # Frontend on :3004
npm run dev:api    # Backend on :8000
npm run dev        # All services
```

### Database Migrations

```bash
# Create new migration
cd apps/api
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:web
npm run test:api
```

## 🌍 API Endpoints

### Core Endpoints

- `POST /api/plan/create` - Create new trip plan
- `GET /api/plan/:id` - Fetch itinerary details
- `GET /api/top10` - Get destination recommendations
- `POST /api/agents/formula/import` - Import pricing formulas
- `POST /api/umrah/plan` - Create Umrah itinerary

### Top-10 API

```bash
GET /api/top10?budget=5000&currency=MYR&pax=2&halal=true&kids=true
```

Returns AI-curated destination list with:
- Real-time pricing
- Popularity scores
- Weather data
- Event highlights
- Sample packages

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Monorepo structure
- [x] Basic FastAPI backend
- [x] Next.js frontend with Top-10 carousel
- [x] Database schema
- [x] Vendor broker system

### Phase 2 (Next)
- [ ] AI orchestration engine
- [ ] Provider integrations (Amadeus, Kiwi, etc.)
- [ ] Real-time pricing and availability
- [ ] User authentication and profiles
- [ ] Trip planning workflow

### Phase 3 (Future)
- [ ] B2B agent dashboard
- [ ] Umrah specialization module
- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Multi-language support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

1. **Code Style**: Follow existing patterns and use Prettier/ESLint
2. **Testing**: Write tests for new features
3. **Documentation**: Update docs for API changes
4. **Commits**: Use conventional commit format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Travel APIs**: Amadeus, Kiwi, Expedia, GetYourGuide, Viator
- **AI Services**: OpenAI, Anthropic
- **Open Source**: Next.js, FastAPI, Tailwind CSS, and many more

## 📞 Support

- **Documentation**: [docs.holidayai.com](https://docs.holidayai.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/holiday-ai-planner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/holiday-ai-planner/discussions)
- **Email**: support@holidayai.com

---

**Built with ❤️ for travelers worldwide**

*"The world is a book, and those who do not travel read only one page." - Saint Augustine*
