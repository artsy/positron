// @ts-check
const fs = require("fs")
const path = require("path")
const { basePath, isDevelopment } = require("../../src/lib/environment")

function getEntrypoints() {
  return findAssets("src/client/assets")
}

function findAssets(rootPath) {
  const files = fs.readdirSync(path.join(basePath, rootPath))
  // Filter out .styl files
  const validAssets = file => {
    const isValid = /\.(js|ts|coffee)x?/.test(path.extname(file))
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

module.exports = { getEntrypoints }
