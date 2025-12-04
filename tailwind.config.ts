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
        'background': '#FFFFFF', // White
        'foreground': '#333333', // Neutral dark gray
        'primary': '#666666',    // Neutral medium gray
        'secondary': '#999999',  // Neutral light gray
        'accent': '#EEEEEE',     // Very light neutral gray
        'gray-button': '#808080', // Custom gray for Add to Cart button
        'button-fill': '#DADBDD', // Custom gray for filled buttons
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

