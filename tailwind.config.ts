import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "nhs-blue": "#005EB8",
        "nhs-dark-blue": "#003087",
        "nhs-bright-blue": "#0072CE",
        "nhs-light-blue": "#41B6E6",
        "nhs-green": "#007f3b",
        "nhs-light-green": "#78BE20",
        "nhs-black": "#212b32",
        "nhs-dark-grey": "#425563",
        "nhs-mid-grey": "#768692",
        "nhs-pale-grey": "#E8EDEE",
        "nhs-white": "#FFFFFF",
      },
      fontFamily: {
        sans: ["Frutiger", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
