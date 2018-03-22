Joi = require '../../lib/joi'

describe 'custom Joi extension', ->

  it 'returns an error if not a valid objectid', (done) ->
    schema = Joi.string().objectid()
    schema.validate '5936f5530fae440cda9ae05', (err, result) ->
      err.details[0].message.should.containEql '"value" needs to be a string of 12 bytes or a string of 24 hex characters'
      done()


  it 'casts the objectid to the string if valid', (done) ->
    schema = Joi.string().objectid()
    schema.validate '5936f5530fae440cda9ae052', (err, result) ->
      (typeof result).should.equal 'object'
      done()