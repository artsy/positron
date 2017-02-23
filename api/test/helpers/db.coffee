_ = require 'underscore'
path = require 'path'
env = require 'node-env-file'
env path.resolve(__dirname, '../../../.env.test')
fs = require 'fs'
bcrypt = require 'bcryptjs'
{ SALT } = process.env

@fixtures = fixtures = require '../../../test/helpers/fixtures'
@db = require '../../lib/db'

@fabricate = (collection, data, callback) =>
  if _.isArray(data)
    data = (fixturize collection, obj for obj in data)
  else
    data = fixturize collection, data
  @db[collection].insert data, callback

fixturize = (collection, data) ->
  data = _.extend fixtures()[collection], data
  data.access_token = bcrypt.hashSync(data.access_token, SALT) if data.access_token
  data

@empty = (callback) =>
  @db.getCollectionNames (err, names) =>
    return callback() if names.length is 0
    cb = _.after names.length, callback
    @db.collection(col).drop(cb) for col in names
