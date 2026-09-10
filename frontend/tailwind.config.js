/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E14",       // near-black navy background
        navy: {
          950: "#0B0E14",
          900: "#10141C",
          800: "#171C27",
          700: "#232936",
        },
        gold: {
          400: "#E8C77A",
          500: "#D4A94F",     // primary gold accent
          600: "#B4863A",
        },
        parchment: "#F6F3EC",
        ivory: "#FBFAF7",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
