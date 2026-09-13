/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#A3FF5F",
          hover: "#8EF04C",
          light: "#B5FF78",
          dark: "#75D83F",
          dim: "rgba(163, 255, 95, 0.12)",
          glow: "rgba(163, 255, 95, 0.25)",
        },
        teal: {
          accent: "#55D6BE",
          mint: "#5DE1C7",
          dim: "rgba(85, 214, 190, 0.12)",
        },
        op: {
          bg: "#0B100E",
          "bg-deep": "#080D0B",
          "bg-secondary": "#0D1210",
          surface: "#111714",
          elevated: "#151C18",
          hover: "#19221D",
          border: "#25312B",
          "border-strong": "#2B3831",
          text: "#F3F7F4",
          secondary: "#C0CCC5",
          muted: "#87948C",
          disabled: "#59655E",
        },
        light: {
          bg: "#F4F7F5",
          surface: "#FFFFFF",
          elevated: "#F8FAF8",
          border: "#DDE5DF",
          text: "#101612",
          secondary: "#526159",
          muted: "#74827A",
          brand: "#4E9B25",
        },
        semantic: {
          success: "#A3FF5F",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#55D6BE",
          neutral: "#87948C",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        container: "14px",
        card: "12px",
        control: "8px",
        panel: "16px",
        pill: "9999px",
        tag: "4px",
      },
      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1rem" }], // 12px
        "xs": ["0.8125rem", { lineHeight: "1.125rem" }], // 13px
        "sm": ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        "base": ["0.9375rem", { lineHeight: "1.375rem" }], // 15px
        "table-header": ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
        "table-body": ["0.875rem", { lineHeight: "1.25rem" }],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        popover: "0 12px 32px -4px rgba(0, 0, 0, 0.75)",
        "lime-glow": "0 0 20px -2px rgba(163, 255, 95, 0.35)",
        "teal-glow": "0 0 20px -2px rgba(85, 214, 190, 0.35)",
      }
    },
  },
  plugins: [],
}