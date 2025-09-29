/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 10px) scale(0.98)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shine: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        blob: 'blob 12s ease-in-out infinite',
        shine: 'shine 8s linear infinite',
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(79, 70, 229, 0.45)',
      },
      backgroundImage: {
        'radial-faded': 'radial-gradient(30rem 30rem at 20% 10%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(30rem 30rem at 80% 30%, rgba(147,51,234,0.18), transparent 60%)',
      },
    },
  },
  plugins: [],
}

