_ = require 'underscore'
{ where, presentCollection } = Article = require '../articles/model'

module.exports.articles = (ctx, next) ->
  return next() unless ctx.req.query.articles
  return next() if ctx.req.query.articles.args?.published is false
  return new Promise (resolve, reject) ->
    where _.extend(ctx.req.query.articles.args, published: true), (err, results) ->
      ctx.res.articles = presentCollection(results).results
      next()
      resolve()