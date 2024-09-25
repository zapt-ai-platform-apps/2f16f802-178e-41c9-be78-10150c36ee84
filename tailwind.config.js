export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#060F38', // Dark Navy
        secondary: '#763BEA', // Purple
        accent: '#CBFF2E', // Neon Yellow
        white: '#FFFFFF',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'sound-wave': "url('/assets/sound-wave.svg')",
      },
    },
  },
  plugins: [],
};