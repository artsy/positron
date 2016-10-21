express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ string, object, array } = require 'joi'
Article = require '../articles/model/schema'
resolvers = require './resolvers'

app = module.exports = express()

api = joiql
  query:
    articles: array().items(object(
      Article.inputSchema
    )).meta(
      args: Article.querySchema
    )

api.use resolvers.articles

app.use '/graphql', graphqlHTTP(
  schema: api.schema
  graphiql: true
  formatError: (error) => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
)
