/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: { "load-in": "load-in 250ms ease-in-out forwards" },
      keyframes: {
        "load-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
