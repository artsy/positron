_ = require 'underscore'
Backbone = require 'backbone'
{ stripTags } = require 'underscore.string'
{ EDITORIAL_CHANNEL, POSITRON_URL, FORCE_URL } = process.env
moment = require 'moment'
cheerio = require 'cheerio'
Authors = require '../apps/authors/model'

module.exports = class Article extends Backbone.Model

  urlRoot: "/api/articles"

  slug: ->
    _.last(@get('slugs'))

  href: ->
    "/article/#{@slug()}"

  fullHref: ->
    "#{FORCE_URL}/article/#{@slug()}"

  date: (attr) ->
    moment(@get(attr)).local()

  strip: (str) ->
    stripTags(str)

  # freshness boost as exponential decay on published_at date
  searchBoost: ->
    if @get('published')
      maxBoost = 1000.0
      meanLifetime = 365 * 3.0
      decayDays = (new Date().getTime() - moment(@get('published_at')).toDate().getTime())/(1000 * 60 * 60 * 24)
      Math.floor(maxBoost * Math.exp(-(decayDays/meanLifetime)))
    else
      0

  isFeatured: ->
    @get('featured')

  isEditorial: ->
    @get('channel_id')?.toString() is EDITORIAL_CHANNEL

  prepForInstant: (cb) ->
    @getAuthors (authors) =>
      sections =  _.map @get('sections'), (section) =>
        if section.type is 'text'
          $ = cheerio.load(section.body)
          $('br').remove()
          $('*:empty').remove()
          $('p').each ->
            $(this).remove() if $(this).text().length is 0
          section.body = $.html()
          section.body = @replaceTagWith(section.body, 'h3', 'h2')
          section
        else if section.type in ['image_set', 'image_collection']
          section.images = _.map section.images, (image) =>
            if image.type is 'image'
              image.caption = @replaceTagWith(image.caption, 'p', 'h1') if image.caption
            image
          section
        else
          section
      @set
        sections: sections
        authors: authors
      cb()

  replaceTagWith: (htmlStr, findTag, replaceTag) ->
    $ = cheerio.load(htmlStr)
    $(findTag).each ->
      $(this).replaceWith($('<' + replaceTag + '>' + $(this).html() + '</' + replaceTag + '>'))
    $.html()

  getAuthors: (cb) ->
    if @isEditorial()
      return cb ['Artsy Editors'] unless @get('author_ids')?.length
      Authors.mongoFetch
        ids: @get('author_ids')
      , (err, results) ->
        return cb ['Artsy Editors'] if err
        cb _.pluck results.results, 'name'
    else
      if @get('contributing_authors')?.length
        cb _.pluck(@get('contributing_authors'), 'name')
      else if @get('author')?.name
        cb [@get('author')?.name]
      else
        cb []
