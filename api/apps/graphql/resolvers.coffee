{ find, where, presentCollection } = require '../articles/model'

module.exports.articles = (ctx, next) ->
  return next() unless ctx.req.query.articles
  return new Promise (resolve, reject) ->
    where ctx.req.query.articles.args, (err, results) ->
      ctx.res.articles = presentCollection(results).results
      next()
      resolve()
