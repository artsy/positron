import express from "express"
import webpack from "webpack"
import path from "path"
import webpackConfig from "../../../webpack"

const app = (module.exports = express())
const compiler = webpack(webpackConfig)

app.use(
  require("webpack-hot-middleware")(compiler, {
    log: false,
  })
)

app.use(
  require("webpack-dev-middleware")(compiler, {
    quiet: true,
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true,
    stats: {
      colors: true,
    },
  })
)

// Testbed for various configurations
app.get("/webpack", (req, res, next) => {
  res.send(`
  <html>
    <head>
      <title>Webpack Test</title>
    </head>
    <body>
      <div id='react-root' />
      <script src='/assets/webpack.js'></script>
    </body>
  </html>
  `)
})
