express = require 'express'
routes = require './routes'
{ setUser, authenticated, teamOnly } = require '../users/routes'

app = module.exports = express()

app.get '/tags', routes.index
app.get '/tags/:id', routes.find, routes.show
app.post '/tags', setUser, authenticated, teamOnly, routes.save
app.put '/tags/:id', setUser, authenticated, teamOnly, routes.find, routes.update
app.delete '/tags/:id', setUser, authenticated, teamOnly, routes.find, routes.delete
