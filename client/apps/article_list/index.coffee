#
# List views for published & drafts.
#

express = require 'express'
routes = require './routes'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.get '/', (req, res) ->
  console.log 'ok...should we redirect or what'
  res.redirect '/articles?published=true'
app.get '/articles', routes.articles
