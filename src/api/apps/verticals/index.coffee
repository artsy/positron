express = require 'express'
routes = require './routes'
{ setUser, authenticated, teamOnly } = require '../users/routes'

app = module.exports = express()

app.get '/verticals', routes.index
app.get '/verticals/:id', routes.find, routes.show
app.post '/verticals', setUser, authenticated, teamOnly, routes.save
app.put '/verticals/:id', setUser, authenticated, teamOnly, routes.find, routes.update
app.delete '/verticals/:id', setUser, authenticated, teamOnly, routes.find, routes.delete
