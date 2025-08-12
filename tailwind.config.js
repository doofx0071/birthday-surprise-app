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
        // Birthday surprise color palette
        'pure-white': '#FFFFFF',
        'soft-pink': '#FFB6C1',
        'rose-gold': '#E8B4B8',
        'charcoal-black': '#2D2D2D',
        'light-gray': '#F8F9FA',
        
        // Tailwind-compatible naming
        primary: {
          50: '#fef7f7',
          100: '#fdeaea',
          200: '#fbd9db',
          300: '#f7bcc0',
          400: '#f194a0',
          500: '#e8b4b8', // rose-gold
          600: '#d89ca2',
          700: '#c17d85',
          800: '#a16670',
          900: '#85555e',
        },
        accent: {
          50: '#fef7f7',
          100: '#fef0f0',
          200: '#ffe4e6',
          300: '#ffcdd2',
          400: '#ffb6c1', // soft-pink
          500: '#ff9fb0',
          600: '#ff7a94',
          700: '#ff5577',
          800: '#e6405a',
          900: '#cc2e47',
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'countdown': ['Poppins', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'heart-beat': 'heart-beat 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
