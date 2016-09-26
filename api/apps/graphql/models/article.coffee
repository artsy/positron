{ model } = require 'joiql-mongo'
{ inputSchema } = require '../../articles/model/schema'
_ = require 'underscore'

module.exports = model('article', _.omit inputSchema, 'hero_section', 'sections')
