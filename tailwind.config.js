/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			'pure-white': '#FFFFFF',
  			'soft-pink': '#FFB6C1',
  			'rose-gold': '#E8B4B8',
  			'charcoal-black': '#2D2D2D',
  			'light-gray': '#F8F9FA',
  			primary: {
  				'50': '#fef7f7',
  				'100': '#fdeaea',
  				'200': '#fbd9db',
  				'300': '#f7bcc0',
  				'400': '#f194a0',
  				'500': '#e8b4b8',
  				'600': '#d89ca2',
  				'700': '#c17d85',
  				'800': '#a16670',
  				'900': '#85555e',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#fef7f7',
  				'100': '#fef0f0',
  				'200': '#ffe4e6',
  				'300': '#ffcdd2',
  				'400': '#ffb6c1',
  				'500': '#ff9fb0',
  				'600': '#ff7a94',
  				'700': '#ff5577',
  				'800': '#e6405a',
  				'900': '#cc2e47',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Poppins',
  				'Inter',
  				'sans-serif'
  			],
  			display: [
  				'Playfair Display',
  				'serif'
  			],
  			body: [
  				'Poppins',
  				'Inter',
  				'sans-serif'
  			],
  			countdown: [
  				'Poppins',
  				'sans-serif'
  			]
  		},
  		animation: {
  			float: 'float 3s ease-in-out infinite',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			sparkle: 'sparkle 1.5s ease-in-out infinite',
  			'heart-beat': 'heart-beat 1.2s ease-in-out infinite',
  			// Enhanced animated icon animations
  			'enhanced-sparkle': 'enhanced-sparkle 3s ease-in-out infinite',
  			'enhanced-heart-beat': 'enhanced-heart-beat 1.5s ease-in-out infinite',
  			'enhanced-float': 'enhanced-float 2.5s ease-in-out infinite',
  			'celebration-bounce': 'celebration-bounce 2s ease-in-out infinite',
  			// Additional smooth animations
  			'icon-pulse': 'icon-pulse 2s ease-in-out infinite',
  			'icon-rotate': 'icon-rotate 3s linear infinite',
  			'icon-float': 'icon-float 2.5s ease-in-out infinite'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			sparkle: {
  				'0%, 100%': {
  					opacity: '0',
  					transform: 'scale(0)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'heart-beat': {
  				'0%, 100%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.1)'
  				}
  			}
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
}
