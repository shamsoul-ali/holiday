'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, Sunrise, Sunset, Moon, Sun } from 'lucide-react';

/**
 * Holiday AI - Prayer Times Widget
 * Component: Displays Islamic prayer times for current location
 * API: Aladhan Prayer Times API
 */

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface NextPrayer {
  name: string;
  time: string;
  minutesUntil: number;
}

interface PrayerTimesData {
  date: string;
  hijriDate: string;
  location: {
    city: string;
    country: string;
    timezone: string;
  };
  prayerTimes: PrayerTimes;
  nextPrayer: NextPrayer;
  qiblaDirection: number;
}

interface PrayerTimesWidgetProps {
  latitude?: number;
  longitude?: number;
  showQibla?: boolean;
  compact?: boolean;
}

export default function PrayerTimesWidget({
  latitude,
  longitude,
  showQibla = true,
  compact = false
}: PrayerTimesWidgetProps) {
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location if not provided
    if (!latitude || !longitude) {
      getUserLocation();
    } else {
      fetchPrayerTimes(latitude, longitude);
    }
  }, [latitude, longitude]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          fetchPrayerTimes(lat, lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Please enable location access');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  };

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/halal/prayer-times?latitude=${lat}&longitude=${lng}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const result = await response.json();
      setPrayerData(result.data);
      setError(null);
    } catch (err) {
      console.error('Prayer times error:', err);
      setError('Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !prayerData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error || 'Unable to load prayer times'}</p>
          <button
            onClick={() => getUserLocation()}
            className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', time: prayerData.prayerTimes.fajr, icon: <Moon className="w-5 h-5" /> },
    { name: 'Sunrise', time: prayerData.prayerTimes.sunrise, icon: <Sunrise className="w-5 h-5" />, isInfo: true },
    { name: 'Dhuhr', time: prayerData.prayerTimes.dhuhr, icon: <Sun className="w-5 h-5" /> },
    { name: 'Asr', time: prayerData.prayerTimes.asr, icon: <Sun className="w-5 h-5" /> },
    { name: 'Maghrib', time: prayerData.prayerTimes.maghrib, icon: <Sunset className="w-5 h-5" /> },
    { name: 'Isha', time: prayerData.prayerTimes.isha, icon: <Moon className="w-5 h-5" /> }
  ];

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Next: {prayerData.nextPrayer.name}</span>
          </div>
          <span className="text-lg font-bold">{prayerData.nextPrayer.time}</span>
        </div>
        <div className="text-sm text-white/80">
          in {Math.floor(prayerData.nextPrayer.minutesUntil / 60)}h {prayerData.nextPrayer.minutesUntil % 60}m
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">Prayer Times</h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{prayerData.location.city || prayerData.location.timezone}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">Today</div>
            <div className="font-semibold">{prayerData.date}</div>
            <div className="text-sm text-white/80">{prayerData.hijriDate}</div>
          </div>
        </div>

        {/* Next Prayer Highlight */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
          <div className="text-sm text-white/80 mb-1">Next Prayer</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{prayerData.nextPrayer.name}</div>
              <div className="text-sm">
                in {Math.floor(prayerData.nextPrayer.minutesUntil / 60)}h {prayerData.nextPrayer.minutesUntil % 60}m
              </div>
            </div>
            <div className="text-3xl font-bold">{prayerData.nextPrayer.time}</div>
          </div>
        </div>
      </div>

      {/* Prayer Times List */}
      <div className="p-6 space-y-2">
        {prayers.map((prayer) => {
          const isNext = prayer.name === prayerData.nextPrayer.name.split(' ')[0];

          return (
            <div
              key={prayer.name}
              className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                isNext
                  ? 'bg-green-50 border-2 border-green-500'
                  : prayer.isInfo
                  ? 'bg-gray-50 opacity-60'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isNext
                      ? 'bg-green-500 text-white'
                      : prayer.isInfo
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {prayer.icon}
                </div>
                <div>
                  <div className={`font-semibold ${isNext ? 'text-green-700' : 'text-gray-900'}`}>
                    {prayer.name}
                  </div>
                  {prayer.isInfo && (
                    <div className="text-xs text-gray-500">Not a prayer time</div>
                  )}
                </div>
              </div>
              <div className={`text-xl font-bold ${isNext ? 'text-green-700' : 'text-gray-900'}`}>
                {prayer.time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Qibla Direction */}
      {showQibla && (
        <div className="p-6 pt-0">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-900">Qibla Direction</span>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {prayerData.qiblaDirection.toFixed(1)}°
                </div>
                <div className="text-sm text-gray-600 mt-1">from North</div>
              </div>
              <div className="relative w-24 h-24">
                {/* Compass visualization */}
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `rotate(${prayerData.qiblaDirection}deg)`
                  }}
                >
                  <Navigation className="w-8 h-8 text-indigo-600" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="text-center text-sm text-gray-500">
          Calculation Method: ISNA • Times based on your location
        </div>
      </div>
    </div>
  );
}
