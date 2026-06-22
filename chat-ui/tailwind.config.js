/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        abyss: {
          50: "#f4f6fb",
          100: "#e8ecf6",
          200: "#ccd7eb",
          300: "#9fb4d8",
          400: "#6b8cc1",
          500: "#496fa9",
          600: "#38588d",
          700: "#2f4773",
          800: "#293d60",
          900: "#1f2e4a",
          950: "#0B0F19",
        },
        surface: {
          DEFAULT: "#141A26",
          hover: "#1B2230",
        },
        brand: {
          amber: "#F59E0B",
          cyan: "#22D3EE",
          violet: "#8B5CF6",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "pulse-dot": "pulseDot 1.4s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
