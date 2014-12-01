express = require 'express'
{ setUser, ownerOrAdminOnly, show, update, search } = require './routes'

app = module.exports = express()

app.get '/users/:id', setUser, ownerOrAdminOnly, show
app.put '/users/:id', setUser, ownerOrAdminOnly, update
app.get '/users', ownerOrAdminOnly, search