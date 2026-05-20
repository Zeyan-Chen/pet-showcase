import type { Config } from "tailwindcss";
import preset from "@pet-showcase/config/tailwind/preset";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]
};

export default config;
