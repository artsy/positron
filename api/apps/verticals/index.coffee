express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/verticals', routes.index
app.get '/verticals/:id', routes.show
