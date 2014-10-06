express = require 'express'
routes = require './routes'

app = module.exports = express()

app.delete '/users/me', routes.deleteMe
app.use routes.set
app.get '/users/me', routes.me