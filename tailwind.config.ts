import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Knowledge (Blue) and Wisdom (Gold) - Core learning metrics
        knowledge: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        wisdom: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Feedback colors
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        encouragement: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Parchment background for historical feel
        parchment: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
        },
        // Tier colors
        tier: {
          1: '#10b981', // Green - Easy
          2: '#3b82f6', // Blue - Medium
          3: '#8b5cf6', // Purple - Hard
          4: '#f59e0b', // Gold - Extra Hard
        },
      },
      fontFamily: {
        display: ['Quicksand', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        historical: ['Merriweather', 'serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'streak-fire': 'streak-fire 0.5s ease-in-out',
        'heart-break': 'heart-break 0.3s ease-in-out',
        'tier-up': 'tier-up 0.6s ease-out',
        'confetti': 'confetti 0.8s ease-out',
      },
      keyframes: {
        'streak-fire': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'heart-break': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.8) rotate(-10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'tier-up': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
