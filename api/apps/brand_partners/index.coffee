express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/brand_partners', routes.index
app.get '/brand_partners/:id', routes.find, routes.show
app.post '/brand_partners', setUser, authenticated, adminOnly, routes.save
app.put '/brand_partners/:id', setUser, authenticated, adminOnly, routes.find, routes.save
app.delete '/brand_partners/:id', setUser, authenticated, adminOnly, routes.find, routes.delete