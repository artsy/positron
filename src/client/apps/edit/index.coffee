#
# New & editing UI for an article.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname + '/components'
app.set 'view engine', 'jade'

app.get '/articles/new', routes.create
app.get '/articles/:id/edit', routes.edit
# TODO: Remove after text2
app.get '/articles/:id/edit2', routes.edit
