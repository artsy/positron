require("regenerator-runtime/runtime")
require("coffeescript/register")
require("@babel/register")({
  extensions: [".js", ".jsx", ".mjs", ".ts", ".tsx"],
})

require("./boot")
