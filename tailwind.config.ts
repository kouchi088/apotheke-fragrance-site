import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'background': '#ffffff', // White background
        'foreground': '#111827', // Dark gray for text
        'primary': '#374151',    // Medium gray for primary elements
        'secondary': '#9CA3AF',  // Lighter gray for secondary text
        'accent': '#F3F4F6',     // Very light gray for accents, borders
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

