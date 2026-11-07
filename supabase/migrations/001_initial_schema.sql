-- ============================================================================
-- VANIR GROUP — Initial Database Schema
-- Supabase / PostgreSQL
-- Version: 1.0.0
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Encryption helpers

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_tier AS ENUM ('standard', 'elite', 'ultra');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
CREATE TYPE booking_category AS ENUM ('hotel', 'flight', 'car', 'experience', 'private_aviation');
CREATE TYPE ai_mode AS ENUM ('concierge', 'planner', 'vision');
CREATE TYPE notification_status AS ENUM ('draft', 'sent', 'scheduled', 'failed');
CREATE TYPE notification_audience AS ENUM ('all', 'standard', 'elite', 'ultra', 'segment');
CREATE TYPE log_action AS ENUM ('create', 'update', 'delete', 'view', 'login', 'logout', 'approve', 'cancel');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'refunded', 'failed');
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP');

-- ============================================================================
-- TABLE: users
-- Core client profiles for elite travelers
-- ============================================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid    TEXT UNIQUE,                          -- Firebase Auth UID
    email           TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    phone           TEXT,
    avatar_url      TEXT,
    tier            user_tier NOT NULL DEFAULT 'standard',
    passport_number TEXT,                                 -- Encrypted at app layer
    nationality     TEXT,
    date_of_birth   DATE,
    preferred_currency currency_code DEFAULT 'USD',
    preferred_language TEXT DEFAULT 'en',
    -- Preferences (JSONB for flexibility)
    dietary_preferences TEXT[],
    travel_preferences  JSONB DEFAULT '{}'::JSONB,        -- room type, seat preference, etc.
    -- Concierge assignment
    assigned_concierge_id UUID,                           -- FK to admins table
    -- Stats (denormalized for dashboard speed)
    total_bookings      INTEGER NOT NULL DEFAULT 0,
    total_spend         NUMERIC(14,2) NOT NULL DEFAULT 0,
    loyalty_points      INTEGER NOT NULL DEFAULT 0,
    -- Timestamps
    last_active_at  TIMESTAMPTZ DEFAULT NOW(),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ                           -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- ============================================================================
-- TABLE: admins
-- Internal Vanir Group staff accounts
-- ============================================================================

CREATE TABLE admins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'concierge',    -- superadmin | manager | concierge | analyst
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: properties
-- Hotel, resort, villa, and penthouse listings
-- ============================================================================

CREATE TABLE properties (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,                        -- hotel | villa | resort | penthouse | yacht
    description     TEXT,
    country         TEXT NOT NULL,
    city            TEXT NOT NULL,
    address         TEXT,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    -- Pricing
    base_price_per_night NUMERIC(10,2) NOT NULL,
    currency        currency_code NOT NULL DEFAULT 'USD',
    -- Quality indicators
    star_rating     NUMERIC(2,1),                         -- 1.0 – 5.0
    review_score    NUMERIC(3,1),                         -- 0.0 – 10.0
    review_count    INTEGER NOT NULL DEFAULT 0,
    -- Media
    hero_image_url  TEXT,
    gallery_urls    TEXT[],
    -- Tags & features
    amenities       TEXT[],
    tags            TEXT[],                               -- 'pool', 'spa', 'butler', etc.
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    -- Partner info
    partner_id      TEXT,
    external_ref    TEXT,                                 -- Partner booking system ID
    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_country ON properties(country);
CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_name_trgm ON properties USING gin(name gin_trgm_ops);

-- ============================================================================
-- TABLE: flights
-- Flight listing catalogue (pulled from GDS or partner API)
-- ============================================================================

CREATE TABLE flights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    airline_name    TEXT NOT NULL,
    airline_code    TEXT NOT NULL,
    flight_number   TEXT NOT NULL,
    origin_city     TEXT NOT NULL,
    origin_code     TEXT NOT NULL,                        -- IATA code
    destination_city TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    departure_time  TIMETZ NOT NULL,
    arrival_time    TIMETZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    stops           INTEGER NOT NULL DEFAULT 0,
    cabin_class     TEXT NOT NULL,                        -- economy | business | first | private
    -- Pricing
    base_price      NUMERIC(10,2) NOT NULL,
    currency        currency_code NOT NULL DEFAULT 'USD',
    available_seats INTEGER NOT NULL DEFAULT 0,
    -- Features
    amenities       TEXT[],
    is_refundable   BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flights_origin ON flights(origin_code);
CREATE INDEX idx_flights_destination ON flights(destination_code);
CREATE INDEX idx_flights_cabin ON flights(cabin_class);

-- ============================================================================
-- TABLE: bookings
-- All confirmed and pending reservations
-- ============================================================================

CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    confirmation_code   TEXT NOT NULL UNIQUE DEFAULT 'VNR-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0'),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category            booking_category NOT NULL,
    -- Polymorphic references (only one will be set)
    property_id         UUID REFERENCES properties(id),
    flight_id           UUID REFERENCES flights(id),
    -- Guest details
    guest_name          TEXT NOT NULL,
    guest_email         TEXT NOT NULL,
    guest_phone         TEXT,
    adults              INTEGER NOT NULL DEFAULT 1,
    children            INTEGER NOT NULL DEFAULT 0,
    infants             INTEGER NOT NULL DEFAULT 0,
    -- Dates
    check_in_date       DATE,
    check_out_date      DATE,
    -- Pricing
    base_amount         NUMERIC(10,2) NOT NULL,
    taxes_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
    fees_amount         NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL,
    currency            currency_code NOT NULL DEFAULT 'USD',
    -- Payment
    payment_status      payment_status NOT NULL DEFAULT 'pending',
    payment_method      TEXT,
    payment_ref         TEXT,
    -- Status
    status              booking_status NOT NULL DEFAULT 'pending',
    cancellation_reason TEXT,
    -- Additional context
    special_requests    TEXT,
    internal_notes      TEXT,
    metadata            JSONB DEFAULT '{}'::JSONB,
    -- Concierge assignment
    concierge_id        UUID REFERENCES admins(id),
    -- Timestamps
    booked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_category ON bookings(category);
CREATE INDEX idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
CREATE INDEX idx_bookings_concierge ON bookings(concierge_id);

-- ============================================================================
-- TABLE: ai_itineraries
-- AI-generated trip plans stored per user
-- ============================================================================

CREATE TABLE ai_itineraries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    destination     TEXT NOT NULL,
    start_date      DATE,
    end_date        DATE,
    duration_days   INTEGER NOT NULL,
    budget_usd      NUMERIC(12,2),
    travelers       INTEGER NOT NULL DEFAULT 1,
    -- AI content
    ai_model        TEXT NOT NULL,
    prompt_used     TEXT,
    itinerary_json  JSONB NOT NULL,                       -- Structured day-by-day plan
    -- Status
    is_saved        BOOLEAN NOT NULL DEFAULT FALSE,
    linked_booking_id UUID REFERENCES bookings(id),
    -- Timestamps
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_itineraries_user ON ai_itineraries(user_id);
CREATE INDEX idx_ai_itineraries_destination ON ai_itineraries(destination);

-- ============================================================================
-- TABLE: ai_conversations
-- Chat history for the AI concierge
-- ============================================================================

CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode            ai_mode NOT NULL DEFAULT 'concierge',
    title           TEXT,                                 -- Auto-generated summary title
    -- Escalation tracking
    escalated_at    TIMESTAMPTZ,
    escalated_to    UUID REFERENCES admins(id),
    -- Timestamps
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL,
    tokens_used     INTEGER,
    model           TEXT,
    -- Timestamps
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_sent_at ON ai_messages(sent_at);

-- ============================================================================
-- TABLE: ai_prompt_configs
-- Admin-managed AI system prompts and parameters
-- ============================================================================

CREATE TABLE ai_prompt_configs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode            ai_mode NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    system_prompt   TEXT NOT NULL,
    temperature     NUMERIC(3,2) NOT NULL DEFAULT 0.75,
    max_tokens      INTEGER NOT NULL DEFAULT 1024,
    model           TEXT NOT NULL DEFAULT 'gpt-4o',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    -- Audit
    updated_by      UUID REFERENCES admins(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: notifications
-- Push notification broadcasts
-- ============================================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    image_url       TEXT,
    deep_link       TEXT,
    audience        notification_audience NOT NULL DEFAULT 'all',
    segment_filter  JSONB,                                -- Custom audience query
    status          notification_status NOT NULL DEFAULT 'draft',
    scheduled_for   TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    -- Analytics
    total_sent      INTEGER DEFAULT 0,
    total_opened    INTEGER DEFAULT 0,
    open_rate       NUMERIC(5,2),
    -- Audit
    created_by      UUID REFERENCES admins(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: admin_logs
-- Immutable audit trail of admin actions
-- ============================================================================

CREATE TABLE admin_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id        UUID NOT NULL REFERENCES admins(id),
    action          log_action NOT NULL,
    resource_type   TEXT NOT NULL,                        -- 'booking' | 'user' | 'property' | 'ai_config' | etc.
    resource_id     UUID,
    payload_before  JSONB,
    payload_after   JSONB,
    ip_address      INET,
    user_agent      TEXT,
    performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_resource ON admin_logs(resource_type, resource_id);
CREATE INDEX idx_admin_logs_performed ON admin_logs(performed_at DESC);

-- ============================================================================
-- TABLE: reviews
-- Guest reviews for properties and experiences
-- ============================================================================

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    booking_id      UUID NOT NULL REFERENCES bookings(id),
    property_id     UUID REFERENCES properties(id),
    rating          NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           TEXT,
    body            TEXT,
    photos          TEXT[],
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_property ON reviews(property_id) WHERE is_published = TRUE;
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_prompt_configs_updated_at
    BEFORE UPDATE ON ai_prompt_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update user stats when a booking is confirmed
CREATE OR REPLACE FUNCTION sync_user_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE users
        SET
            total_bookings = total_bookings + 1,
            total_spend = total_spend + NEW.total_amount,
            loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 10)
        WHERE id = NEW.user_id;
    END IF;
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE users
        SET
            total_bookings = GREATEST(0, total_bookings - 1),
            total_spend = GREATEST(0, total_spend - OLD.total_amount)
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_stats_sync
    AFTER UPDATE OF status ON bookings
    FOR EACH ROW EXECUTE FUNCTION sync_user_booking_stats();

-- Auto-tier promotion based on spend
CREATE OR REPLACE FUNCTION auto_promote_user_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_spend >= 1000000 AND NEW.tier != 'ultra' THEN
        NEW.tier = 'ultra';
    ELSIF NEW.total_spend >= 100000 AND NEW.tier = 'standard' THEN
        NEW.tier = 'elite';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_tier_promotion
    BEFORE UPDATE OF total_spend ON users
    FOR EACH ROW EXECUTE FUNCTION auto_promote_user_tier();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "users_own_profile" ON users
    USING (auth.uid()::TEXT = firebase_uid);

-- Users can only see their own bookings
CREATE POLICY "bookings_own" ON bookings
    USING (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT));

-- Users can only see their own conversations
CREATE POLICY "ai_conversations_own" ON ai_conversations
    USING (user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT));

-- Service role bypasses all RLS (for admin operations)
-- Configure service_role key in Supabase dashboard

-- ============================================================================
-- SEED: Default AI Prompt Configurations
-- ============================================================================

INSERT INTO ai_prompt_configs (mode, name, system_prompt, temperature, max_tokens, model) VALUES
(
    'concierge',
    'AI Concierge',
    'You are the VANIR Group AI Concierge — an elite virtual assistant for ultra-high-net-worth individuals. Speak with refinement and warmth. Address guests by title and surname. Never mention pricing limitations. Always propose premium bespoke solutions.',
    0.75,
    1024,
    'gpt-4o'
),
(
    'planner',
    'AI Trip Planner',
    'You are the VANIR AI Trip Planner. Craft bespoke, detailed day-by-day itineraries. Structure each day as Morning/Afternoon/Evening. Include specific named venues. Suggest exclusive, off-the-beaten-path experiences. End each itinerary with 3 "Signature Vanir Touches".',
    0.85,
    2048,
    'gpt-4o'
),
(
    'vision',
    'Vision & Translation',
    'You are the VANIR Vision AI. For landmarks: provide rich historical context and premium access tips. For translation: prioritize accuracy with cultural nuance. Always maintain the luxury persona — be the personal Egyptologist or sommelier.',
    0.60,
    512,
    'gpt-4o'
);

-- ============================================================================
-- End of migration 001
-- ============================================================================
