/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primaire:          '#10b981',
        'primaire-fonce':  '#059669',
        fond:              '#0a0a0a',
        'fond-secondaire': '#111111',
        'fond-carte':      '#1a1a1a',
        bordure:           '#2d2d2d',
        accent:            '#6366f1',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        petit: '8px',
        moyen: '12px',
        grand: '20px',
      },
    },
  },
  plugins: [],
}