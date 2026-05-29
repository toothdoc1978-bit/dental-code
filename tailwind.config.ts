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
      fontSize: {
        // Fluid display scale for Apple-style headlines
        "display-1": ["clamp(2.75rem, 6vw, 5.5rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "display-2": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-3": ["clamp(1.5rem, 2.5vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        lead: ["clamp(1.125rem, 1.4vw, 1.375rem)", { lineHeight: "1.55" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(11, 95, 165, 0.18)",
        glass: "0 1px 1px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(11, 95, 165, 0.16)",
        lift: "0 24px 48px -20px rgba(11, 95, 165, 0.35)",
      },
      backgroundImage: {
        "aurora":
          "radial-gradient(60% 80% at 15% 10%, rgba(63,169,245,0.28) 0%, transparent 60%), radial-gradient(50% 70% at 90% 20%, rgba(11,95,165,0.22) 0%, transparent 55%), radial-gradient(70% 90% at 70% 95%, rgba(166,204,236,0.30) 0%, transparent 60%)",
        "hero-fade": "linear-gradient(to bottom, #EAF3FB 0%, #FFFFFF 100%)",
        "glass": "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35))",
      },
      backdropBlur: {
        xl: "24px",
        "2xl": "40px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "aurora-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-3%, 2%, 0) scale(1.06)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        aurora: "aurora-drift 18s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
