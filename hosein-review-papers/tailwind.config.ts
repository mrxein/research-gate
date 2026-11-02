import type { Config } from "tailwindcss";
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    fontFamily: { sans: ["var(--f-sans)", "system-ui", "sans-serif"], serif: ["var(--f-serif)", "Georgia", "serif"] },
    colors: { ink: "#14202b", mist: "#f2f5f7", tide: "#1b6b7a", deep: "#0e1a22", panel: "#16252f" },
  } },
  plugins: [],
} satisfies Config;
