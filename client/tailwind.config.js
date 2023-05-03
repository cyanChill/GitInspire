const plugin = require("tailwindcss/plugin");
const { fontFamily } = require("tailwindcss/defaultTheme");

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
        "load-out": "load-out 250ms ease-in-out forwards",
        "noti-enter": "noti-enter 150ms ease-in forwards",
        "noti-leave": "noti-leave 150ms ease-in forwards",
        "lazy-bg": "bgPos 1s linear infinite",
      },
      colors: {
        "blood-red": "#bb0a1e",
        "red-p": {
          600: "#992d28",
        },
        "orange-p": {
          600: "#eca93c",
        },
        "yellow-p": {
          600: "#eecf68",
        },
        "teal-p": {
          100: "#85bdb2",
          600: "#689c96",
          700: "#4b726e",
        },
      },
      fontFamily: {
        sourceCodePro: ["var(--source-code-pro-font)", ...fontFamily.mono],
      },
      fontSize: {
        xxs: "0.65rem",
      },
      keyframes: {
        "load-in": { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        "load-out": { "0%": { opacity: 1 }, "100%": { opacity: 0 } },
        "noti-enter": {
          "0%": { opacity: 0.4, transform: "scale(0.75)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "noti-leave": {
          "0%": { opacity: 1, transform: "scale(1)" },
          "100%": { opacity: 0, transform: "scale(0.75)" },
        },
        bgPos: {
          "0%": { "background-position": "50% 0" },
          "100%": { "background-position": "-150% 0" },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("not-last", "&:not(:last-child)");
      addVariant("has-clip", '&:has(div[data-overflow="clip"])');
    }),
  ],
};
