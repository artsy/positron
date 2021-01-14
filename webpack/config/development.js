// @ts-check

const merge = require("webpack-merge")
const webpack = require("webpack")
const common = require("../index.js")
const { getEntrypoints } = require("../helpers")

module.exports = merge(common, {
  mode: "development",
  devtool: "cheap-module-eval-source-map",
  entry: {
    webpack: [
      "webpack-hot-middleware/client?reload=true",
      "./src/client/apps/webpack/client.js",
    ],
    ...getEntrypoints(),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: "react-hot-loader/webpack",
        include: /node_modules/,
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
})
