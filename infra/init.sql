-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector extension (optional - for future AI features)
-- CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create enum types
CREATE TYPE user_role AS ENUM ('USER', 'AGENCY_ADMIN', 'AGENT');
CREATE TYPE trip_mode AS ENUM ('DIY', 'AGENT', 'UMRAH');
CREATE TYPE plan_tier AS ENUM ('BUDGET', 'COMFORT', 'LUXURY');
CREATE TYPE plan_status AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE book_link_type AS ENUM ('FLIGHT', 'HOTEL', 'ACTIVITY', 'RAIL', 'TRANSFER');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    home_airport VARCHAR(10),
    preferences JSONB DEFAULT '{}',
    halal_preference BOOLEAN DEFAULT false,
    kids_preference BOOLEAN DEFAULT false,
    luxury_level INTEGER DEFAULT 1,
    travel_style VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agencies
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    logo_url TEXT,
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent pricing formulas
CREATE TABLE agent_pricing_formulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    formula_name VARCHAR(255) NOT NULL,
    formula_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip requests
CREATE TABLE trip_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    mode trip_mode NOT NULL DEFAULT 'DIY',
    destination VARCHAR(255),
    start_date DATE,
    end_date DATE,
    passengers INTEGER DEFAULT 1,
    budget_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'MYR',
    preferences JSONB DEFAULT '{}',
    status plan_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip plans
CREATE TABLE trip_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_request_id UUID REFERENCES trip_requests(id) ON DELETE CASCADE,
    tier plan_tier NOT NULL,
    total_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    emissions_kg DECIMAL(8,2),
    plan_json JSONB NOT NULL,
    source_providers JSONB DEFAULT '[]',
    status plan_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book links
CREATE TABLE book_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID REFERENCES trip_plans(id) ON DELETE CASCADE,
    type book_link_type NOT NULL,
    provider VARCHAR(100) NOT NULL,
    deeplink_url TEXT NOT NULL,
    price_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'MYR',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID REFERENCES trip_plans(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    verified_receipt BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(100) NOT NULL,
    place_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    types TEXT[],
    halal_score DECIMAL(3,2),
    kids_score DECIMAL(3,2),
    location JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Umrah guides
CREATE TABLE umrah_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(10) NOT NULL,
    day INTEGER NOT NULL,
    step INTEGER NOT NULL,
    content_md TEXT NOT NULL,
    references_json JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price watchers
CREATE TABLE price_watchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    criteria_json JSONB NOT NULL,
    channel VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment intents
CREATE TABLE payment_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_plan_id UUID REFERENCES trip_plans(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payload_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NEW: Destination trends
CREATE TABLE destination_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_code VARCHAR(10) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    snapshot_date DATE NOT NULL,
    signals_json JSONB DEFAULT '{}',
    popularity_score DECIMAL(5,2),
    min_price_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'MYR',
    weather_json JSONB DEFAULT '{}',
    events_json JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package catalog
CREATE TABLE package_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_code VARCHAR(10) NOT NULL,
    tier plan_tier NOT NULL,
    inclusions JSONB DEFAULT '{}',
    source_refs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top 10 snapshots
CREATE TABLE top10_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    filters JSONB DEFAULT '{}',
    list_json JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_trip_requests_user_id ON trip_requests(user_id);
CREATE INDEX idx_trip_requests_status ON trip_requests(status);
CREATE INDEX idx_trip_plans_trip_request_id ON trip_plans(trip_request_id);
CREATE INDEX idx_book_links_expires_at ON book_links(expires_at);
CREATE INDEX idx_destination_trends_code_date ON destination_trends(destination_code, snapshot_date);
CREATE INDEX idx_top10_snapshots_budget_currency ON top10_snapshots(budget_cents, currency);
CREATE INDEX idx_top10_snapshots_generated_at ON top10_snapshots(generated_at);

-- Create vector index for similarity search (if needed)
-- pgvector extension required for this index
-- CREATE INDEX idx_places_embedding ON places USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
