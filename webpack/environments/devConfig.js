const chalk = require("chalk")
// @ts-check
const webpack = require("webpack")
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin")
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin")
const WebpackNotifierPlugin = require("webpack-notifier")
const { NODE_ENV } = require("../../src/lib/environment")
const { PORT, WEBPACK_DEVTOOL } = process.env
const path = require("path")
const fs = require("fs")
const { basePath, isCI } = require("../../src/lib/environment")

const cacheDirectory = path.resolve(basePath, ".cache")

if (!isCI && !fs.existsSync(cacheDirectory)) {
  console.log(
    chalk.yellow(
      "\n[!] No existing `.cache` directory detected, initial " +
        "launch will take a while.\n"
    )
  )
}

module.exports.devConfig = {
  devtool: WEBPACK_DEVTOOL,
  mode: NODE_ENV,
  module: {
    rules: [
      {
        test: /\.css$/,
        include: path.resolve(basePath, "src"),
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.styl$/,
        include: path.resolve(basePath, "src"),
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "stylus-loader" },
        ],
      },
    ],
  },
  plugins: [
    new SimpleProgressWebpackPlugin({
      format: "compact",
    }),
    new ForkTsCheckerWebpackPlugin({
      formatter: "codeframe",
      formatterOptions: "highlightCode",
      tslint: false,
      checkSyntacticErrors: true,
      watch: ["./src"],
    }),
    new ForkTsCheckerNotifierWebpackPlugin({
      excludeWarnings: true,
      skipFirstNotification: true,
    }),
    new FriendlyErrorsWebpackPlugin({
      clearConsole: false,
      compilationSuccessInfo: {
        messages: [`[Positron] Listening on http://localhost:${PORT} \n`],
        notes: [""],
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new WebpackNotifierPlugin(),
  ],
}
