require('@babel/register')
path = require 'path'
debug = require('debug') 'api'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

Article = require '../src/api/apps/articles/model/index.js'
Article.publishScheduledArticles (err, results) ->
  console.log "Completed Scheduling #{results.length} articles."
  return process.exit(err) if err
  return process.exit()
