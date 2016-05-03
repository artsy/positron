#
# CRUD for link sets
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/links', routes.index
app.get '/links/:id/edit', routes.edit
app.get '/links/new', routes.edit
app.post '/links/:id', routes.save
app.post '/links', routes.save
