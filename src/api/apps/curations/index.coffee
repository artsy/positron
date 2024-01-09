express = require 'express'
routes = require './routes'
{ setUser, authenticated, editorialOnly } = require '../users/routes'

app = module.exports = express()

app.get '/curations', routes.index
app.get '/curations/:id', routes.find, routes.show
app.post '/curations', setUser, authenticated, editorialOnly, routes.save
app.put '/curations/:id', setUser, authenticated, editorialOnly, routes.find, routes.save
app.delete '/curations/:id', setUser, authenticated, editorialOnly, routes.find, routes.delete
