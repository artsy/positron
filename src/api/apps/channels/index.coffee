express = require 'express'
routes = require './routes'
{ setUser, authenticated, editorialOnly } = require '../users/routes'

app = module.exports = express()

app.get '/channels', routes.index
app.get '/channels/:id', routes.find, routes.show
app.post '/channels', setUser, authenticated, editorialOnly, routes.save
app.put '/channels/:id', setUser, authenticated, editorialOnly, routes.find, routes.save
app.delete '/channels/:id', setUser, authenticated, editorialOnly, routes.find, routes.delete
