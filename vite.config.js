import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [vue(), tailwindcss()],
    server: {
      port: Number(env.APP_PORT) || 3000,
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@toast-ui/editor")) {
                return "editor";
              }
              if (id.includes("sweetalert2")) {
                return "swal";
              }
              if (id.includes("lucide-vue-next")) {
                return "icons";
              }
              if (id.includes("vue") || id.includes("pinia")) {
                return "vendor";
              }
            }
          },
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      testTimeout: 15000,
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,vue}"],
        exclude: [
          "src/main.js",
          "src/setupTests.js",
          "src/test-utils.js",
          "**/*.test.{js,jsx}",
          "node_modules/**",
          ".docs/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});
