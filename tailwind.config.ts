import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'zero': {
          'bg-primary': '#0a0e17',
          'bg-secondary': '#111827',
          'bg-tertiary': '#1f2937',
          'border': '#374151',
          'text-primary': '#f9fafb',
          'text-secondary': '#9ca3af',
          'cyan': '#06b6d4',
          'emerald': '#10b981',
          'amber': '#f59e0b',
          'red': '#ef4444',
          'purple': '#8b5cf6',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Orbitron', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'typing': 'typing 50ms steps(1) forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px currentColor' },
          '50%': { opacity: '0.5', boxShadow: '0 0 40px currentColor' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'typing': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
