express = require 'express'
graphqlHTTP = require 'express-graphql'
joiql = require 'joiql'
{ string, object } = require 'joi'
Article = require '../articles/model/schema'
{ find } = require '../articles/model'

app = module.exports = express()

api = joiql
  query:
    article: object(
      Article.inputSchema
    ).meta(
      args: Article.querySchema
    )

api.use (ctx, next) ->
  return next() unless ctx.req.query.article
  return new Promise (resolve, reject) ->
    find ctx.req.query.article.args.id, (err, article) ->
      ctx.res.article = article
      next()
      resolve()

app.use '/graphql', graphqlHTTP(schema: api.schema, graphiql: true)
