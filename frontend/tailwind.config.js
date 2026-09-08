/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          bg: "#f8f9fa",
          surface: "#ffffff",
          navy: "#0f2942",
          navyDark: "#0a1c2e",
          navyLight: "#1a3c5e",
          blue: "#1e40af",
          blueLight: "#eff6ff",
          green: "#166534",
          greenLight: "#f0fdf4",
          amber: "#b45309",
          amberLight: "#fffbeb",
          maroon: "#991b1b",
          maroonLight: "#fef2f2",
          charcoal: "#1f2937",
          muted: "#4b5563",
          border: "#e2e8f0",
          borderDark: "#cbd5e1",
          tricolorOrange: "#FF9933",
          tricolorGreen: "#138808",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
