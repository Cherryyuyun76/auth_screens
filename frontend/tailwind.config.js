/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                luxury: {
                    gold: {
                        light: '#F9E2AF',
                        DEFAULT: '#D4AF37',
                        dark: '#AF9B5C',
                    },
                    white: {
                        pearl: '#FDFCFB',
                        clear: '#FFFFFF',
                    },
                    black: '#1A1A1A',
                }
            },
            fontFamily: {
                luxury: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
