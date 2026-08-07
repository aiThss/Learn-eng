import { fontFamily } from 'tailwindcss/defaultTheme';
/** Cấu hình Tailwind CSS cho EnglishUp */
const config = {
    darkMode: ['class'],
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: { '2xl': '1400px' },
        },
        extend: {
            colors: {
                // Bảng màu chính: Xanh dương đậm + accent cam/vàng
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                // Màu app đặc thù
                brand: {
                    50: 'hsl(214, 100%, 97%)',
                    100: 'hsl(214, 95%, 93%)',
                    200: 'hsl(213, 97%, 87%)',
                    300: 'hsl(212, 96%, 78%)',
                    400: 'hsl(213, 94%, 68%)',
                    500: 'hsl(217, 91%, 60%)',
                    600: 'hsl(221, 83%, 53%)',
                    700: 'hsl(224, 76%, 48%)',
                    800: 'hsl(226, 71%, 40%)',
                    900: 'hsl(224, 64%, 33%)',
                    950: 'hsl(226, 55%, 21%)',
                },
                gold: {
                    400: 'hsl(43, 96%, 56%)',
                    500: 'hsl(38, 92%, 50%)',
                    600: 'hsl(32, 95%, 44%)',
                },
                success: {
                    DEFAULT: 'hsl(142, 71%, 45%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
                warning: {
                    DEFAULT: 'hsl(38, 92%, 50%)',
                    foreground: 'hsl(0, 0%, 100%)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                // 2 font chính: Inter (UI) + Lexend (reading)
                sans: ['Inter', ...fontFamily.sans],
                reading: ['Lexend', ...fontFamily.sans],
            },
            fontSize: {
                // Scale chữ với line-height >= 1.5
                xs: ['0.75rem', { lineHeight: '1.5' }],
                sm: ['0.875rem', { lineHeight: '1.5' }],
                base: ['1rem', { lineHeight: '1.6' }],
                lg: ['1.125rem', { lineHeight: '1.6' }],
                xl: ['1.25rem', { lineHeight: '1.5' }],
                '2xl': ['1.5rem', { lineHeight: '1.4' }],
                '3xl': ['1.875rem', { lineHeight: '1.3' }],
                '4xl': ['2.25rem', { lineHeight: '1.2' }],
            },
            spacing: {
                // Scale 4px/8px
                '0.5': '0.125rem', // 2px
                '1': '0.25rem', // 4px
                '2': '0.5rem', // 8px
                '3': '0.75rem', // 12px
                '4': '1rem', // 16px
                '6': '1.5rem', // 24px
                '8': '2rem', // 32px
                '10': '2.5rem', // 40px
                '12': '3rem', // 48px
                '16': '4rem', // 64px
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'flip': 'flip 0.4s ease-in-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'streak-bounce': 'streakBounce 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                flip: {
                    '0%': { transform: 'rotateY(0deg)' },
                    '100%': { transform: 'rotateY(180deg)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                streakBounce: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.3)' },
                    '100%': { transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
export default config;
