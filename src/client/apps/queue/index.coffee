#
# List views for queue
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'
{ editorialOnly } = require '../../lib/middleware.coffee'

app.get '/queue', editorialOnly, routes.queue
