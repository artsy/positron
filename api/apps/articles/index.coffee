express = require 'express'
routes = require './routes'

app = module.exports = express()

app.get '/sync_to_post', routes.find, routes.syncToPost
app.get '/articles', routes.index
app.get '/articles/:id', routes.show
app.post '/articles', routes.create
app.put '/articles/:id', routes.find, routes.update
app.delete '/articles/:id', routes.find, routes.delete
