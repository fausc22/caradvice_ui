import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        antenna: ['Antenna', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#1a1a1a",
          light: "#333333",
        },
        accent: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
      },
    },
  },
  plugins: [],
};
export default config;

