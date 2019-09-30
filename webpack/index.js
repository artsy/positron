// @ts-check

const merge = require("webpack-merge")
const { isDevelopment, isProduction, isCI } = require("../src/lib/environment")
const baseConfig = require("./config/base")
const developmentConfig = require("./config/development")
const productionConfig = require("./config/production")

const getConfig = () => {
  switch (true) {
    case isCI:
      console.log("[Positron] CI=true")
      return merge.smart(baseConfig, productionConfig)

    case isDevelopment:
      return merge.smart(baseConfig, developmentConfig)

    case isProduction:
      console.log("[Positron] Building client-side production code...")
      return merge.smart(baseConfig, productionConfig)
  }
}

const config = getConfig()

module.exports = config
