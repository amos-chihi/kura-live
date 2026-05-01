/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kura27 Command Center Theme
        'kura': {
          bg: '#05070B',
          panel: '#0D121C',
          panel2: '#111827',
          border: '#1E293B',
          text: '#F8FAFC',
          'text-muted': '#94A3B8',
          'text-faint': '#64748B',
          'text-body': '#CBD5E1',
          green: '#00D26A',
          red: '#FF4D4F',
          amber: '#F5B942',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          orange: '#F97316',
          pink: '#EC4899',
          teal: '#14B8A6',
          indigo: '#6366F1'
        },
        // Legacy flat colors for compatibility
        'kura-bg': '#05070B',
        'kura-panel': '#0D121C',
        'kura-panel2': '#111827',
        'kura-border': '#1E293B',
        'kura-text': '#F8FAFC',
        'kura-muted': '#94A3B8',
        'kura-text-muted': '#94A3B8',
        'kura-text-faint': '#64748B',
        'kura-text-body': '#CBD5E1',
        'kura-green': '#00D26A',
        'kura-red': '#FF4D4F',
        'kura-amber': '#F5B942',
        'kura-blue': '#3B82F6',
        'kura-purple': '#8B5CF6',
        'kura-cyan': '#06B6D4',
        'kura-orange': '#F97316',
        'kura-pink': '#EC4899',
        'kura-teal': '#14B8A6',
        'kura-indigo': '#6366F1',
        // Additional legacy colors
        'kura-navy': '#0D121C',
        'kura-navy-mid': '#111827',
        'kura-accent': '#00D26A',
        'kura-accent2': '#FF4D4F',
        'kura-surface': '#0D121C'
      },
      animation: {
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
        'blink': 'blink 2s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'data-roll': 'data-roll 0.6s ease-out',
        'alert-flash': 'alert-flash 1s ease-in-out infinite',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(255, 77, 79, 0.7)' },
          '50%': { opacity: 0.7, boxShadow: '0 0 0 8px rgba(255, 77, 79, 0)' },
        },
        'blink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 210, 106, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 210, 106, 0.6)' },
        },
        'data-roll': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'alert-flash': {
          '0%, 100%': { backgroundColor: 'rgba(255, 77, 79, 0.1)' },
          '50%': { backgroundColor: 'rgba(255, 77, 79, 0.3)' },
        }
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 210, 106, 0.4)',
        'glow-red': '0 0 20px rgba(255, 77, 79, 0.4)',
        'glow-amber': '0 0 20px rgba(245, 185, 66, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'panel-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
