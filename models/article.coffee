Backbone = require 'backbone'

module.exports = class Article extends Backbone.Model

  defaults:
    state: 'draft'

  # TODO: Extract this & apps/edit/client/index bootstrap code into
  # halbone helpers
  url: ->
    url = parse(@get('_links').self.href)
    path = url.pathname.replace('/' + @get('id'), '')
    url.protocol + '//' + url.host + path + '/' + @get('id')


  stateName: ->
    if @get('state') is 'draft' then 'Draft' else 'Post'