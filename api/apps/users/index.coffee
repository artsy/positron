express = require 'express'
{ setUser, ownerOrAdminOnly, show, create, index } = require './routes'

app = module.exports = express()

app.get '/users/:id', setUser, ownerOrAdminOnly, show