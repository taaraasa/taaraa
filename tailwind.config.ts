import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          900: "#06060d",
          800: "#0a0a14",
          700: "#0f1020",
          600: "#15172b",
        },
        midnight: {
          900: "#0b1230",
          700: "#13204a",
          500: "#1c2e6b",
          400: "#2a3f8f",
        },
        starlight: {
          DEFAULT: "#8ab4ff",
          glow: "#aecbff",
          gold: "#ffd877",
        },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: { glow: "0 0 28px rgba(138,180,255,0.35)" },
      backgroundImage: {
        "taaraa-radial":
          "radial-gradient(1200px 600px at 50% -10%, rgba(28,46,107,0.55), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
