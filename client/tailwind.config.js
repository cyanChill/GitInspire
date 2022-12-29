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
      animation: {
        "load-in": "load-in 250ms ease-in-out forwards",
        "noti-enter": "noti-enter 150ms ease-in forwards",
        "noti-leave": "noti-leave 150ms ease-in forwards",
      },
      keyframes: {
        "load-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        "noti-enter": {
          "0%": { opacity: 0.4, transform: "scale(0.75)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "noti-leave": {
          "0%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 0, transform: "scale(0.75)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
