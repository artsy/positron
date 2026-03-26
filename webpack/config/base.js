// @ts-check

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
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        include: path.resolve(__dirname, "../../src"),
        loader: "coffee-loader",
      },
      {
        test: /\.jade$/,
        include: path.resolve(__dirname, "../../src"),
        loader: "jade-loader",
      },
      {
        test: /\.(js|ts)x?$/,
        include: path.resolve(__dirname, "../../src"),
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
        include: path.resolve(__dirname, "../../src"),
        loader: "json-loader",
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "../../src"),
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.styl$/,
        include: path.resolve(__dirname, "../../src"),
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "stylus-loader" },
        ],
      },
    ],
  },
  plugins: [
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
