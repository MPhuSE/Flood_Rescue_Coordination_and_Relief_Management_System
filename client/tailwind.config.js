/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          secondary: "hsl(var(--accent-secondary) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        diffuse: "0 12px 36px rgba(15, 23, 42, 0.08)",
        panel: "0 20px 48px rgba(29, 78, 216, 0.12)",
        accent: "0 8px 24px rgba(37, 99, 235, 0.18)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-secondary)))",
        "hero-glow":
          "radial-gradient(circle at top right, hsl(var(--accent) / 0.12), transparent 34%), radial-gradient(circle at bottom left, hsl(var(--accent-secondary) / 0.1), transparent 26%)",
      },
    },
  },
  plugins: [],
};
