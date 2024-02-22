import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-sidebar':
          'linear-gradient(180deg, rgba(64,52,107,1) 1%, rgba(37,27,75,1) 26%, rgba(37,27,75,1) 38%, rgba(37,27,75,1) 83%, rgba(2,0,36,1) 100%, rgba(0,212,255,1) 100%);',
      },
      colors: {
        indigo: {
          dark: '#1e1b4b',
        },
      },
    },
  },
  plugins: [],
}
export default config
