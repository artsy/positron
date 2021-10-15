// load multienv with default environment files
const { loadEnvs } = require("@artsy/multienv")
loadEnvs(".env.shared", ".env")
