/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // These reference CSS variables (defined in index.css) rather than
        // fixed hex values, so every class using them (bg-ink, text-ivory,
        // border-navy-700/60, etc.) automatically restyles when the
        // data-theme attribute toggles between dark and light — no need to
        // touch any component's className.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        navy: {
          950: "rgb(var(--color-navy-950) / <alpha-value>)",
          900: "rgb(var(--color-navy-900) / <alpha-value>)",
          800: "rgb(var(--color-navy-800) / <alpha-value>)",
          700: "rgb(var(--color-navy-700) / <alpha-value>)",
        },
        gold: {
          400: "rgb(var(--color-gold-400) / <alpha-value>)",
          500: "rgb(var(--color-gold-500) / <alpha-value>)",
          600: "rgb(var(--color-gold-600) / <alpha-value>)",
        },
        parchment: "#F6F3EC",
        ivory: "rgb(var(--color-ivory) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};