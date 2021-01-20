#
# CRUD for curations
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/templates'
app.set 'view engine', 'jade'
{ teamOnly, adminOnly } = require '../../lib/middleware.coffee'

app.get '/settings', teamOnly, routes.index
app.get '/settings/curations', teamOnly, routes.curations
app.get '/settings/curations/:id/edit', teamOnly, routes.editCuration
app.post '/settings/curations/:id', teamOnly, routes.saveCuration
app.get '/settings/channels', teamOnly, routes.channels
app.get '/settings/channels/:id/edit', adminOnly, routes.editChannel
app.post '/settings/channels/:id', adminOnly, routes.saveChannel
app.get '/settings/tags', teamOnly, routes.tags
app.get '/settings/authors', teamOnly, routes.authors
