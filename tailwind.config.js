/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005ca4',
          50: '#e6f0f9',
          100: '#cce1f3',
          200: '#99c3e7',
          300: '#66a5db',
          400: '#3387cf',
          500: '#005ca4',
          600: '#004a83',
          700: '#003762',
          800: '#002541',
          900: '#001220'
        },
        accent: {
          DEFAULT: '#00c3bf',
          50: '#e6faf9',
          100: '#ccf5f4',
          200: '#99ebe9',
          300: '#66e1de',
          400: '#33d7d3',
          500: '#00c3bf',
          600: '#009c99',
          700: '#007573',
          800: '#004e4c',
          900: '#002726'
        },
        gray: {
          DEFAULT: '#4d4d4d',
          50: '#f5f5f5',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a'
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-primary-50',
    'bg-primary-100',
    'bg-primary-500',
    'bg-primary-600',
    'text-primary-500',
    'text-primary-600',
    'bg-accent-50',
    'bg-accent-100',
    'bg-accent-500',
    'bg-accent-600',
    'text-accent-500',
    'text-accent-600',
    'hover:bg-primary-600',
    'hover:bg-accent-600',
    'focus:ring-primary-500',
    'focus:ring-accent-500',
  ]
};