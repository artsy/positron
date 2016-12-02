_ = require 'underscore'
{ where, presentCollection } = Article = require '../articles/model'
Q = require 'bluebird-q'

module.exports.articles = (ctx, next) ->
  return next() unless ctx.req.query
  # return next() if ctx.req.query.articles?.args?.published is false

  return new Promise (resolve, reject) ->
    Q.allSettled [
      _.mapObject ctx.req.query, (val, key) ->
        console.log val, key
        where _.extend(ctx.req.query[key].args, published: true), (err, results) ->
          ctx.res[key] = presentCollection(results).results
    ]
    .then ->
      next()
      resolve()
