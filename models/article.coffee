Backbone = require 'backbone'
{ parse } = require 'url'

module.exports = class Article extends Backbone.Model

  # So glad we don't have to hardcode urls!
  # TODO: Extract into a `halbone.url` helper
  url: ->
    url = parse(@get('_links').self.href)
    path = url.pathname.replace('/' + @get('id'), '')
    url.protocol + '//' + url.host + path + '/' + @get('id') + '?token=' + sd.SPOOKY_TOKEN

  defaults:
    state: 0

  stateName: ->
    if @get('state') is 'draft' then 'Draft' else 'Post'