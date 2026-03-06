import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          blue: '#00f3ff',
          purple: '#9d00ff',
          pink: '#ff00ea',
          green: '#00ff9f',
        },
        slate: {
          950: '#020617',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        scan: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.8)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 243, 255, 0.5)',
        'cyber-lg': '0 0 30px rgba(0, 243, 255, 0.7)',
      },
    },
  },
  plugins: [],
};
export default config;
