require('babel-core/register')
require('dotenv').config()
path = require 'path'
debug = require('debug') 'api'
{ unqueue } = require '../src/api/apps/articles/model/index.js'

unqueue (err, results) ->
  console.log "Completed Unqueueing #{results.length} articles."
  return process.exit(err) if err
  return process.exit()
