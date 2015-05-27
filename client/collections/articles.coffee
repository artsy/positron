_ = require 'underscore'
Backbone = require 'backbone'
Article = require '../models/article.coffee'
sd = require('sharify').data
moment = require 'moment'
{ ApiCollection } = require './mixins.coffee'

module.exports = class Articles extends Backbone.Collection

  _.extend @prototype, ApiCollection

  url: "#{sd.API_URL}/articles"

  model: Article

  toPaginatedListItems: ->
    @map (article) ->
      imgSrc: article.get('thumbnail_image')
      title: article.get('thumbnail_title')
      subtitle: (
        if article.get('published_at')
          "Published #{moment(article.get('published_at')).fromNow()}"
        else
          "Last saved #{moment(article.get('updated_at')).fromNow()}"
      )
      href: "/articles/#{article.get('id')}/edit"