-- Holiday AI Platform - Sample Data for Testing
-- Run this after the main schema is created

-- Insert more sample destinations
INSERT INTO public.destinations (name, country, city, description, image_url, average_budget, best_months, popular_activities, weather_info) VALUES
('Kyoto Cultural Journey', 'Japan', 'Kyoto', 'Ancient capital with thousands of temples, traditional architecture, and geisha districts', NULL, 4800.00, 
    ARRAY['Mar', 'Apr', 'May', 'Oct', 'Nov'], 
    ARRAY['Temple Visits', 'Cultural Tours', 'Traditional Gardens', 'Tea Ceremony'],
    '{"avg_temp": 20, "climate": "temperate", "rainy_season": "Jun-Jul"}'::jsonb),

('Kuala Lumpur Gateway', 'Malaysia', 'Kuala Lumpur', 'Multicultural capital with iconic twin towers, diverse cuisine, and modern shopping', NULL, 2800.00,
    ARRAY['May', 'Jun', 'Jul', 'Aug'], 
    ARRAY['City Tours', 'Food Courts', 'Shopping Malls', 'Cultural Sites'],
    '{"avg_temp": 28, "climate": "tropical", "humidity": "high"}'::jsonb),

('Hong Kong Experience', 'Hong Kong', 'Hong Kong', 'International financial hub with stunning skyline, dim sum, and shopping', NULL, 5500.00,
    ARRAY['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'], 
    ARRAY['Skyline Views', 'Dim Sum Tours', 'Shopping', 'Harbor Cruise'],
    '{"avg_temp": 24, "climate": "subtropical", "typhoon_season": "May-Nov"}'::jsonb),

('Dubai Luxury', 'UAE', 'Dubai', 'Modern oasis with luxury shopping, ultramodern architecture, and desert adventures', NULL, 8000.00,
    ARRAY['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'], 
    ARRAY['Desert Safari', 'Luxury Shopping', 'Skyscrapers', 'Beach Resorts'],
    '{"avg_temp": 30, "climate": "desert", "best_weather": "winter"}'::jsonb),

('Istanbul Bridge', 'Turkey', 'Istanbul', 'Historic city bridging Europe and Asia with rich Byzantine and Ottoman heritage', NULL, 3500.00,
    ARRAY['Apr', 'May', 'Sep', 'Oct'], 
    ARRAY['Historical Sites', 'Bazaars', 'Bosphorus Cruise', 'Turkish Cuisine'],
    '{"avg_temp": 18, "climate": "mediterranean", "best_months": "spring-autumn"}'::jsonb),

('London Classic', 'United Kingdom', 'London', 'Historic capital with royal palaces, world-class museums, and diverse culture', NULL, 7000.00,
    ARRAY['May', 'Jun', 'Jul', 'Aug', 'Sep'], 
    ARRAY['Museums', 'Royal Sites', 'Theatre Shows', 'Pub Culture'],
    '{"avg_temp": 15, "climate": "oceanic", "rainy": "frequent"}'::jsonb),

('Paris Romance', 'France', 'Paris', 'City of Light renowned for art, fashion, gastronomy, and romance', NULL, 6500.00,
    ARRAY['Apr', 'May', 'Jun', 'Sep', 'Oct'], 
    ARRAY['Museums', 'Fine Dining', 'Architecture', 'Fashion Shopping'],
    '{"avg_temp": 16, "climate": "oceanic", "peak_season": "spring-summer"}'::jsonb),

('Sydney Harbor', 'Australia', 'Sydney', 'Iconic harbor city with Opera House, beaches, and laid-back lifestyle', NULL, 8500.00,
    ARRAY['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'], 
    ARRAY['Harbor Views', 'Beach Activities', 'Wine Tours', 'Wildlife'],
    '{"avg_temp": 22, "climate": "oceanic", "summer": "Dec-Feb"}'::jsonb),

('New York Energy', 'USA', 'New York', 'The city that never sleeps with iconic landmarks, Broadway, and diverse neighborhoods', NULL, 9000.00,
    ARRAY['Apr', 'May', 'Jun', 'Sep', 'Oct'], 
    ARRAY['Broadway Shows', 'Museums', 'Central Park', 'Food Scene'],
    '{"avg_temp": 17, "climate": "humid_continental", "seasons": "distinct"}'::jsonb),

('Rome Eternal', 'Italy', 'Rome', 'Eternal city with ancient ruins, Vatican treasures, and incredible cuisine', NULL, 5800.00,
    ARRAY['Apr', 'May', 'Jun', 'Sep', 'Oct'], 
    ARRAY['Ancient Sites', 'Vatican Tours', 'Italian Cuisine', 'Art Museums'],
    '{"avg_temp": 19, "climate": "mediterranean", "peak": "spring-autumn"}'::jsonb);

-- SKIP DEMO USER CREATION FOR NOW
-- Note: Demo users should be created through the normal registration process
-- This avoids foreign key constraint issues with auth.users table

-- The destinations data above is sufficient for testing
-- Real users will create their own accounts through the app

DO $$
BEGIN
    RAISE NOTICE 'Skipping demo user creation to avoid auth.users foreign key issues.';
    RAISE NOTICE 'Please create user accounts through the application registration process.';
    RAISE NOTICE 'Once you have real user accounts, you can create itineraries, bookings, and other user-specific data through the app.';
END $$;

-- Update destination averages based on sample data
UPDATE public.destinations SET 
    average_budget = (
        SELECT AVG(i.budget) 
        FROM public.itineraries i 
        WHERE i.destination LIKE destinations.city || '%'
    )
WHERE id IN (SELECT id FROM public.destinations LIMIT 5);

-- Create some analytics views for better reporting
CREATE OR REPLACE VIEW public.destination_analytics AS
SELECT 
    d.*,
    COUNT(DISTINCT i.id) as itinerary_count,
    COUNT(DISTINCT b.id) as booking_count,
    COALESCE(AVG(r.rating), 0)::DECIMAL(3,2) as average_rating,
    COUNT(DISTINCT f.id) as favorite_count
FROM public.destinations d
LEFT JOIN public.itineraries i ON d.city = SPLIT_PART(i.destination, ',', 1)
LEFT JOIN public.bookings b ON i.id = b.itinerary_id
LEFT JOIN public.reviews r ON d.id = r.destination_id
LEFT JOIN public.favorites f ON d.id = f.reference_id AND f.type = 'destination'
GROUP BY d.id, d.name, d.country, d.city, d.description, d.image_url, d.average_budget, d.best_months, d.popular_activities, d.weather_info, d.created_at, d.updated_at;

CREATE OR REPLACE VIEW public.user_dashboard_stats AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    COUNT(DISTINCT i.id) as total_itineraries,
    COUNT(DISTINCT b.id) as total_bookings,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_trips,
    COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END), 0) as total_spent
FROM public.users u
LEFT JOIN public.itineraries i ON u.id = i.user_id
LEFT JOIN public.bookings b ON u.id = b.user_id
LEFT JOIN public.reviews r ON u.id = r.user_id
LEFT JOIN public.favorites f ON u.id = f.user_id
GROUP BY u.id, u.full_name, u.email;