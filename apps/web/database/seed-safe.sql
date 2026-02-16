-- Holiday AI Platform - Safe Sample Data for Testing
-- This version doesn't insert demo users, only destinations and public data

-- Insert comprehensive destination data
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
    '{"avg_temp": 19, "climate": "mediterranean", "peak": "spring-autumn"}'::jsonb),

-- Additional Asian destinations
('Seoul K-Culture', 'South Korea', 'Seoul', 'Dynamic capital city with rich history and modern K-culture', NULL, 4500.00,
    ARRAY['Apr', 'May', 'Sep', 'Oct', 'Nov'], 
    ARRAY['K-pop Tours', 'Cultural Sites', 'Food Tours', 'Shopping'],
    '{"avg_temp": 12, "climate": "continental", "four_seasons": true}'::jsonb),

('Bangkok Street Life', 'Thailand', 'Bangkok', 'Bustling capital with vibrant street life, temples, and markets', NULL, 2500.00,
    ARRAY['Nov', 'Dec', 'Jan', 'Feb', 'Mar'], 
    ARRAY['Temple Tours', 'Street Food', 'River Cruises', 'Night Markets'],
    '{"avg_temp": 29, "climate": "tropical", "cool_season": "Nov-Feb"}'::jsonb),

('Singapore Garden City', 'Singapore', 'Singapore', 'Modern city-state with world-class attractions and cuisine', NULL, 4000.00,
    ARRAY['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], 
    ARRAY['City Tours', 'Food Courts', 'Gardens', 'Shopping'],
    '{"avg_temp": 27, "climate": "tropical", "consistent_weather": true}'::jsonb),

-- European destinations
('Amsterdam Canals', 'Netherlands', 'Amsterdam', 'Charming city with historic canals, world-class museums, and cycling culture', NULL, 6000.00,
    ARRAY['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], 
    ARRAY['Canal Tours', 'Museums', 'Cycling', 'Cafes'],
    '{"avg_temp": 10, "climate": "oceanic", "mild_summers": true}'::jsonb),

('Barcelona Mediterranean', 'Spain', 'Barcelona', 'Vibrant coastal city with Gaudí architecture, beaches, and fantastic food', NULL, 5200.00,
    ARRAY['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], 
    ARRAY['Architecture Tours', 'Beach Time', 'Tapas Tours', 'Museums'],
    '{"avg_temp": 16, "climate": "mediterranean", "beach_season": "May-Oct"}'::jsonb);

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

-- Function to get popular destinations (safe version without user data)
CREATE OR REPLACE FUNCTION get_popular_destinations_safe(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    destination_id UUID,
    name TEXT,
    country TEXT,
    city TEXT,
    description TEXT,
    image_url TEXT,
    average_budget DECIMAL(10,2),
    best_months TEXT[],
    popular_activities TEXT[]
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
        d.best_months,
        d.popular_activities
    FROM public.destinations d
    ORDER BY d.average_budget ASC, d.name ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Sample public itineraries (these won't have user associations until real users create them)
-- We'll skip this for now since it requires user IDs

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully! Created % destinations.', (SELECT COUNT(*) FROM public.destinations);
    RAISE NOTICE 'The database is ready for use. Users can now register and create itineraries.';
    RAISE NOTICE 'Demo users can be created through the application registration process.';
END $$;