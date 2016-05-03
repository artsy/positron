express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/links', routes.index
app.get '/links/:id', routes.find, routes.show
app.post '/links', setUser, authenticated, adminOnly, routes.save
app.put '/links/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/links/:id', setUser, authenticated, adminOnly, routes.find, routes.delete
