/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F8F9FB',
        border: '#E6E8EC',
        text: {
          primary: '#111111',
          secondary: '#5A5F66',
        },
        accent: '#0E7C66',
        danger: '#D64545',
        success: '#1F9D55',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '40px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.05)',
        'medium': '0 4px 12px rgba(0,0,0,0.08)',
      },
      fontSize: {
        'h1': '40px',
        'h2': '28px',
        'h3': '20px',
        'body': '16px',
        'caption': '14px',
        'pet-sm': '48px',
        'pet-md': '96px',
        'pet-lg': '128px',
      }
    },
  },
  plugins: [],
}
