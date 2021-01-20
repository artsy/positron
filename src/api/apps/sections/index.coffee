express = require 'express'
routes = require './routes'
{ setUser, authenticated, teamOnly } = require '../users/routes'

app = module.exports = express()

app.get '/sections', routes.index
app.get '/sections/:id', routes.find, routes.show
app.post '/sections', setUser, authenticated, teamOnly, routes.save
app.put '/sections/:id', setUser, authenticated, teamOnly, routes.find, routes.save
app.delete '/sections/:id', setUser, authenticated, teamOnly, routes.find, routes.delete
