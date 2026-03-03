import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config: UserConfig = defineConfig({
  base: "./",
  build: {
    assetsDir: "assets",
  },
  plugins: [tsconfigPaths()],
});

export default config;
