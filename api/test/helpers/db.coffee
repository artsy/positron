_ = require 'underscore'
env = require 'node-env-file'
env __dirname + '../../../../.env.test'
fs = require 'fs'
path = require 'path'

@fixtures = fixtures = require '../../../test/helpers/fixtures'
@db = require '../../lib/db'

@fabricate = (collection, data, callback) =>
  if _.isArray(data)
    data = (_.extend(fixtures()[collection], obj) for obj in data)
  else
    data = _.extend fixtures()[collection], data
  @db[collection].insert data, callback

@empty = (callback) =>
  collections = fs.readdirSync path.resolve(__dirname, '../../apps')  
  cb = _.after collections.length, callback
  @db[col].remove({}, cb) for col in collections
