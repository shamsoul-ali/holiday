-- Holiday AI Platform Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE itinerary_status AS ENUM ('draft', 'saved', 'booked', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE favorite_type AS ENUM ('itinerary', 'destination');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    nationality TEXT,
    preferred_currency TEXT DEFAULT 'MYR',
    travel_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    average_budget DECIMAL(10,2),
    best_months TEXT[], -- Array of months like ['Jan', 'Feb', 'Dec']
    popular_activities TEXT[], -- Array of activities
    weather_info JSONB DEFAULT '{}', -- Weather data from OpenWeather API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries table
CREATE TABLE public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration TEXT NOT NULL, -- e.g., '1-week', '3-5-days'
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2) NOT NULL,
    travelers INTEGER NOT NULL DEFAULT 1,
    preferences JSONB NOT NULL DEFAULT '{}', -- User selected preferences
    itinerary_data JSONB NOT NULL DEFAULT '{}', -- Generated itinerary details
    status itinerary_status DEFAULT 'draft',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    itinerary_id UUID NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    booking_reference TEXT NOT NULL UNIQUE,
    status booking_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'MYR',
    payment_status payment_status DEFAULT 'pending',
    booking_data JSONB NOT NULL DEFAULT '{}', -- Flight, hotel, activity bookings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type favorite_type NOT NULL,
    reference_id UUID NOT NULL, -- ID of itinerary or destination
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't favorite the same item twice
    UNIQUE(user_id, type, reference_id)
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    photos TEXT[], -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure review is for either itinerary or destination, not both
    CHECK (
        (itinerary_id IS NOT NULL AND destination_id IS NULL) OR
        (itinerary_id IS NULL AND destination_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX idx_itineraries_status ON public.itineraries(status);
CREATE INDEX idx_itineraries_destination ON public.itineraries(destination);
CREATE INDEX idx_itineraries_created_at ON public.itineraries(created_at DESC);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_destinations_country ON public.destinations(country);
CREATE INDEX idx_destinations_city ON public.destinations(city);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON public.itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
-- destinations table is public, no RLS needed

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Itineraries policies
CREATE POLICY "Users can view own itineraries" ON public.itineraries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public itineraries" ON public.itineraries
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own itineraries" ON public.itineraries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" ON public.itineraries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" ON public.itineraries
    FOR DELETE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert sample destinations
INSERT INTO public.destinations (name, country, city, description, image_url, average_budget, best_months, popular_activities) VALUES
('Tokyo Metropolitan Area', 'Japan', 'Tokyo', 'A vibrant metropolis blending traditional culture with cutting-edge technology', NULL, 5000.00, ARRAY['Mar', 'Apr', 'May', 'Oct', 'Nov'], ARRAY['Sightseeing', 'Food Tours', 'Cultural Sites', 'Shopping']),
('Bali Paradise', 'Indonesia', 'Bali', 'Tropical paradise with beautiful beaches, temples, and rich culture', NULL, 3000.00, ARRAY['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], ARRAY['Beach Activities', 'Temple Visits', 'Yoga Retreats', 'Water Sports']),
('Singapore City', 'Singapore', 'Singapore', 'Modern city-state with world-class attractions and cuisine', NULL, 4000.00, ARRAY['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], ARRAY['City Tours', 'Food Courts', 'Gardens', 'Shopping']),
('Bangkok Adventure', 'Thailand', 'Bangkok', 'Bustling capital with vibrant street life, temples, and markets', NULL, 2500.00, ARRAY['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], ARRAY['Temple Tours', 'Street Food', 'River Cruises', 'Night Markets']),
('Seoul Experience', 'South Korea', 'Seoul', 'Dynamic capital city with rich history and modern K-culture', NULL, 4500.00, ARRAY['Apr', 'May', 'Sep', 'Oct', 'Nov'], ARRAY['Cultural Sites', 'K-pop Tours', 'Food Tours', 'Shopping']);

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
    RETURN 'HA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT JSON_BUILD_OBJECT(
        'total_itineraries', (SELECT COUNT(*) FROM public.itineraries WHERE user_id = user_uuid),
        'total_bookings', (SELECT COUNT(*) FROM public.bookings WHERE user_id = user_uuid),
        'total_reviews', (SELECT COUNT(*) FROM public.reviews WHERE user_id = user_uuid),
        'total_favorites', (SELECT COUNT(*) FROM public.favorites WHERE user_id = user_uuid),
        'completed_trips', (SELECT COUNT(*) FROM public.bookings WHERE user_id = user_uuid AND status = 'completed'),
        'total_spent', (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE user_id = user_uuid AND payment_status = 'paid')
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get popular destinations
CREATE OR REPLACE FUNCTION get_popular_destinations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    destination_id UUID,
    name TEXT,
    country TEXT,
    city TEXT,
    description TEXT,
    image_url TEXT,
    average_budget DECIMAL(10,2),
    booking_count BIGINT,
    average_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.country,
        d.city,
        d.description,
        d.image_url,
        d.average_budget,
        COUNT(DISTINCT b.id) as booking_count,
        COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) as average_rating
    FROM public.destinations d
    LEFT JOIN public.itineraries i ON d.city = SPLIT_PART(i.destination, ',', 1)
    LEFT JOIN public.bookings b ON i.id = b.itinerary_id
    LEFT JOIN public.reviews r ON d.id = r.destination_id
    GROUP BY d.id, d.name, d.country, d.city, d.description, d.image_url, d.average_budget
    ORDER BY booking_count DESC, average_rating DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;