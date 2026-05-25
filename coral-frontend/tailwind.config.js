/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coral-primary-bg': '#FAF8F5',
        'coral-sidebar-bg': '#F2EAE1',
        'coral-card-bg': '#FFFFFF',
        'coral-border': '#E8E2D9',
        'coral-orange': '#C26D3B',
        'coral-red': '#A44238',
        'coral-gray': '#8B8276',
        'coral-text-primary': '#2D2823',
        'coral-text-secondary': '#8B8276',
        'coral-sidebar-active': '#EADAC9',
        'coral-blue': '#4A7C93',
        'coral-gold': '#B89B5E',
        'coral-teal': '#4B887C'
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 24px rgba(194, 109, 59, 0.15)',
        'glow-teal': '0 0 24px rgba(75, 136, 124, 0.15)',
      }
    },
  },
  plugins: [],
}
