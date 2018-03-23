express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/sections', routes.index
app.get '/sections/:id', routes.find, routes.show
app.post '/sections', setUser, authenticated, adminOnly, routes.save
app.put '/sections/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/sections/:id', setUser, authenticated, adminOnly, routes.find, routes.delete