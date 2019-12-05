// @ts-check

const merge = require("webpack-merge")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const common = require("../index.js")
const { getEntrypoints } = require("../helpers")

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  entry: {
    ...getEntrypoints(),
  },
  plugins: [
    new UglifyJsPlugin({
      cache: true,
      sourceMap: true,
      uglifyOptions: {
        compress: {
          warnings: false,
        },
      },
    }),
  ],
})
