express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/shows', routes.search
app.get '/show/:id', routes.show
