const { loadEnvs } = require("@artsy/multienv")

require("regenerator-runtime/runtime")
require("coffeescript/register")
require("@babel/register")({
  extensions: [".js", ".jsx", ".mjs", ".ts", ".tsx"],
})
loadEnvs(".env.shared", ".env")
require("./boot")
