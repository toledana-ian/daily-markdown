/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/App.tsx",
        "./src/main.tsx",
        "./src/**/*.{tsx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [
        "tailwindcss",
        "autoprefixer",
    ],
}

