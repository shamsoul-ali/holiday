/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Andalusia Umrah Travel brand colors
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
        // Umrah/Islamic themed colors
        umrah: {
          green: '#059669',
          gold: '#d97706',
          white: '#ffffff',
          kaaba: '#1e293b',
          zamzam: '#0891b2',
        },
        // Travel-themed colors (keep for compatibility)
        travel: {
          sky: '#0ea5e9',
          ocean: '#0891b2',
          forest: '#059669',
          sunset: '#f59e0b',
          coral: '#f97316',
          lavender: '#a855f7',
        },
        // Halal/Islamic colors
        halal: {
          green: '#059669',
          gold: '#d97706',
          white: '#ffffff',
          black: '#111827',
        },
        // Bayu — Sabah Tourism Command Center
        bayu: {
          navy: '#002B7F',
          ocean: '#096DBB',
          sky: '#2EAFE8',
          skylight: '#7BC4E8',
          reef: '#00BCD4',
          gold: '#F7B731',
          goldlight: '#FFD97A',
          jungle: '#059669',
          coral: '#F5362F',
          // command-center dark tokens
          bg0: '#070F1E',
          bg1: '#0B1A30',
          bg2: '#12253F',
          bg3: '#1A3053',
          line: '#1F3A5F',
          line2: '#2A4F7D',
          text: '#E6EEF7',
          textMuted: '#8FA3B8',
          textDim: '#5A7394',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'bayu-pulse': 'bayuPulse 1.6s ease-out infinite',
        'bayu-dash': 'bayuDash 1.4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        bayuPulse: {
          '0%':   { transform: 'scale(1)',   opacity: '0.7' },
          '100%': { transform: 'scale(3.2)', opacity: '0' },
        },
        bayuDash: {
          '0%':   { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-32' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'travel-pattern': "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
      boxShadow: {
        'travel': '0 10px 25px -3px rgba(5, 150, 105, 0.1), 0 4px 6px -2px rgba(5, 150, 105, 0.05)',
        'travel-lg': '0 20px 25px -5px rgba(5, 150, 105, 0.1), 0 10px 10px -5px rgba(5, 150, 105, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
