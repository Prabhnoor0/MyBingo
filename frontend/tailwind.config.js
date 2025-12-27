/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html", // For Vite's index.html
    "./src/**/*.{js,jsx}", // Scan all JS/JSX files in src
    // Corrected path to include components within src
    "./src/components/**/*.{js,jsx}", // Scan all JS/JSX files in src/components
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      screens: {
        "2xl": "1400px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#97B3AE",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F0EEEA",
          foreground: "#97B3AE",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F0DDD6",
          foreground: "#97B3AE",
        },
        accent: {
          DEFAULT: "#D2E0D3",
          foreground: "#97B3AE",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom wellness colors from the palette
        sage: {
          DEFAULT: "#97B3AE",
          light: "#D2E0D3",
          dark: "#486856", // Added darker green for text contrast
        },
        peach: {
          DEFAULT: "#F2C3B9",
          light: "#F0DDD6",
        },
        cream: {
          DEFAULT: "#F0EEEA",
          warm: "#D6CBBF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
