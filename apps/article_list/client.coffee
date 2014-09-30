Article = require '../../models/article.coffee'
{ spooky } = require '../../lib/apis.coffee'
sd = require('sharify').data

@init = ->
  $('.article-title').keyup (e) ->
    return unless e.which is 13
    id = $(e.target).attr('data-id')
    spooky.get Article, 'article', { params: id: id }, (err, article) ->
      article.save title: $(e.target).val()