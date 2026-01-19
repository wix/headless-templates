/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '400' }],
                sm: ['0.875rem', { lineHeight: '1.3', letterSpacing: '0.02em', fontWeight: '400' }],
                base: ['1rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '400' }],
                lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '600' }],
                xl: ['1.5rem', { lineHeight: '1.4', letterSpacing: '0em', fontWeight: '700' }],
                '2xl': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
                '3xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
                '4xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
                '5xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '900' }],
                '6xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.05em', fontWeight: '900' }],
                '7xl': ['5.5rem', { lineHeight: '1.05', letterSpacing: '-0.06em', fontWeight: '900' }],
                '8xl': ['6.5rem', { lineHeight: '1', letterSpacing: '-0.07em', fontWeight: '900' }],
                '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.08em', fontWeight: '900' }],
            },
            fontFamily: {
                heading: "avenir-lt-w01_85-heavy1475544",
                paragraph: "baskervillemtw01-smbdit"
            },
            colors: {
                subtleborder: '#D1CDC7',
                mutedgray: '#B0B0B0',
                foreground: '#4A4A4A',
                destructive: '#DF3131',
                destructiveforeground: '#FFFFFF',
                background: '#F7F5F0',
                secondary: '#4A4A4A',
                'secondary-foreground': '#F7F5F0',
                'primary-foreground': '#F7F5F0',
                primary: '#000000'
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
