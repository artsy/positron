_ = require 'underscore'
_s = require 'underscore.string'
Backbone = require 'backbone'
moment = require 'moment'
{ POSITRON_URL, FORCE_URL } = process.env
cheerio = require 'cheerio'

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

  getAuthorArray: ->
    creator = []
    creator.push @get('author').name if @get('author')
    creator = _.union(creator, _.pluck(@get('contributing_authors'), 'name')) if @get('contributing_authors')?.length
    creator

  isEditorial: ->
    @get('featured')

  prepForInstant: ->

    replaceTagWith = (htmlStr, findTag, replaceTag ) ->
      $ = cheerio.load(htmlStr)
      $(findTag).each ->
        $(this).replaceWith($('<' + replaceTag + '>' + $(this).html() + '</' + replaceTag + '>'))
      $.html()

    sections =  _.map @get('sections'), (section) ->
      if section.type is 'text'
        $ = cheerio.load(section.body)
        $('br').remove()
        $('*:empty').remove()
        $('p').each ->
          $(this).remove() if $(this).text().length is 0
        section.body = $.html()
        section.body = replaceTagWith(section.body, 'h3', 'h2')
        section
      else if section.type is 'image'
        section.caption = replaceTagWith(section.caption, 'p', 'h1') if section.caption
        section
      else if section.type in ['image_set', 'image_collection']
        section.images = _.map section.images, (image) ->
          if image.type is 'image'
            image.caption = replaceTagWith(image.caption, 'p', 'h1') if image.caption
          image
        section
      else
        section
    @set 'sections', sections
