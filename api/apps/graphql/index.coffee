express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ object, array, string } = require 'joi'
Article = require '../articles/model/schema'
Curation = require '../curations/model'
Channel = require '../channels/model'
Tag = require '../tags/model'
Author = require '../authors/model'
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
    article: object(Article.inputSchema)
    .meta(
      args: id: string()
      resolve: resolvers.article
    )
    curations: array().items(object(
      Curation.schema
    )).meta(
      args: Curation.querySchema
      resolve: resolvers.curations
    )
    channels: array().items(object(
      Channel.schema
    )).meta(
      args: Channel.querySchema
      resolve: resolvers.channels
    )
    tags: array().items(object(
      Tag.schema
    )).meta(
      args: Tag.querySchema
      resolve: resolvers.tags
    )
    authors: array().items(object(
      Author.schema
    )).meta(
      args: Author.querySchema
      resolve: resolvers.authors
    )

module.exports.schema = schema

app.use '/graphql', setUser, graphqlHTTP(
  schema: schema
  graphiql: true
  formatError: (error) -> ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
)
