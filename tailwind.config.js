/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Electric brand violet/indigo — premium agency feel
        brand: {
          50: '#f1f0ff',
          100: '#e6e3ff',
          200: '#cfc9ff',
          300: '#b0a4ff',
          400: '#8b73ff',
          500: '#6d49ff',
          600: '#5b27f5',
          700: '#4d17d8',
          800: '#3f14ad',
          900: '#35158a',
          950: '#1f0a55'
        },
        // Aqua/teal secondary for accents + gradients
        aqua: {
          300: '#7df0e0',
          400: '#36e0c8',
          500: '#10c5ac',
          600: '#069e8c'
        },
        // Hot magenta accent for highlights
        flush: {
          400: '#ff6bd6',
          500: '#f43bb8',
          600: '#d61e98'
        },
        // Near-black luxury surfaces (sidebar / cinematic sections)
        ink: {
          700: '#1c2030',
          800: '#13162420',
          850: '#0e111c',
          900: '#0a0c15',
          950: '#05060d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif']
      },
      letterSpacing: {
        tightest: '-0.04em'
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem', // 24px premium cards
        '4xl': '2rem'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,20,40,0.04), 0 6px 20px rgba(16,20,40,0.06)',
        card: '0 4px 24px rgba(24,16,64,0.08), 0 18px 50px rgba(24,16,64,0.10)',
        premium:
          '0 1px 2px rgba(16,20,40,0.04), 0 12px 32px -8px rgba(24,16,64,0.12), 0 40px 72px -24px rgba(24,16,64,0.22)',
        lift: '0 28px 80px -24px rgba(91,39,245,0.50), 0 8px 24px -12px rgba(24,16,64,0.16)',
        glow: '0 10px 50px rgba(109,73,255,0.40)',
        'glow-strong':
          '0 0 0 1px rgba(109,73,255,0.18), 0 18px 60px -12px rgba(109,73,255,0.55)',
        'glow-aqua': '0 10px 50px rgba(16,197,172,0.35)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.10)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.6)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg,#6d49ff 0%,#5b27f5 45%,#3f14ad 100%)',
        'aurora':
          'linear-gradient(120deg,#6d49ff 0%,#f43bb8 50%,#36e0c8 100%)',
        'aqua-gradient': 'linear-gradient(120deg,#36e0c8 0%,#10c5ac 100%)',
        'cinematic':
          'radial-gradient(1200px 600px at 15% -10%, rgba(109,73,255,0.55) 0%, transparent 55%), radial-gradient(900px 500px at 95% 0%, rgba(244,59,184,0.40) 0%, transparent 50%), radial-gradient(900px 700px at 60% 120%, rgba(54,224,200,0.35) 0%, transparent 55%)',
        'mesh-light':
          'radial-gradient(900px 500px at 0% 0%, rgba(109,73,255,0.10) 0%, transparent 55%), radial-gradient(800px 500px at 100% 0%, rgba(244,59,184,0.08) 0%, transparent 50%), radial-gradient(700px 600px at 80% 100%, rgba(54,224,200,0.08) 0%, transparent 55%)',
        'grid-faint':
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '36px 36px'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-fast': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.8)', opacity: '0' }
        },
        'aurora-pan': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        sheen: {
          '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
          '100%': { transform: 'translateX(220%) skewX(-18deg)' }
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(22px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'glow-breathe': {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in-fast': 'fade-in-fast 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.22,1,0.36,1) infinite',
        'aurora-pan': 'aurora-pan 8s ease infinite',
        sheen: 'sheen 1.1s cubic-bezier(0.22,1,0.36,1)',
        rise: 'rise 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'glow-breathe': 'glow-breathe 5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
