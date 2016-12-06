express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ string, object, array } = require 'joi'
Article = require '../articles/model/schema'
User = require '../users/model.coffee'
resolvers = require './resolvers'

app = module.exports = express()

api = joiql
  query:
    articles: array().items(object(
      Article.inputSchema
    )).meta(
      args: Article.querySchema
    )

setUser = (req, res, next) ->
  return next() unless req.accessToken
  User.fromAccessToken req.accessToken, (err, user) ->
    # Stop all further requests if we can't find a user from that access token
    return next() if err?.message?.match 'invalid or has expired'
    return next err if err
    res.err 404, 'Could not find a user from that access token'  unless user?
    # Alias on the request object
    req.user = user
    next()

api.use resolvers.articles

app.use '/graphql', setUser, graphqlHTTP(
  schema: api.schema
  graphiql: true
  formatError: (error) => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
)

