express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/tags', routes.index
app.get '/tags/:id', routes.find, routes.show
app.post '/tags', setUser, authenticated, adminOnly, routes.save
app.put '/tags/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/tags/:id', setUser, authenticated, adminOnly, routes.find, routes.delete