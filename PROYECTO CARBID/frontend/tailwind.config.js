/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",
     "./index.html",
       "./node_modules/flowbite/**/*.js" 
  ],
  theme: {
    extend: {
      colors: {
        carbid: {
          primary: "#1A3C5A",
          accent: "#395A6B",
          gray: "#9CA3AF",
          light: "#F4F6F9",
          white: "#FFFFFF",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [
      require('flowbite/plugin')
  ],
};
