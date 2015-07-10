express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/organizations', routes.index
app.get '/organizations/:id', routes.find, routes.show
app.post '/organizations', setUser, authenticated, adminOnly, routes.save
app.put '/organizations/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/organizations/:id', setUser, authenticated, adminOnly, routes.find, routes.delete