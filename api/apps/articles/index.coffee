express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/articles', routes.index
app.get '/articles/:id', routes.find, routes.show
app.post '/articles', routes.create
app.put '/articles/:id', routes.find, routes.update
app.delete '/articles/:id', routes.find, routes.delete
