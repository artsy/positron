express = require 'express'
routes = require './routes'
{ setUser, authenticated, editorialOnly } = require '../users/routes'

app = module.exports = express()

app.get '/sections', routes.index
app.get '/sections/:id', routes.find, routes.show
app.post '/sections', setUser, authenticated, editorialOnly, routes.save
app.put '/sections/:id', setUser, authenticated, editorialOnly, routes.find, routes.save
app.delete '/sections/:id', setUser, authenticated, editorialOnly, routes.find, routes.delete
