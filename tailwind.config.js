/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        policeBlue: "#1E3A8A",
        steelGray: "#2E2E2E",
        softWhite: "#F5F5F5",
      },
      boxShadow: {
        glow: "0 0 15px rgba(30, 58, 138, 0.7)",
      },
    },
  },
  plugins: [],
};
