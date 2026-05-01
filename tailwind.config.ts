import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0B5FA5",
          50: "#EAF3FB",
          100: "#D2E5F5",
          200: "#A6CCEC",
          300: "#79B2E2",
          400: "#4D99D9",
          500: "#3FA9F5",
          600: "#0B5FA5",
          700: "#094C84",
          800: "#073963",
          900: "#052642",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F6F9FC",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(11, 95, 165, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
