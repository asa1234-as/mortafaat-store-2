/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#D4AF37",
          goldLight: "#F3E5AB",
          goldDark: "#AA820A",
          goldAccent: "#E5A93C",
          black: "#0A0D14",
          charcoal: "#161B26",
          darkGray: "#232936",
          border: "#2A3241",
          white: "#FFFFFF",
          cream: "#FAF8F5"
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
