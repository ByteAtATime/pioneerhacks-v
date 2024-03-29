/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,svelte,ts,js}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["autumn", "night"],
  },
  plugins: [require("daisyui")],
};
