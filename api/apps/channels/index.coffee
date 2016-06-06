express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/channels', routes.index
app.get '/channels/:id', routes.find, routes.show
app.post '/channels', setUser, authenticated, adminOnly, routes.save
app.put '/channels/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/channels/:id', setUser, authenticated, adminOnly, routes.find, routes.delete
