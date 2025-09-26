/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0f1419',
        },
        // Port colors based on data types
        'port-data': '#ef4444',        // Red
        'port-dataframe': '#ec4899',   // Pink
        'port-embeddings': '#10b981',  // Emerald
        'port-language-model': '#a855f7', // Fuchsia
        'port-memory': '#f97316',      // Orange
        'port-message': '#6366f1',     // Indigo
        'port-tool': '#06b6d4',        // Cyan
        'port-unknown': '#9ca3af',     // Gray
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
