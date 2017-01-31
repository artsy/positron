#
# Init code that sets up our article model, pulls in each component, and
# initializes the individual Backbone views and React components that make up
# the editing UI.
#

React = require 'react'
Article = require '../../models/article.coffee'
Channel = require '../../models/channel.coffee'
EditLayout = require './components/layout/index.coffee'
EditHeader = require './components/header/index.coffee'
EditAdmin = require './components/admin/index.coffee'
EditDisplay = require './components/display/index.coffee'
SectionList = React.createFactory require './components/section_list/index.coffee'
HeroSection = React.createFactory require './components/hero_section/index.coffee'
async = require 'async'

@init = ->
  article = new Article sd.ARTICLE
  convertSections article, =>
    channel = new Channel sd.CURRENT_CHANNEL
    new EditLayout el: $('#layout-content'), article: article, channel: channel
    new EditHeader el: $('#edit-header'), article: article
    new EditDisplay el: $('#edit-display'), article: article
    new EditAdmin el: $('#edit-admin'), article: article, channel: channel
    React.render(
      SectionList(sections: article.sections)
      $('#edit-sections')[0]
    )
    if article.get('hero_section') != null or channel.hasFeature 'hero'
      React.render(
        HeroSection(section: article.heroSection, hasSection: article.get('section_ids')?.length > 0)
        $('#edit-hero-section')[0]
      )

convertSections = (article, callback) ->
  async.parallel(
    article.sections.map (section) ->
      (cb) ->
        if section.get('type') is 'image'
          convertImages section, cb
        else if section.get('type') is 'artworks'
          convertArtworks section, cb
        else if section.get('type') is 'image_set'
          convertImageSet section, cb
        else
          cb()
  , =>
    callback()
  )

convertImageSet = (section, callback) ->
  async.parallel(
    for image in section.get('images')
      (cb) ->
        img = new Image()
        img.src = image.image or image.url # image or artwork
        img.onload = ->
          image.width = img.width
          image.height = img.height
          cb()
  , =>
    callback()
  )

convertImages = (section, callback) ->
  img = new Image()
  img.src = section.get('url')
  img.onload = ->
    image = {
      type: 'image_collection'
      images: [{
        type: 'image'
        url: section.get('url')
        caption: section.get('caption')
        width: img.width
        height: img.height
      }]
      layout: section.get('layout') or 'overflow_fillwidth'
    }
    section.clear()
    section.set image
    callback()

convertArtworks = (section, callback) ->
  images = []
  async.parallel(
    for artwork in section.get('artworks')
      (cb) ->
        img = new Image()
        img.src = artwork.image
        img.onload = ->
          artwork.type = 'artwork'
          artwork.width = img.width
          artwork.height = img.height
          images.push artwork
          cb()
  , =>
    image = {
      type: 'image_collection'
      images: images
      layout: section.get('layout') or 'overflow_fillwidth'
    }
    section.clear()
    section.set image
    callback()
  )