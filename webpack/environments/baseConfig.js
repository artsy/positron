// @ts-check
const path = require("path")
const webpack = require("webpack")
const {
  NODE_ENV,
  basePath,
  isCI,
  isDeploy,
} = require("../../src/lib/environment")
const { getEntrypoints } = require("../utils/getEntrypoints")

const baseConfig = {
  devtool: "cheap-module-eval-source-map",
  entry: {
    webpack: [
      "webpack-hot-middleware/client?reload=true",
      "./src/client/apps/webpack/client.js",
    ],
    ...getEntrypoints(),
  },
  output: {
    filename: "[name].js",
    path: path.resolve(basePath, "public/assets"),
    publicPath: "/assets/",
    sourceMapFilename: "[file].map?[contenthash]",
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        include: path.resolve(basePath, "src"),
        loader: "coffee-loader",
      },
      {
        test: /\.jade$/,
        include: path.resolve(basePath, "src"),
        loader: "jade-loader",
      },
      {
        test: /\.(js|ts)x?$/,
        include: path.resolve(basePath, "src"),
        use: [
          {
            loader: "babel-loader",
            query: {
              cacheDirectory: !isCI && path.join(basePath, ".cache", "babel"),
            },
          },
        ],
      },
      {
        test: /\.json$/,
        include: path.resolve(basePath, "src"),
        loader: "json-loader",
      },
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
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
  ],
  resolve: {
    extensions: [".mjs", ".coffee", ".js", ".jsx", ".json", ".ts", ".tsx"],
    modules: [path.resolve(basePath, "src"), "node_modules"],
    symlinks: false,
  },
  optimization: {
    // Extract webpack runtime code into it's own file
    runtimeChunk: {
      name: "runtime-manifest",
    },
    splitChunks: {
      cacheGroups: {
        // Separate vendor libraries from `node_modules` into a `commons.js`
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "common",
          minChunks: 10,
          chunks: "initial",
        },
      },
    },
  },
  externals: {
    // Don't bundle modules and consider them external
    request: "request",
  },
}

if (isDeploy) {
  baseConfig.devtool = "source-map"
}

module.exports = { baseConfig }
