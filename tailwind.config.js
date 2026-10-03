/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#2F4F4F",
        stone: "#778899",
        cream: "#F5F5DC",
        mist: "#ADD8E6",
        sky: "#87CEEB",
      },
    },
  },
  plugins: [],
};