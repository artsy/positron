// @ts-check

const { CI, NODE_ENV } = process.env
const isDevelopment = NODE_ENV === "development"
const isStaging = NODE_ENV === "staging"
const isProduction = NODE_ENV === "production"
const isDeploy = isStaging || isProduction
const isCI = CI === "true"
const basePath = process.cwd()

module.exports = {
  NODE_ENV,
  isDevelopment,
  isStaging,
  isProduction,
  isDeploy,
  isCI,
  basePath,
}
