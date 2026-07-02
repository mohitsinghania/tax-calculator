import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#16213E", // ledger cover navy
          light: "#233258",
          dark: "#0E1629",
        },
        paper: {
          DEFAULT: "#F3ECDC", // aged paper cream
          light: "#FAF6EC",
          line: "#C9BFA5", // rule lines
        },
        brass: {
          DEFAULT: "#C89B3C",
          dark: "#A67F2B",
        },
        stamp: {
          DEFAULT: "#B23A2F", // stamp red
          dark: "#8E2B22",
        },
        text: {
          DEFAULT: "#2B2418",
          muted: "#6B6250",
        },
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "paper-texture":
          "repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(43,36,24,0.05) 28px)",
      },
    },
  },
  plugins: [],
};
export default config;
