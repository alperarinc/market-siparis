/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Köylüoğlu Market - Stitch Design System
        primary: {
          DEFAULT: '#9a4600',
          container: '#e8792b',
          fixed: '#ffdbc9',
          'fixed-dim': '#ffb68c',
        },
        secondary: {
          DEFAULT: '#226d00',
          container: '#9ef578',
          fixed: '#a0f87a',
          'fixed-dim': '#85db61',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#d4dae7',
          bright: '#f8f9ff',
          container: {
            DEFAULT: '#e7eefb',
            low: '#eef4ff',
            high: '#e2e8f5',
            highest: '#dce3f0',
            lowest: '#ffffff',
          },
          variant: '#dce3f0',
        },
        outline: {
          DEFAULT: '#8a7266',
          variant: '#ddc1b2',
        },
        'on-surface': {
          DEFAULT: '#151c25',
          variant: '#564338',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#512200',
          fixed: '#321200',
          'fixed-variant': '#753400',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#247200',
          fixed: '#052100',
          'fixed-variant': '#185200',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        tertiary: {
          DEFAULT: '#5f5e61',
          container: '#98979a',
          fixed: '#e4e1e5',
          'fixed-dim': '#c8c6c9',
        },
        inverse: {
          surface: '#2a313b',
          'on-surface': '#eaf1fe',
          primary: '#ffb68c',
        },
        background: '#f8f9ff',
        'on-background': '#151c25',
        // Legacy compatibility
        brand: {
          orange: {
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
          green: {
            50:  '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#4CAF50',
            600: '#2E7D32',
            700: '#1B5E20',
            800: '#14532D',
          },
        },
      },
      fontFamily: {
        headline: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
