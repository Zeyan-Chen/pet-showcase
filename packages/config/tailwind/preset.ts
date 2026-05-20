import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        sand: "#f8f1e7",
        bark: "#6b4f3a",
        moss: "#7c9b6b",
        ink: "#1f1a17"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem"
      }
    }
  }
};

export default preset;
