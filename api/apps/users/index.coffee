express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/users/:id', routes.setUser, routes.authUser, routes.show
app.put '/users/:id', routes.setUser, routes.authUser, routes.update