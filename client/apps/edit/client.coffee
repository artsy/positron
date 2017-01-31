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

@init = ->
  article = new Article sd.ARTICLE
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

  convertToImageCollection = (callback) ->
    console.log @props.sections
    async.eachSeries @props.sections.models, (section, cb) ->
      if section.get('type') is 'image'
        @convertImages section, cb
      else if section.get('type') is 'artwork'
        @convertArtworks section, cb
      else
        cb()
    , =>
      callback()

  convertImages = (section, callback) ->
    (img = new Image(src: section.get('url'))).onload ->
      image = {
        type: 'image_collection'
        images: [{
          type: section.get('type')
          url: section.get('url')
          caption: section.get('caption')
        }]
        layout: section.get('layout') or 'overflow_fillwidth'
        width: img.width
        height: img.height
      }
      section.clear()
      section.set image
      console.log image
      callback()

  convertArtworks = (section, callback) ->
    images = []
    async.eachSeries section.artworks, (artwork, cb) ->
      (img = new Image(src: section.get('image'))).onload ->
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
      section.set artworks
      console.log image
      callback()
