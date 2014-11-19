express = require 'express'
routes = require './routes'

app = module.exports = express()

app.delete '/users/me', routes.deleteMe
app.get '/users/me', routes.me