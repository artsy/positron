express = require 'express'
routes = require './routes'
{ setUser, authenticated, teamOnly } = require '../users/routes'

app = module.exports = express()

app.get '/authors', routes.index
app.get '/authors/:id', routes.find, routes.show
app.post '/authors', setUser, authenticated, teamOnly, routes.save
app.put '/authors/:id', setUser, authenticated, teamOnly, routes.find, routes.save
app.delete '/authors/:id', setUser, authenticated, teamOnly, routes.find, routes.delete
