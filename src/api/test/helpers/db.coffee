_ = require 'underscore'
path = require 'path'
fs = require 'fs'
bcrypt = require 'bcryptjs'
{ SALT } = process.env

@fixtures = fixtures = require '../../../test/helpers/fixtures'
@db = require '../../lib/db'

@fabricate = (collectionName, data, callback) =>
  collection = @db.collection(collectionName)
  if _.isArray(data)
    data = (fixturize collectionName, obj for obj in data)
    return collection.insertMany data, (err, res) ->
      collection.find({}).toArray(callback)
  if collectionName == 'sessions'
    data = fixturize collectionName, data
    return collection.insertMany data, (err, res) ->
      collection.find({}).toArray(callback)
  else
    debugger
    data = fixturize collectionName, data
    return collection.insertOne data, (err, res) ->
      collection.findOne({_id: res.insertedId}, callback)


fixturize = (collection, data) ->
  data = _.extend fixtures()[collection], data
  data.access_token = bcrypt.hashSync(data.access_token, SALT) if data.access_token
  data

@empty = (callback) =>
  @db.listCollections({}).toArray (err, collections) =>
    return callback() if collections.length is 0
    cb = _.after collections.length, callback
    @db.collection(col.name).drop(cb) for col in collections
