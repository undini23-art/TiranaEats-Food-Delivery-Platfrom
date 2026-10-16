/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        leaf: "#06c167",
        basil: "#02884f",
        mist: "#f4f7f5",
        limewash: "#ecfdf3"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 24, 39, 0.10)"
      }
    }
  },
  plugins: []
};
