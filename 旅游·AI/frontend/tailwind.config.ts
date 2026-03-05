import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6fbff",
          100: "#eaf6ff",
          500: "#1d88ff",
          700: "#0f5dc2",
          900: "#0d2f5f"
        }
      }
    }
  },
  plugins: []
};

export default config;
