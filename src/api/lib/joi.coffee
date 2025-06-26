Joi = require('joi')
{ ObjectId } = require 'mongodb-legacy'

customJoi = Joi.extend(
  base: Joi.string()
  name: 'string'
  language:
    objectid: 'needs to be a string of 12 bytes or a string of 24 hex characters'
  rules: [{
    name: 'objectid'
    validate: (params, value, state, options) ->
      if ObjectId.isValid(value)
        return new ObjectId(value)
      else
        @createError('string.objectid', { v: value }, state, options)
  }]
)

module.exports = customJoi