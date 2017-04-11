#
# List views for queue
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'
{ adminOnly } = require '../../lib/middleware.coffee'

app.get '/queue', adminOnly, routes.queue
