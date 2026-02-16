-- Holiday AI Platform Database Schema
-- Complete travel booking and management system

-- Users table with enhanced travel profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(3), -- ISO country code
    passport_number VARCHAR(50),
    passport_expiry DATE,
    preferred_currency VARCHAR(3) DEFAULT 'MYR',
    travel_preferences JSONB, -- dietary, accessibility, etc.
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Travel bookings - master booking record
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_reference VARCHAR(20) UNIQUE NOT NULL, -- e.g., HAI-ABC123
    booking_type VARCHAR(20) NOT NULL, -- 'complete_trip', 'flight_only', 'hotel_only'
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded, failed
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    booking_date TIMESTAMP DEFAULT NOW(),
    travel_start_date DATE NOT NULL,
    travel_end_date DATE NOT NULL,
    traveler_count INTEGER NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Flight bookings
CREATE TABLE flight_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amadeus_booking_id VARCHAR(100), -- External booking reference
    origin_airport VARCHAR(3) NOT NULL, -- IATA code
    destination_airport VARCHAR(3) NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE, -- NULL for one-way
    airline_code VARCHAR(3) NOT NULL,
    flight_number VARCHAR(10) NOT NULL,
    flight_details JSONB NOT NULL, -- Full flight information
    passenger_details JSONB NOT NULL, -- Array of passenger info
    booking_class VARCHAR(1) DEFAULT 'Y', -- Economy, Business, First
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
    confirmation_code VARCHAR(50),
    e_ticket_numbers TEXT[], -- Array of e-ticket numbers
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hotel bookings
CREATE TABLE hotel_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    external_booking_id VARCHAR(100), -- Booking.com/Agoda booking ID
    hotel_id VARCHAR(100) NOT NULL, -- From our hotel search
    hotel_name VARCHAR(255) NOT NULL,
    hotel_address JSONB NOT NULL, -- Full address details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INTEGER NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    room_count INTEGER NOT NULL,
    guest_count INTEGER NOT NULL,
    guest_details JSONB NOT NULL, -- Array of guest information
    special_requests TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    confirmation_code VARCHAR(50),
    cancellation_policy JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity and experience bookings
CREATE TABLE activity_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    activity_id VARCHAR(100) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50), -- tour, restaurant, attraction, etc.
    provider VARCHAR(100), -- GetYourGuide, Viator, etc.
    activity_date DATE NOT NULL,
    activity_time TIME,
    duration_hours INTEGER,
    participant_count INTEGER NOT NULL,
    participant_details JSONB,
    meeting_point JSONB, -- Address and coordinates
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    confirmation_code VARCHAR(50),
    voucher_info JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transportation bookings (cars, transfers, etc.)
CREATE TABLE transport_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    transport_type VARCHAR(50), -- car_rental, airport_transfer, train, bus
    provider VARCHAR(100), -- Hertz, Uber, etc.
    pickup_location JSONB NOT NULL,
    dropoff_location JSONB,
    pickup_datetime TIMESTAMP NOT NULL,
    dropoff_datetime TIMESTAMP,
    vehicle_details JSONB, -- Car model, features, etc.
    driver_details JSONB,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    confirmation_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    payment_provider VARCHAR(50) DEFAULT 'stripe',
    payment_intent_id VARCHAR(255) NOT NULL,
    payment_method_id VARCHAR(255),
    transaction_type VARCHAR(20), -- payment, refund, partial_refund
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL, -- succeeded, failed, pending, cancelled
    failure_reason TEXT,
    provider_response JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Travel documents
CREATE TABLE travel_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    document_type VARCHAR(50), -- passport, visa, insurance, ticket, voucher
    document_name VARCHAR(255),
    document_data JSONB, -- Structured document information
    file_url VARCHAR(500), -- S3 or local storage URL
    expiry_date DATE,
    issued_date DATE,
    issuing_authority VARCHAR(255),
    document_number VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Itineraries (AI-generated and user-modified)
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    itinerary_data JSONB NOT NULL, -- Day-by-day schedule
    ai_generated BOOLEAN DEFAULT true,
    user_customized BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false, -- For sharing
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Travel notifications and alerts
CREATE TABLE travel_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    notification_type VARCHAR(50), -- flight_delay, weather_alert, check_in_reminder
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    delivery_method VARCHAR(20) DEFAULT 'app', -- app, email, sms
    created_at TIMESTAMP DEFAULT NOW()
);

-- User reviews and ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    reviewable_type VARCHAR(50), -- hotel, flight, activity, overall_trip
    reviewable_id VARCHAR(100), -- External ID of reviewed item
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    photos TEXT[], -- Array of photo URLs
    is_verified BOOLEAN DEFAULT false, -- Verified booking
    helpful_count INTEGER DEFAULT 0,
    response_text TEXT, -- Provider response
    created_at TIMESTAMP DEFAULT NOW()
);

-- Travel preferences and history analytics
CREATE TABLE travel_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50), -- search, view, book, cancel, complete
    event_data JSONB NOT NULL,
    destination VARCHAR(100),
    travel_dates DATERANGE,
    booking_value DECIMAL(10,2),
    currency VARCHAR(3),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_travel_dates ON bookings(travel_start_date, travel_end_date);
CREATE INDEX idx_flight_bookings_booking_id ON flight_bookings(booking_id);
CREATE INDEX idx_hotel_bookings_booking_id ON hotel_bookings(booking_id);
CREATE INDEX idx_notifications_user_unread ON travel_notifications(user_id, is_read);
CREATE INDEX idx_reviews_verified ON reviews(is_verified, rating);
CREATE INDEX idx_analytics_user_events ON travel_analytics(user_id, event_type, created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flight_bookings_updated_at BEFORE UPDATE ON flight_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON hotel_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON itineraries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();