/**
 * Andalusia Umrah Travel Brand Configuration
 *
 * This file contains all brand-specific configurations for
 * Andalusia Travel & Tours Sdn Bhd customization
 */

export const andalusiaBrand = {
  // Company Information
  company: {
    name: 'Andalusia Travel & Tours',
    fullName: 'Andalusia Travel & Tours Sdn Bhd',
    tagline: '22 Tahun Pengalaman Melayani Anda',
    description: 'Penyedia Pakej Umrah, Haji & Pelancongan Terpercaya',
    website: 'https://www.umrahandalusia.com',
    email: 'info@umrahandalusia.com',
    phone: '+60 3-XXXX XXXX', // Replace with actual number
    address: '25,27 & 29 Jalan 1/76, Kuala Lumpur, 55100, Malaysia',

    // Awards and Recognition
    awards: [
      'MATTA Award Best Travel Agency',
      '22 Years of Excellence',
      'Licensed Umrah Operator'
    ],

    // Partnership
    partnerships: [
      'Malaysia Airlines Premium Partner',
      'Hilton Suites',
      'Pullman Zamzam'
    ]
  },

  // Brand Colors - Islamic/Umrah Theme
  colors: {
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#059669', // Islamic Green
      600: '#047857',
      700: '#065f46',
      800: '#064e3b',
      900: '#022c22',
    },
    secondary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#d97706', // Gold
      600: '#b45309',
      700: '#92400e',
      800: '#78350f',
      900: '#451a03',
    },
    accent: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Umrah/Islamic specific colors
    umrah: {
      green: '#059669',
      gold: '#d97706',
      white: '#ffffff',
      kaaba: '#1e293b',
      zamzam: '#0891b2',
    }
  },

  // Package Tiers
  packageTiers: [
    {
      id: 'budget',
      name: 'Pakej Ekonomi',
      nameEn: 'Economy Package',
      description: 'Pakej mampu milik untuk umrah pertama anda',
      descriptionEn: 'Affordable package for your first umrah',
      icon: 'Package',
      color: 'emerald',
      features: [
        'Hotel 3-4 bintang',
        'Jarak sederhana dari Haram',
        'Penerbangan ekonomi',
        'Ziarah standard',
        'Mutawif berpengalaman'
      ]
    },
    {
      id: 'standard',
      name: 'Pakej Standard',
      nameEn: 'Standard Package',
      description: 'Pakej popular dengan kemudahan lengkap',
      descriptionEn: 'Popular package with complete facilities',
      icon: 'Star',
      color: 'blue',
      features: [
        'Hotel 4 bintang',
        'Jarak berhampiran Haram',
        'Penerbangan selesa',
        'Ziarah lengkap',
        'Mutawif & pengiring',
        'Kursus umrah percuma'
      ]
    },
    {
      id: 'premium',
      name: 'Pakej Premium',
      nameEn: 'Premium Package',
      description: 'Pengalaman umrah yang istimewa',
      descriptionEn: 'Special umrah experience',
      icon: 'Crown',
      color: 'purple',
      features: [
        'Hotel 5 bintang (Hilton/Pullman)',
        'Walking distance ke Haram',
        'Malaysia Airlines',
        'Ziarah premium',
        'Mutawif khas',
        'Kursus & kit umrah',
        'Insurans premium'
      ]
    },
    {
      id: 'vip',
      name: 'Pakej VIP',
      nameEn: 'VIP Package',
      description: 'Layanan eksklusif untuk umrah yang sempurna',
      descriptionEn: 'Exclusive service for perfect umrah',
      icon: 'Gem',
      color: 'amber',
      features: [
        'Hotel 5 bintang premium',
        'Pemandangan Haram',
        'Business/First Class',
        'Ziarah VIP eksklusif',
        'Mutawif peribadi',
        'Kursus intensif',
        'Insurans takaful premium',
        'Perkhidmatan concierge'
      ]
    }
  ],

  // Default Destinations (Umrah Focus)
  destinations: {
    primary: [
      {
        name: 'Makkah',
        nameAr: 'مكة المكرمة',
        description: 'Kota Suci Makkah Al-Mukarramah',
        highlights: [
          'Masjidil Haram',
          'Kaabah',
          'Jabal Rahmah',
          'Gua Hira'
        ]
      },
      {
        name: 'Madinah',
        nameAr: 'المدينة المنورة',
        description: 'Kota Cahaya Madinah Al-Munawwarah',
        highlights: [
          'Masjid Nabawi',
          'Raudhah',
          'Jabal Uhud',
          'Quba Mosque'
        ]
      }
    ],
    additional: [
      {
        name: 'Istanbul',
        country: 'Turkey',
        description: 'Kombinasi Umrah + Istanbul',
        type: 'umrah-plus'
      },
      {
        name: 'Dubai',
        country: 'UAE',
        description: 'Kombinasi Umrah + Dubai',
        type: 'umrah-plus'
      }
    ]
  },

  // Malaysian Market Settings
  market: {
    defaultCountry: 'Malaysia',
    defaultCurrency: 'MYR',
    defaultLanguage: 'ms', // Bahasa Malaysia
    supportedLanguages: ['ms', 'en'],
    timezone: 'Asia/Kuala_Lumpur',

    // Payment Methods popular in Malaysia
    paymentMethods: [
      'FPX',
      'Credit/Debit Card',
      'Online Banking',
      'BNPL (Installment)',
      'Cash/Cheque'
    ],

    // Departure Cities
    departureCities: [
      'Kuala Lumpur (KUL)',
      'Penang (PEN)',
      'Johor Bahru (JHB)',
      'Kota Kinabalu (BKI)',
      'Kuching (KCH)'
    ]
  },

  // Service Features
  services: {
    umrah: {
      enabled: true,
      priority: 1, // Highest priority
      features: [
        'Pakej Umrah Eksklusif',
        'Mutawif Berpengalaman',
        'Kursus Umrah Percuma',
        'Visa Umrah',
        'Insurans Takaful',
        'Ziarah Lengkap'
      ]
    },
    hajj: {
      enabled: true,
      priority: 2,
      features: [
        'Pakej Haji Rasmi',
        'Pengiring Haji Tabung Haji',
        'Kursus Haji Intensif'
      ]
    },
    tourism: {
      enabled: true,
      priority: 3,
      destinations: [
        'Turkey',
        'Dubai',
        'Egypt',
        'Morocco',
        'Jordan'
      ]
    }
  },

  // Promotional Features
  promotions: {
    weeklyDraw: {
      enabled: true,
      name: 'Cabutan Umrah Percuma',
      description: 'Setiap minggu! Daftar sekarang'
    },
    freeCourse: {
      enabled: true,
      name: 'Kursus Umrah Percuma',
      description: 'Untuk semua jemaah kami'
    },
    earlyBird: {
      enabled: true,
      discount: '10-15%',
      description: 'Tempahan awal dapat diskaun'
    }
  },

  // UI Customization
  ui: {
    heroTitle: {
      ms: 'Jemputan ke Tanah Suci',
      en: 'Your Journey to the Holy Land'
    },
    heroSubtitle: {
      ms: 'Pakej Umrah & Haji yang Dipercayai Sejak 22 Tahun',
      en: 'Trusted Umrah & Hajj Packages for 22 Years'
    },
    ctaPrimary: {
      ms: 'Tempah Umrah Sekarang',
      en: 'Book Umrah Now'
    },
    ctaSecondary: {
      ms: 'Lihat Pakej',
      en: 'View Packages'
    },
    // Navigation items
    navigation: [
      { ms: 'Beranda', en: 'Home', href: '/' },
      { ms: 'Pakej Umrah', en: 'Umrah Packages', href: '/umrah' },
      { ms: 'Pakej Haji', en: 'Hajj Packages', href: '/hajj' },
      { ms: 'Pelancongan', en: 'Tourism', href: '/tourism' },
      { ms: 'Tentang Kami', en: 'About Us', href: '/about' },
      { ms: 'Hubungi', en: 'Contact', href: '/contact' }
    ]
  },

  // Social Media
  social: {
    facebook: 'https://facebook.com/umrahandalusia',
    instagram: 'https://instagram.com/umrahandalusiadotcom',
    whatsapp: '+60XXXXXXXXX', // Replace with actual
    youtube: '', // Add if available
    tiktok: '' // Add if available
  },

  // SEO
  seo: {
    title: 'Andalusia Travel - Pakej Umrah & Haji Terpercaya Malaysia',
    description: 'Andalusia Travel & Tours - Penyedia pakej umrah dan haji terpercaya di Malaysia sejak 22 tahun. MATTA Award winner dengan perkhidmatan premium.',
    keywords: [
      'pakej umrah malaysia',
      'umrah murah',
      'haji malaysia',
      'andalusia travel',
      'umrah 2024',
      'umrah premium',
      'travel umrah',
      'pakej haji'
    ]
  }
}

export default andalusiaBrand
