_ = require 'underscore'
{ where, presentCollection } = Article = require '../articles/model'

module.exports.articles = (root, args, req, ast) ->
  console.log ast
  return new Promise (resolve, reject) ->
    where _.extend(args, published: true), (err, results) ->
      resolve presentCollection(results).results
