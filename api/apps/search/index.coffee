express = require 'express'
routes = require './routes'
{ setUser, authenticated, adminOnly } = require '../users/routes'

app = module.exports = express()

app.get '/search', routes.index
