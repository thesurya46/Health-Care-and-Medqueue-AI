/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a",
                primary: {
                    DEFAULT: "#3B82F6",
                    dark: "#1D4ED8",
                },
                secondary: {
                    DEFAULT: "#10B981",
                    dark: "#059669",
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        function ({ addComponents, theme }) {
            addComponents({
                '.glass': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    backgroundImage: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent)',
                },
                '.glass-card': {
                    '@apply glass rounded-[2.5rem] p-8 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]': {},
                },
                '.btn-primary': {
                    '@apply px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-primary-dark hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_-5px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2': {},
                },
                '.btn-secondary': {
                    '@apply px-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:bg-secondary-dark hover:scale-[1.02] active:scale-95 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2': {},
                }
            })
        }
    ],
}
