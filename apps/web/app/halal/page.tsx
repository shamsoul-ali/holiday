'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import PrayerTimesWidget from '@/components/PrayerTimesWidget';
import { MapPin, Utensils, Home, Map, Search, Filter, Star, CheckCircle } from 'lucide-react';

/**
 * Holiday AI - Halal Travel Hub
 * Path: /halal
 * Description: One-stop hub for Muslim travelers - Prayer times, Halal restaurants, Mosques, Umrah packages
 */

export default function HalalPage() {
  const [activeTab, setActiveTab] = useState<'prayer' | 'restaurants' | 'hotels' | 'umrah'>('prayer');

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 p-3 rounded-xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Halal Travel Hub</h1>
          </div>
          <p className="text-gray-600">Your complete guide to Muslim-friendly travel</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <TabButton
            active={activeTab === 'prayer'}
            onClick={() => setActiveTab('prayer')}
            icon={<Map className="w-5 h-5" />}
            label="Prayer Times"
          />
          <TabButton
            active={activeTab === 'restaurants'}
            onClick={() => setActiveTab('restaurants')}
            icon={<Utensils className="w-5 h-5" />}
            label="Halal Restaurants"
          />
          <TabButton
            active={activeTab === 'hotels'}
            onClick={() => setActiveTab('hotels')}
            icon={<Home className="w-5 h-5" />}
            label="Muslim-Friendly Hotels"
          />
          <TabButton
            active={activeTab === 'umrah'}
            onClick={() => setActiveTab('umrah')}
            icon={<Star className="w-5 h-5" />}
            label="Umrah Packages"
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'prayer' && <PrayerSection />}
            {activeTab === 'restaurants' && <RestaurantsSection />}
            {activeTab === 'hotels' && <HotelsSection />}
            {activeTab === 'umrah' && <UmrahSection />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PrayerTimesWidget compact={activeTab !== 'prayer'} />

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <QuickLink href="#" label="Find Nearby Mosques" />
                <QuickLink href="#" label="Halal Certification Guide" />
                <QuickLink href="#" label="Travel Duas & Supplications" />
                <QuickLink href="#" label="Muslim Travel Tips" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

// =====================================================
// Section Components
// =====================================================

function PrayerSection() {
  return (
    <div>
      <PrayerTimesWidget showQibla={true} />

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About Prayer Times</h3>
        <div className="prose prose-sm text-gray-600">
          <p>
            Prayer times are calculated using the ISNA (Islamic Society of North America) method
            based on your current location. Times are displayed in local timezone.
          </p>
          <p className="mt-3">
            <strong>Prayer Times Include:</strong>
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Fajr (Dawn Prayer)</li>
            <li>Dhuhr (Noon Prayer)</li>
            <li>Asr (Afternoon Prayer)</li>
            <li>Maghrib (Sunset Prayer)</li>
            <li>Isha (Night Prayer)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function RestaurantsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    certifiedOnly: false,
    priceRange: 'all',
    cuisine: 'all'
  });

  const restaurants = [
    {
      id: 1,
      name: 'Al-Noor Restaurant',
      cuisine: 'Middle Eastern, Malaysian',
      rating: 4.5,
      reviews: 328,
      priceRange: '$$',
      distance: 0.8,
      certified: true,
      features: ['Prayer Room', 'Family Friendly', 'Parking']
    },
    {
      id: 2,
      name: 'Saffron Halal Kitchen',
      cuisine: 'Indian, Pakistani',
      rating: 4.3,
      reviews: 156,
      priceRange: '$',
      distance: 1.2,
      certified: true,
      features: ['Family Friendly', 'WiFi']
    },
    {
      id: 3,
      name: 'The Halal Guys',
      cuisine: 'American, Mediterranean',
      rating: 4.7,
      reviews: 892,
      priceRange: '$$',
      distance: 1.5,
      certified: true,
      features: ['Prayer Room', 'Parking', 'WiFi']
    }
  ];

  return (
    <div>
      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <FilterChip label="Certified Only" active={filters.certifiedOnly} />
          <FilterChip label="$ Budget" />
          <FilterChip label="$$ Moderate" />
          <FilterChip label="Middle Eastern" />
          <FilterChip label="With Prayer Room" />
        </div>
      </div>

      {/* Restaurants List */}
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                  {restaurant.certified && (
                    <CheckCircle className="w-5 h-5 text-green-500" fill="currentColor" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span className="font-semibold">{restaurant.rating}</span>
                  <span className="text-sm text-gray-500">({restaurant.reviews})</span>
                </div>
                <div className="text-sm text-gray-600">{restaurant.priceRange} • {restaurant.distance}km</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.features.map((feature) => (
                <span key={feature} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors">
                View Details
              </button>
              <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HotelsSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Muslim-Friendly Hotels</h3>
      <div className="text-center py-12">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4">Hotel search coming soon</p>
        <p className="text-sm text-gray-500">
          Find hotels with prayer facilities, halal food, and Muslim-friendly amenities
        </p>
      </div>
    </div>
  );
}

function UmrahSection() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Umrah Packages</h3>
      <div className="text-center py-12">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-gray-600 mb-4">Browse licensed Umrah packages</p>
        <p className="text-sm text-gray-500 mb-6">
          Find the perfect Umrah package with licensed operators, accommodations near Haram, and guided tours
        </p>
        <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

// =====================================================
// Helper Components
// =====================================================

function TabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap ${
        active
          ? 'bg-green-600 text-white shadow-md'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
    >
      → {label}
    </a>
  );
}
