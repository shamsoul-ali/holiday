-- =====================================================
-- Holiday AI - Halal & Umrah Module Database Migration
-- Version: 1.0
-- Module: Halal Travel Features
-- =====================================================

-- Enable PostGIS for geospatial queries (optional but recommended)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- 1. HALAL RESTAURANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS halal_restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,

    -- Location data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(3) NOT NULL,
    postal_code VARCHAR(20),

    -- Restaurant details
    cuisine_types VARCHAR(50)[] NOT NULL DEFAULT '{}',
    price_range VARCHAR(10) CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
    average_meal_cost DECIMAL(8, 2),
    currency VARCHAR(3) DEFAULT 'MYR',

    -- Halal certification
    certification_type VARCHAR(100),
    certification_body VARCHAR(255),
    certification_number VARCHAR(100),
    certification_expiry DATE,
    is_certified BOOLEAN DEFAULT false,

    -- Ratings & reviews
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER DEFAULT 0,
    google_rating DECIMAL(2, 1),
    google_place_id VARCHAR(255),

    -- Operating hours (JSON format)
    operating_hours JSONB DEFAULT '{
        "monday": {"open": "10:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "10:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "10:00", "close": "22:00", "closed": false},
        "thursday": {"open": "10:00", "close": "22:00", "closed": false},
        "friday": {"open": "10:00", "close": "22:00", "closed": false},
        "saturday": {"open": "10:00", "close": "22:00", "closed": false},
        "sunday": {"open": "10:00", "close": "22:00", "closed": false}
    }'::jsonb,

    -- Contact info
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Features & amenities
    features JSONB DEFAULT '{
        "prayer_room": false,
        "family_friendly": false,
        "parking": false,
        "wifi": false,
        "wheelchair_accessible": false,
        "outdoor_seating": false,
        "delivery": false,
        "takeaway": false
    }'::jsonb,

    -- Media
    photos TEXT[],
    menu_url VARCHAR(255),

    -- Metadata
    data_source VARCHAR(50),
    external_id VARCHAR(255),
    last_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_halal_restaurants_location ON halal_restaurants(city, country);
CREATE INDEX idx_halal_restaurants_lat_lng ON halal_restaurants(latitude, longitude);
CREATE INDEX idx_halal_restaurants_certification ON halal_restaurants(is_certified);
CREATE INDEX idx_halal_restaurants_rating ON halal_restaurants(rating DESC);
CREATE INDEX idx_halal_restaurants_cuisine ON halal_restaurants USING GIN(cuisine_types);
CREATE INDEX idx_halal_restaurants_active ON halal_restaurants(is_active, city);

-- Full-text search
CREATE INDEX idx_halal_restaurants_search ON halal_restaurants USING gin(to_tsvector('english', name || ' ' || COALESCE(address, '')));

COMMENT ON TABLE halal_restaurants IS 'Halal-certified and Muslim-friendly restaurants worldwide';

-- =====================================================
-- 2. HALAL HOTELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS halal_hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,

    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(3) NOT NULL,
    postal_code VARCHAR(20),

    -- Hotel details
    star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    hotel_type VARCHAR(50) CHECK (hotel_type IN ('hotel', 'resort', 'apartment', 'guesthouse', 'hostel')),

    -- Muslim-friendly features
    prayer_facilities BOOLEAN DEFAULT false,
    quran_in_room BOOLEAN DEFAULT false,
    halal_food BOOLEAN DEFAULT false,
    halal_certified_kitchen BOOLEAN DEFAULT false,
    female_only_floors BOOLEAN DEFAULT false,
    separate_pool_hours BOOLEAN DEFAULT false,
    qibla_direction BOOLEAN DEFAULT false,
    no_alcohol BOOLEAN DEFAULT false,

    -- Room information
    total_rooms INTEGER,
    room_types JSONB,

    -- Pricing
    price_per_night_from DECIMAL(10, 2),
    price_per_night_to DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'MYR',

    -- Ratings
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER DEFAULT 0,
    muslim_friendliness_score INTEGER CHECK (muslim_friendliness_score BETWEEN 0 AND 100),

    -- Amenities
    amenities JSONB DEFAULT '{
        "wifi": false,
        "parking": false,
        "pool": false,
        "gym": false,
        "spa": false,
        "restaurant": false,
        "room_service": false,
        "airport_shuttle": false,
        "business_center": false
    }'::jsonb,

    -- Nearby mosques
    nearest_mosque_distance_km DECIMAL(5, 2),

    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Booking info
    booking_urls JSONB DEFAULT '{}'::jsonb,

    -- Media
    photos TEXT[],

    -- Metadata
    data_source VARCHAR(50),
    external_id VARCHAR(255),
    last_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_halal_hotels_location ON halal_hotels(city, country);
CREATE INDEX idx_halal_hotels_lat_lng ON halal_hotels(latitude, longitude);
CREATE INDEX idx_halal_hotels_rating ON halal_hotels(rating DESC);
CREATE INDEX idx_halal_hotels_price ON halal_hotels(price_per_night_from);
CREATE INDEX idx_halal_hotels_muslim_score ON halal_hotels(muslim_friendliness_score DESC);
CREATE INDEX idx_halal_hotels_active ON halal_hotels(is_active, city);

-- Full-text search
CREATE INDEX idx_halal_hotels_search ON halal_hotels USING gin(to_tsvector('english', name || ' ' || address));

COMMENT ON TABLE halal_hotels IS 'Muslim-friendly and Shariah-compliant hotels';

-- =====================================================
-- 3. MOSQUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mosques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,

    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(3) NOT NULL,
    postal_code VARCHAR(20),

    -- Mosque details
    mosque_type VARCHAR(50) CHECK (mosque_type IN ('masjid', 'musalla', 'islamic_center', 'jummah_only')),
    capacity INTEGER,

    -- Services & facilities
    services TEXT[] DEFAULT '{}',
    has_wudu_area BOOLEAN DEFAULT true,
    has_female_section BOOLEAN DEFAULT true,
    wheelchair_accessible BOOLEAN DEFAULT false,
    parking_available BOOLEAN DEFAULT false,

    -- Prayer times information
    follows_calculation_method VARCHAR(50),

    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),

    -- Social media
    social_media JSONB DEFAULT '{}'::jsonb,

    -- Photos
    photos TEXT[],

    -- Metadata
    google_place_id VARCHAR(255),
    data_source VARCHAR(50),
    last_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mosques_location ON mosques(city, country);
CREATE INDEX idx_mosques_lat_lng ON mosques(latitude, longitude);
CREATE INDEX idx_mosques_type ON mosques(mosque_type);
CREATE INDEX idx_mosques_active ON mosques(is_active, city);

-- Full-text search
CREATE INDEX idx_mosques_search ON mosques USING gin(to_tsvector('english', name || ' ' || address));

COMMENT ON TABLE mosques IS 'Mosques and prayer facilities worldwide';

-- =====================================================
-- 4. UMRAH PACKAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS umrah_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Package basic info
    package_name VARCHAR(255) NOT NULL,
    package_code VARCHAR(50) UNIQUE,
    provider_name VARCHAR(255) NOT NULL,
    provider_license_no VARCHAR(100),

    -- Package details
    package_type VARCHAR(20) CHECK (package_type IN ('economy', 'standard', 'premium', 'vip', 'custom')),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    includes_medina BOOLEAN DEFAULT true,
    medina_days INTEGER DEFAULT 0,
    makkah_days INTEGER NOT NULL,

    -- Dates
    departure_date DATE,
    return_date DATE,
    is_flexible_dates BOOLEAN DEFAULT false,
    available_from DATE,
    available_until DATE,

    -- Pricing
    price_per_person DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    single_supplement DECIMAL(10, 2),
    child_discount_percentage DECIMAL(5, 2) DEFAULT 0,

    -- Capacity
    total_capacity INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    min_group_size INTEGER DEFAULT 1,

    -- Inclusions
    inclusions JSONB NOT NULL DEFAULT '{
        "flights": true,
        "visa": true,
        "accommodation": true,
        "transport": true,
        "meals": false,
        "guide": true,
        "ziyarat": false
    }'::jsonb,

    -- Accommodation details
    makkah_hotel_name VARCHAR(255),
    makkah_hotel_distance_to_haram INTEGER,
    medina_hotel_name VARCHAR(255),
    medina_hotel_distance_to_masjid INTEGER,

    -- Flight details
    airline VARCHAR(100),
    departure_airport VARCHAR(3),

    -- Detailed itinerary
    itinerary JSONB,

    -- Terms & conditions
    terms_conditions TEXT,
    cancellation_policy TEXT,

    -- Requirements
    required_documents TEXT[],
    health_requirements TEXT[],

    -- Reviews
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER DEFAULT 0,

    -- Booking
    booking_url VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),

    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_umrah_packages_departure_date ON umrah_packages(departure_date);
CREATE INDEX idx_umrah_packages_price ON umrah_packages(price_per_person);
CREATE INDEX idx_umrah_packages_type ON umrah_packages(package_type);
CREATE INDEX idx_umrah_packages_available ON umrah_packages(is_active, available_slots);
CREATE INDEX idx_umrah_packages_featured ON umrah_packages(is_featured, rating DESC);

COMMENT ON TABLE umrah_packages IS 'Umrah travel packages from licensed operators';

-- =====================================================
-- 5. USER PRAYER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_prayer_preferences (
    user_id UUID PRIMARY KEY,

    -- Calculation method
    calculation_method VARCHAR(50) NOT NULL DEFAULT 'ISNA' CHECK (calculation_method IN (
        'ISNA', 'MWL', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari', 'Custom'
    )),

    -- Juristic method (Hanafi or Shafi)
    juristic_method VARCHAR(20) DEFAULT 'Shafi' CHECK (juristic_method IN ('Hanafi', 'Shafi')),

    -- Time adjustments (in minutes)
    fajr_adjustment INTEGER DEFAULT 0,
    dhuhr_adjustment INTEGER DEFAULT 0,
    asr_adjustment INTEGER DEFAULT 0,
    maghrib_adjustment INTEGER DEFAULT 0,
    isha_adjustment INTEGER DEFAULT 0,

    -- Notification preferences
    notifications_enabled BOOLEAN DEFAULT true,
    notification_times JSONB DEFAULT '{
        "fajr": true,
        "dhuhr": true,
        "asr": true,
        "maghrib": true,
        "isha": true
    }'::jsonb,

    -- Adhan settings
    adhan_sound_enabled BOOLEAN DEFAULT false,
    adhan_sound_type VARCHAR(50),

    -- Location preferences
    auto_detect_location BOOLEAN DEFAULT true,
    default_location_lat DECIMAL(10, 8),
    default_location_lng DECIMAL(11, 8),
    default_location_name VARCHAR(255),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_prayer_preferences IS 'User-specific prayer times calculation preferences';

-- =====================================================
-- 6. PRAYER TIMES CACHE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS prayer_times_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Location
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(3),

    -- Date
    prayer_date DATE NOT NULL,

    -- Prayer times (in UTC)
    fajr_time TIME NOT NULL,
    sunrise_time TIME NOT NULL,
    dhuhr_time TIME NOT NULL,
    asr_time TIME NOT NULL,
    maghrib_time TIME NOT NULL,
    isha_time TIME NOT NULL,

    -- Calculation method used
    calculation_method VARCHAR(50) NOT NULL,

    -- Timezone info
    timezone VARCHAR(50) NOT NULL,
    timezone_offset INTEGER NOT NULL,

    -- Cache metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,

    -- Unique constraint
    UNIQUE(latitude, longitude, prayer_date, calculation_method)
);

-- Indexes
CREATE INDEX idx_prayer_times_cache_location_date ON prayer_times_cache(latitude, longitude, prayer_date);
CREATE INDEX idx_prayer_times_cache_expires ON prayer_times_cache(expires_at);

COMMENT ON TABLE prayer_times_cache IS 'Cached prayer times to reduce API calls';

-- =====================================================
-- 7. HALAL PRODUCT CATEGORIES TABLE (for future expansion)
-- =====================================================
CREATE TABLE IF NOT EXISTS halal_product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id UUID REFERENCES halal_product_categories(id),
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sample categories
INSERT INTO halal_product_categories (category_name, description) VALUES
    ('Restaurants', 'Halal restaurants and eateries'),
    ('Hotels', 'Muslim-friendly accommodations'),
    ('Mosques', 'Prayer facilities'),
    ('Tours', 'Halal-friendly tour packages'),
    ('Activities', 'Family-friendly halal activities')
ON CONFLICT (category_name) DO NOTHING;

-- =====================================================
-- 8. USER HALAL PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_halal_preferences (
    user_id UUID PRIMARY KEY,

    -- Dietary preferences
    dietary_restrictions TEXT[] DEFAULT '{}',
    preferred_cuisines TEXT[] DEFAULT '{}',

    -- Accommodation preferences
    requires_separate_facilities BOOLEAN DEFAULT false,
    prefers_no_alcohol_property BOOLEAN DEFAULT true,
    requires_prayer_room BOOLEAN DEFAULT true,

    -- Travel preferences
    prefers_halal_tours BOOLEAN DEFAULT true,
    requires_female_guide BOOLEAN DEFAULT false,
    family_travel_priority BOOLEAN DEFAULT false,

    -- Certification preferences
    requires_certification BOOLEAN DEFAULT false,
    trusted_certification_bodies TEXT[] DEFAULT '{}',

    -- Notification preferences
    notify_halal_options BOOLEAN DEFAULT true,
    notify_prayer_times BOOLEAN DEFAULT true,
    notify_nearby_mosques BOOLEAN DEFAULT true,

    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_halal_preferences IS 'User preferences for halal travel and dining';

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_halal_restaurants_updated_at BEFORE UPDATE ON halal_restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_halal_hotels_updated_at BEFORE UPDATE ON halal_hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mosques_updated_at BEFORE UPDATE ON mosques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_umrah_packages_updated_at BEFORE UPDATE ON umrah_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Earth's radius in km
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);

    a := sin(dLat/2) * sin(dLat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dLon/2) * sin(dLon/2);

    c := 2 * atan2(sqrt(a), sqrt(1-a));

    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Find nearest halal restaurants
CREATE OR REPLACE FUNCTION find_nearest_halal_restaurants(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km DECIMAL DEFAULT 5,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    restaurant_id UUID,
    name VARCHAR,
    distance_km DECIMAL,
    rating DECIMAL,
    price_range VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        hr.id,
        hr.name,
        calculate_distance_km(p_latitude, p_longitude, hr.latitude, hr.longitude) AS distance_km,
        hr.rating,
        hr.price_range
    FROM halal_restaurants hr
    WHERE hr.is_active = true
        AND calculate_distance_km(p_latitude, p_longitude, hr.latitude, hr.longitude) <= p_radius_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Find nearest mosques
CREATE OR REPLACE FUNCTION find_nearest_mosques(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km DECIMAL DEFAULT 5,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    mosque_id UUID,
    name VARCHAR,
    distance_km DECIMAL,
    mosque_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.name,
        calculate_distance_km(p_latitude, p_longitude, m.latitude, m.longitude) AS distance_km,
        m.mosque_type
    FROM mosques m
    WHERE m.is_active = true
        AND calculate_distance_km(p_latitude, p_longitude, m.latitude, m.longitude) <= p_radius_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Umrah Packages Summary
CREATE OR REPLACE VIEW umrah_packages_summary AS
SELECT
    up.id,
    up.package_name,
    up.package_type,
    up.provider_name,
    up.duration_days,
    up.includes_medina,
    up.price_per_person,
    up.currency,
    up.departure_date,
    up.available_slots,
    up.rating,
    up.reviews_count,
    up.is_featured,
    up.makkah_hotel_distance_to_haram,
    up.medina_hotel_distance_to_masjid
FROM umrah_packages up
WHERE up.is_active = true
    AND up.available_slots > 0
    AND (up.available_until IS NULL OR up.available_until >= CURRENT_DATE);

-- =====================================================
-- SAMPLE DATA (for development/testing)
-- =====================================================

-- Sample halal restaurant
INSERT INTO halal_restaurants (
    name, latitude, longitude, address, city, country,
    cuisine_types, price_range, is_certified, rating
) VALUES (
    'Al-Noor Restaurant',
    3.1390, 101.6869,
    '123 Jalan Sultan, Kuala Lumpur',
    'Kuala Lumpur', 'MYS',
    ARRAY['Middle Eastern', 'Malaysian'],
    '$$',
    true,
    4.5
) ON CONFLICT DO NOTHING;

-- Sample mosque
INSERT INTO mosques (
    name, latitude, longitude, address, city, country,
    mosque_type, has_female_section, wheelchair_accessible
) VALUES (
    'Masjid Jamek',
    3.1478, 101.6953,
    'Jalan Tun Perak, Kuala Lumpur',
    'Kuala Lumpur', 'MYS',
    'masjid',
    true,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
