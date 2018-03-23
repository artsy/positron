express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/verticals', routes.index
app.get '/verticals/:id', routes.find, routes.show
app.post '/verticals', setUser, authenticated, adminOnly, routes.save
app.put '/verticals/:id', setUser, authenticated, adminOnly, routes.find, routes.update
app.delete '/verticals/:id', setUser, authenticated, adminOnly, routes.find, routes.delete