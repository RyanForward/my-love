import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const astrologyUserId = env.ASTROLOGY_USER_ID ?? "";
  const astrologyKey = env.ASTROLOGY_API_KEY ?? "";

  return {
    base: "/my-love/",
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api/astrology": {
          target: "https://json.astrologyapi.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/astrology/, ""),
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq) => {
              if (astrologyUserId && astrologyKey) {
                const auth = Buffer.from(
                  `${astrologyUserId}:${astrologyKey}`,
                  "utf-8",
                ).toString("base64");
                proxyReq.setHeader("Authorization", `Basic ${auth}`);
              }
            });
          },
        },
      },
    },
  };
});
