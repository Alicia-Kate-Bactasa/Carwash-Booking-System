/**
 * Tailwind CSS configuration for Montage Auto Studio.
 * Defines template content paths, typography, theme colors, and custom styles.
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Scanned template files for utility CSS generation
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom typography font families
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      // Application brand color palette
      colors: {
        dark: '#111111',
        light: '#FAFAFA',
      },
    },
  },
  plugins: [],
};


