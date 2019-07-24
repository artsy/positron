const chalk = require("chalk")
const merge = require("webpack-merge")

// @ts-check
const { baseConfig } = require("./environments/baseConfig")
const { devConfig } = require("./environments/devConfig")
const { prodConfig } = require("./environments/prodConfig")
const {
  NODE_ENV,
  isDevelopment,
  isProduction,
} = require("../src/lib/environment")

const getConfig = () => {
  console.log(chalk.green(`\n[Positron] NODE_ENV=${NODE_ENV} \n`))
  switch (true) {
    case isDevelopment:
      return merge.smart(baseConfig, devConfig)

    case isProduction:
      console.log("[Positron] Building client-side production code...")
      return merge.smart(baseConfig, prodConfig)

    default:
      return baseConfig
  }
}

const config = getConfig()

module.exports = config
