import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: "#f0f4f9",
          100: "#e0e9f3",
          200: "#c7d8ea",
          300: "#9fc0dc",
          400: "#71a2cc",
          500: "#4f84bd",
          600: "#3b69a3",
          700: "#2f5384",
          800: "#1e3a5f", // Navy campus primary
          900: "#162842", // Deep navy header
          950: "#0c1626"
        }
      }
    },
  },
  plugins: [],
};
export default config;
