/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  safelist: [
    "font-wedding",
    "font-kgWildways",
  ],
  theme: {
    extend: {
      fontFamily: {
        kgWildways: ["kgWildways", "sans-serif"],
        wedding: ["WeddingSignature", "cursive"],
      },
      colors: {
        primary: "#2c3e50",
        secondary: "#c8bfae",
        accent: "#9b8c6d",
      },
    },
  },
  plugins: [],
};
