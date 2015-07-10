#
# CRUD for organizations.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/organizations', routes.index
app.get '/organizations/:id/edit', routes.edit
app.get '/organizations/new', routes.edit
app.post '/organizations/:id', routes.save
app.post '/organizations', routes.save