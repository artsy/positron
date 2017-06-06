express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/authors', routes.index
app.get '/authors/:id', routes.find, routes.show
app.post '/authors', setUser, authenticated, adminOnly, routes.save
app.put '/authors/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/authors/:id', setUser, authenticated, adminOnly, routes.find, routes.delete