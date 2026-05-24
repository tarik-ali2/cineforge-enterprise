import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'sans-serif']
      },
      colors: {
        ink: '#060817',
        neon: '#ffe45c',
        cyan: '#18e7ff',
        magenta: '#ff37bb'
      },
      boxShadow: {
        glow: '0 0 50px rgba(24, 231, 255, 0.28)'
      }
    }
  },
  plugins: []
};

export default config;
