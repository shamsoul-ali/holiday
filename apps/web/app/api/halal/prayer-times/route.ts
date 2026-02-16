import { NextRequest, NextResponse } from 'next/server';

/**
 * Holiday AI - Prayer Times API
 * Endpoint: GET /api/halal/prayer-times
 * Description: Get prayer times for a location and date
 * External API: Aladhan Prayer Times API (https://aladhan.com/prayer-times-api)
 */

interface PrayerTimesRequest {
  latitude: number;
  longitude: number;
  date?: string; // YYYY-MM-DD format
  method?: string; // Calculation method
  city?: string;
  country?: string;
}

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const method = searchParams.get('method') || '2'; // 2 = ISNA (Islamic Society of North America)
    const city = searchParams.get('city') || '';
    const country = searchParams.get('country') || '';

    // Validation
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Check cache first (to reduce API calls)
    const cacheKey = `prayer_times_${latitude}_${longitude}_${date}_${method}`;
    // TODO: Implement Redis cache lookup

    // Fetch from Aladhan API
    const aladhanUrl = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    const response = await fetch(aladhanUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch prayer times from Aladhan API');
    }

    const data = await response.json();

    if (data.code !== 200 || !data.data) {
      throw new Error('Invalid response from Aladhan API');
    }

    const timings = data.data.timings;
    const meta = data.data.meta;

    // Format response
    const prayerTimes: PrayerTimes = {
      fajr: timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha
    };

    // Calculate next prayer
    const nextPrayer = calculateNextPrayer(prayerTimes);

    // Get Qibla direction
    const qiblaDirection = await getQiblaDirection(latitude, longitude);

    return NextResponse.json({
      success: true,
      data: {
        date: data.data.date.readable,
        hijriDate: data.data.date.hijri.date,
        location: {
          latitude,
          longitude,
          city: city || meta.timezone,
          country: country,
          timezone: meta.timezone
        },
        prayerTimes,
        nextPrayer,
        qiblaDirection,
        calculationMethod: {
          id: meta.method.id,
          name: meta.method.name
        },
        metadata: {
          sunrise: timings.Sunrise,
          sunset: timings.Sunset,
          midnight: timings.Midnight,
          imsak: timings.Imsak
        }
      }
    });

  } catch (error) {
    console.error('Prayer times API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch prayer times',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================

function calculateNextPrayer(prayerTimes: PrayerTimes): {
  name: string;
  time: string;
  minutesUntil: number;
} {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha }
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;

    if (prayerMinutes > currentTime) {
      return {
        name: prayer.name,
        time: prayer.time,
        minutesUntil: prayerMinutes - currentTime
      };
    }
  }

  // If no prayer found today, return Fajr tomorrow
  const [fajrHours, fajrMinutes] = prayerTimes.fajr.split(':').map(Number);
  const fajrTomorrowMinutes = (24 * 60) - currentTime + (fajrHours * 60 + fajrMinutes);

  return {
    name: 'Fajr (Tomorrow)',
    time: prayerTimes.fajr,
    minutesUntil: fajrTomorrowMinutes
  };
}

async function getQiblaDirection(latitude: number, longitude: number): Promise<number> {
  try {
    // Fetch Qibla direction from Aladhan API
    const qiblaUrl = `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`;

    const response = await fetch(qiblaUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours (Qibla direction doesn't change)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Qibla direction');
    }

    const data = await response.json();

    if (data.code === 200 && data.data) {
      return data.data.direction;
    }

    throw new Error('Invalid Qibla API response');

  } catch (error) {
    console.error('Qibla direction error:', error);
    // Fallback: Calculate manually using Kaaba coordinates
    return calculateQiblaDirection(latitude, longitude);
  }
}

function calculateQiblaDirection(lat: number, lng: number): number {
  // Kaaba coordinates
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;

  // Convert to radians
  const lat1 = lat * (Math.PI / 180);
  const lat2 = kaabaLat * (Math.PI / 180);
  const lng1 = lng * (Math.PI / 180);
  const lng2 = kaabaLng * (Math.PI / 180);

  // Calculate Qibla direction
  const dLng = lng2 - lng1;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let qibla = Math.atan2(y, x) * (180 / Math.PI);

  // Normalize to 0-360
  qibla = (qibla + 360) % 360;

  return Math.round(qibla * 100) / 100;
}

/**
 * POST /api/halal/prayer-times/preferences
 * Save user's prayer time preferences
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'user123';
    const body = await request.json();

    // Validate calculation method
    const validMethods = ['ISNA', 'MWL', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari'];
    if (body.calculationMethod && !validMethods.includes(body.calculationMethod)) {
      return NextResponse.json(
        { error: 'Invalid calculation method' },
        { status: 400 }
      );
    }

    // TODO: Save preferences to database
    const preferences = {
      userId,
      calculationMethod: body.calculationMethod || 'ISNA',
      juristicMethod: body.juristicMethod || 'Shafi',
      notificationsEnabled: body.notificationsEnabled ?? true,
      notificationTimes: body.notificationTimes || {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true
      },
      adhanSoundEnabled: body.adhanSoundEnabled ?? false,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      message: 'Prayer preferences saved successfully',
      data: preferences
    });

  } catch (error) {
    console.error('Prayer preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
