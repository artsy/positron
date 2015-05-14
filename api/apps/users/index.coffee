express = require 'express'
{ setUser, authenticated, ownerOrAdminOnly, show } = require './routes'

app = module.exports = express()

app.get '/users/:id', setUser, authenticated, ownerOrAdminOnly, show