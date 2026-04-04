/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Köylüoğlu Fresh - Logo renk paleti
        brand: {
          orange: {
            50:  '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#E8792B',   // Ana turuncu (logo)
            600: '#D4691E',
            700: '#B45518',
            800: '#8C4013',
          },
          green: {
            50:  '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#4CAF50',   // Yaprak yeşili (logo)
            600: '#2E7D32',
            700: '#1B5E20',
            800: '#14532D',
          },
          fresh: '#7BC67E',     // "Fresh" yazısı açık yeşil
        },
        primary: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#E8792B',
          600: '#D4691E',
          700: '#B45518',
          800: '#8C4013',
        },
        accent: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #E8792B 0%, #D4691E 50%, #B45518 100%)',
        'fresh-gradient': 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
      },
    },
  },
  plugins: [],
};
