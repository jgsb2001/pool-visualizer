import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pool: {
          blue: '#1e88e5',
          light: '#4fc3f7',
          dark: '#0d47a1',
        },
        accent: {
          primary: '#667eea',
          secondary: '#764ba2',
        },
      },
      width: {
        sidebar: '350px',
      },
    },
  },
  plugins: [],
};

export default config;
