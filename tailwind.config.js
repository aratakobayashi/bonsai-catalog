/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bonsai-green': {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8cd28c',
          400: '#5cb85c',
          500: '#3a9d3a',
          600: '#2d7f2d',
          700: '#256525',
          800: '#1f5020',
          900: '#1a431b',
        },
        'earth-brown': {
          50: '#faf8f3',
          100: '#f2eee1',
          200: '#e6dbc2',
          300: '#d4c294',
          400: '#c4a76a',
          500: '#b8944e',
          600: '#a87f42',
          700: '#8b6638',
          800: '#715332',
          900: '#5c442a',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}