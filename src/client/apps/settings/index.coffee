#
# CRUD for curations
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/templates'
app.set 'view engine', 'jade'
{ editorialOnly } = require '../../lib/middleware.coffee'

app.get '/settings', editorialOnly, routes.index
app.get '/settings/curations', editorialOnly, routes.curations
app.get '/settings/curations/:id/edit', editorialOnly, routes.editCuration
app.post '/settings/curations/:id', editorialOnly, routes.saveCuration
app.get '/settings/channels', editorialOnly, routes.channels
app.get '/settings/channels/:id/edit', editorialOnly, routes.editChannel
app.post '/settings/channels/:id', editorialOnly, routes.saveChannel
app.get '/settings/tags', editorialOnly, routes.tags
app.get '/settings/authors', editorialOnly, routes.authors
