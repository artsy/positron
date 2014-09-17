_ = require 'underscore'
sd = require('sharify').data
Backbone = require 'backbone'
moment = require 'moment'
SpookyModel = require './spooky.coffee'
Sections = require '../collections/sections.coffee'

module.exports = class Article extends SpookyModel
  modelName: 'article'
  urlRoot: "#{sd.SPOOKY_URL}/api/articles"

  fetchWithSections: (options = {}) ->
    success = _.after 2, => options.success this
    _options = _.extend(_.omit(options, 'success'), success: success)
    @sections = new Sections null, id: @id
    @fetch _options
    @sections.fetch _options

  createdAt: ->
    moment(@get 'created_at').fromNow()