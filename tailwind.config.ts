import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'rgb(38, 41, 57)',
        input: 'rgb(38, 41, 57)',
        ring: 'rgb(59, 130, 246)',
        background: 'rgb(17, 19, 32)',
        foreground: 'rgb(248, 250, 252)',
        card: {
          DEFAULT: 'rgb(26, 28, 44)',
          foreground: 'rgb(248, 250, 252)'
        },
        popover: {
          DEFAULT: 'rgb(26, 28, 44)',
          foreground: 'rgb(248, 250, 252)'
        },
        primary: {
          DEFAULT: 'rgb(59, 130, 246)',
          foreground: 'rgb(248, 250, 252)'
        },
        secondary: {
          DEFAULT: 'rgb(38, 41, 57)',
          foreground: 'rgb(248, 250, 252)'
        },
        muted: {
          DEFAULT: 'rgb(38, 41, 57)',
          foreground: 'rgb(148, 163, 184)'
        },
        accent: {
          DEFAULT: 'rgb(38, 41, 57)',
          foreground: 'rgb(248, 250, 252)'
        },
        destructive: {
          DEFAULT: 'rgb(239, 68, 68)',
          foreground: 'rgb(255, 255, 255)'
        },
        mystical: {
          primary: '#111320',
          secondary: '#1a1c2c',
          accent: '#3b82f6',
          purple: '#6366f1',
          dark: '#0d0f1a'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite'
      },
      backgroundImage: {
        'mystical-gradient': 'linear-gradient(135deg, #111320 0%, #1a1c2c 50%, #3b82f6 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26, 28, 44, 0.1) 0%, rgba(26, 28, 44, 0.05) 100%)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;