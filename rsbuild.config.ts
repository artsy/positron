import path from "path"
import { loadEnvs } from "@artsy/multienv"
import { defineConfig } from "@rsbuild/core"
import { pluginAssetsRetry } from "@rsbuild/plugin-assets-retry"
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill"
import { pluginReact } from "@rsbuild/plugin-react"

// loadEnvs(".env.shared", ".env")

export default defineConfig({
  root: "./src/v2",
  environments: {
    client: {
      plugins: [pluginAssetsRetry()],
      source: {
        entry: {
          index: "./client.tsx",
        },
        alias: {
          react: "react-18",
          "react-dom": "react-dom-18",
          "@artsy/icons": path.resolve(
            __dirname,
            "../..",
            "node_modules",
            "@artsy/icons/dist/web"
          ),
        },
        tsconfigPath: "./tsconfig.json",
      },
      // resolve: {
      //   aliasStrategy: "prefer-tsconfig",
      // },
      output: {
        target: "web",
        manifest: true,
        externals: {
          async_hooks: "async_hooks", // Required because getAsyncStorage isn't using async import()
        },
      },
      // tools: {
      //   htmlPlugin: false,
      // },
    },
  },

  /**
   * Shared config across environments
   */

  dev: {
    progressBar: true,
    writeToDisk: true,
  },
  plugins: [pluginReact(), pluginNodePolyfill()],
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  tools: {
    rspack: {
      cache: true,
      experiments: {
        cache: {
          type: "persistent",
        },
      },
    },
    swc: {
      jsc: {
        experimental: {
          plugins: [
            ["@swc/plugin-loadable-components", {}],
            [
              "@swc/plugin-styled-components",
              {
                ssr: true,
                displayName: true,
              },
            ],
            [
              "@swc/plugin-relay",
              {
                // Must be fully-resolved absolute path
                rootDir: path.resolve(process.cwd(), "src/v2"),
                artifactDirectory: "z__generated__",
                language: "typescript",
              },
            ],
          ],
        },
      },
    },
  },
})
