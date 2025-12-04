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
        'background': '#F5F1EC', // User-specified color
        'foreground': '#4B5563', // Dark gray for text, now a medium-dark gray
        'primary': '#374151',    // Medium gray for primary elements
        'secondary': '#9CA3AF',  // Lighter gray for secondary text
        'accent': '#F3F4F6',     // Very light gray for accents, borders
        'gray-button': '#808080', // Custom gray for Add to Cart button
        'button-fill': '#DADBDD', // Custom gray for filled buttons (10% darker than accent)
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

