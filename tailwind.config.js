/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0f1117",
          800: "#1a1d27",
          700: "#2a2d3a",
        },
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};
