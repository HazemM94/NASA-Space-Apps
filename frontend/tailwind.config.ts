import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        emerald: {
          DEFAULT: "#10b981",
          500: "#10b981",
        },
        amber: {
          DEFAULT: "#f59e0b",
          500: "#f59e0b",
        },
        crimson: "#ef4444",
        "astro-cyan": "#06b6d4",
      },
      animation: {
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "pulse-fast": "pulse-fast 1.2s ease-in-out infinite",
        "radar-spin": "radar-spin 8s linear infinite",
        "radar-ping": "radar-ping 2s ease-out infinite",
        "leader-draw": "leader-draw 0.6s ease-out forwards",
        "float-up": "float-up 0.4s ease-out forwards",
        "status-ping": "status-ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "pulse-fast": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        "radar-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "radar-ping": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "leader-draw": {
          from: { strokeDashoffset: "100" },
          to: { strokeDashoffset: "0" },
        },
        "float-up": {
          "0%": { transform: "translateY(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "status-ping": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      backdropBlur: {
        xl: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
