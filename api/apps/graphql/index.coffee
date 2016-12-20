express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ string, object, array } = require 'joi'
Article = require '../articles/model/schema'
{ setUser } = require '../users/routes.coffee'
User = require '../users/model.coffee'
resolvers = require './resolvers'

app = module.exports = express()

schema = joiql
  query:
    articles: array().items(object(
      Article.inputSchema
    )).meta(
      args: Article.querySchema
      resolve: resolvers.articles
    )

app.use '/graphql', graphqlHTTP(
  schema: schema
  graphiql: true
  formatError: (error) => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
)
