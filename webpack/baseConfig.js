// @ts-check
const ProgressBarPlugin = require("progress-bar-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const {
  NODE_ENV,
  basePath,
  isCI,
  isDeploy,
  isDevelopment,
  isProduction,
} = require("../src/lib/environment")

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
    publicPath: "/assets",
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
    new ProgressBarPlugin(),
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
    modules: [path.resolve(basePath, "src"), "node_modules"],
    symlinks: false,
  },
}

if (isDeploy) {
  baseConfig.devtool = "source-map"

  // Prod
  if (isProduction) {
    baseConfig.plugins.push(
      new UglifyJsPlugin({
        cache: true,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: false,
          },
        },
      })
    )
  }
}

// Helpers

function getEntrypoints() {
  return findAssets("src/client/assets")
}

function findAssets(rootPath) {
  const files = fs.readdirSync(path.join(basePath, rootPath))
  // Filter out .styl files
  const validAssets = file => {
    const whitelist = [".js", ".coffee"]
    const isValid = whitelist.some(
      extension => extension === path.extname(file)
    )
    return isValid
  }

  /**
   * Construct key/value pairs representing Webpack entrypoints; e.g.,
   * { desktop: [ path/to/subapp.asset.js ] }
   */
  const assets = files.filter(validAssets).reduce((assetMap, file) => {
    const fileName = path.basename(file, path.extname(file))
    const asset = {
      [fileName]: [path.join(basePath, rootPath, file)],
    }

    if (isDevelopment) {
      asset[fileName].unshift("webpack-hot-middleware/client?reload=true")
    }

    return {
      ...assetMap,
      ...asset,
    }
  }, {})

  return assets
}

module.exports = baseConfig
