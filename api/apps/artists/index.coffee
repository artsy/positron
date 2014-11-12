express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/artists', routes.search, routes.index