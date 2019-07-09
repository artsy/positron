const baseConfig = require("./baseConfig.js")
const chalk = require("chalk")
const { NODE_ENV } = require("../src/lib/environment")

const getConfig = () => {
  console.log(chalk.green(`\n[Positron] NODE_ENV=${NODE_ENV} \n`))
  return baseConfig
}

const config = getConfig()

module.exports = config
