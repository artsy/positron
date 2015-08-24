express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/brand-partners', routes.index
app.get '/brand-partners/:id', routes.find, routes.show
app.post '/brand-partners', setUser, authenticated, adminOnly, routes.save
app.put '/brand-partners/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/brand-partners/:id', setUser, authenticated, adminOnly, routes.find, routes.delete