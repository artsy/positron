express = require 'express'
routes = require './routes'
{ setUser, authenticated } = require '../users/routes'

app = module.exports = express()

app.get '/articles', setUser, routes.index
app.get '/articles/:id', routes.find, routes.show
app.post '/articles', setUser, authenticated, routes.restrictFeature, routes.create
app.put '/articles/:id', setUser, authenticated, routes.find, routes.restrictFeature, routes.update
app.delete '/articles/:id', setUser, authenticated, routes.find, routes.delete
