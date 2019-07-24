// @ts-check
const path = require("path")
const WebpackManifestPlugin = require("webpack-manifest-plugin")
const { HashedModuleIdsPlugin } = require("webpack")
const TerserPlugin = require("terser-webpack-plugin")
const { getCSSManifest } = require("../utils/getCSSManifest")
const { NODE_ENV } = require("../../src/lib/environment")

module.exports.prodConfig = {
  parallelism: 75,
  mode: NODE_ENV,
  devtool: "source-map",
  output: {
    filename: "[name].[contenthash].js",
  },
  plugins: [
    new HashedModuleIdsPlugin(),
    new WebpackManifestPlugin({
      fileName: path.resolve(__dirname, "../../manifest.json"),
      basePath: "/assets/",
      seed: getCSSManifest(),
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: false,
        parallel: false,
        sourceMap: true, // Must be set to true if using source-maps in production
      }),
    ],
  },
}
