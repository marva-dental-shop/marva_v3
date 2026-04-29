import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        marva: {
          50: "#F3F9F8",
          100: "#E7F4F1",
          200: "#C8E4DD",
          300: "#A2D0C4",
          400: "#4FAE9B",
          500: "#1F8C79",
          600: "#0A6F60",
          700: "#005B4F",
          800: "#00473E",
          900: "#10312C"
        }
      },
      boxShadow: {
        soft: "0 12px 35px rgba(16, 49, 44, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
