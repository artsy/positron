express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ string, object, array } = require 'joi'
Article = require '../articles/model/schema'
{ find, where, presentCollection } = require '../articles/model'

app = module.exports = express()

api = joiql
  query:
    articles: array().items(object(
      Article.inputSchema
    )).meta(
      args: Article.querySchema
    )

api.use (ctx, next) ->
  return next() unless ctx.req.query.articles
  return new Promise (resolve, reject) ->
    where ctx.req.query.articles.args, (err, results) ->
      ctx.res.articles = presentCollection(results).results
      next()
      resolve()

app.use '/graphql', graphqlHTTP(
  schema: api.schema
  graphiql: true
  formatError: (error) => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack
  })
)
