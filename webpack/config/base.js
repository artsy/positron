// @ts-check

const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin")
const ProgressBarPlugin = require("progress-bar-webpack-plugin")
const WebpackNotifierPlugin = require("webpack-notifier")
const path = require("path")
const webpack = require("webpack")
const { PORT } = process.env

const config = {
  output: {
    filename: "[name].js",
    path: path.resolve(process.cwd(), "public/assets"),
    publicPath: "/assets",
    sourceMapFilename: "[file].map?[contenthash]",
    globalObject: "this",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules\/es-toolkit/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { 
                  targets: { browsers: ["last 2 versions"] },
                  useBuiltIns: "usage",
                  modules: "commonjs"
                }]
              ],
              plugins: [
                "@babel/plugin-proposal-nullish-coalescing-operator",
                "@babel/plugin-proposal-optional-chaining"
              ],
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.coffee$/,
        include: /src/,
        loader: "coffee-loader",
      },
      {
        test: /\.jade$/,
        include: /src/,
        loader: "jade-loader",
      },
      {
        test: /\.(js|ts)x?$/,
        include: /src/,
        use: [
          {
            loader: "babel-loader",
            query: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.json$/,
        include: /src/,
        loader: "json-loader",
      },
      {
        test: /\.css$/,
        include: /src/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.styl$/,
        include: /src/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "stylus-loader" },
        ],
      },
    ],
  },
  plugins: [
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
      },
    }),
    new ProgressBarPlugin(),
    new WebpackNotifierPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
  ],
  resolve: {
    alias: {
      "@artsy/icons": path.resolve(
        __dirname,
        "../..",
        "node_modules",
        "@artsy/icons/dist/web"
      ),
      "es-toolkit": path.resolve(
        __dirname,
        "../..",
        "node_modules",
        "es-toolkit/dist/index.js"
      ),
    },
    extensions: [
      ".mjs",
      ".coffee",
      ".js",
      ".jsx",
      ".json",
      ".styl",
      ".ts",
      ".tsx",
    ],
    modules: ["node_modules", "src"],
    symlinks: false,
  },
}

module.exports = config
