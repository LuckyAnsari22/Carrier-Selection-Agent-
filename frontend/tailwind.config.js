/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: '#060B14',
        navy: '#0D1B2A',
        'green-glow': '#00FF88',
        'orange-warn': '#FF8C00',
        'red-critical': '#FF2244',
        'red-dark': '#1A0F0F',
        'blue-accent': '#0070F3',
        'text-primary': '#F0F4FF',
        'text-secondary': '#8892A4',
        'ice': '#60A5FA',
        'gold': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00FF88' },
          '100%': { boxShadow: '0 0 20px #00FF88, 0 0 40px #00FF88' },
        },
        pulseGlow: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        }
      }
    }
  }
}