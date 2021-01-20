express = require 'express'
routes = require './routes'
{ setUser, authenticated, teamOnly } = require '../users/routes'

app = module.exports = express()

app.get '/curations', routes.index
app.get '/curations/:id', routes.find, routes.show
app.post '/curations', setUser, authenticated, teamOnly, routes.save
app.put '/curations/:id', setUser, authenticated, teamOnly, routes.find, routes.save
app.delete '/curations/:id', setUser, authenticated, teamOnly, routes.find, routes.delete
