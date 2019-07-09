const chalk = require("chalk")
const merge = require("webpack-merge")

// @ts-check
const baseConfig = require("./baseConfig.js")
const { devConfig } = require("./devConfig.js")
const { NODE_ENV, isDevelopment } = require("../src/lib/environment")

const getConfig = () => {
  console.log(chalk.green(`\n[Positron] NODE_ENV=${NODE_ENV} \n`))
  switch (true) {
    case isDevelopment:
      return merge.smart(baseConfig, devConfig)

    default:
      return baseConfig
  }
}

const config = getConfig()

module.exports = config
