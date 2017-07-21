#
# Init code that sets up our article model, pulls in each component, and
# initializes the individual Backbone views and React components that make up
# the editing UI.
#

React = require 'react'
ReactDOM = require 'react-dom'
Article = require '../../models/article.coffee'
Channel = require '../../models/channel.coffee'
EditLayout = require './components/layout/index.coffee'
EditHeader = require './components/header/index.coffee'
EditDisplay = require './components/display/index.coffee'
EditAdmin = React.createFactory require './components/admin/index.coffee'
EditContent = React.createFactory require './components/content/index.coffee'
EditContent2 = React.createFactory require './components/content2/index.coffee'

async = require 'async'

@init = ->
  @article = new Article sd.ARTICLE
  convertSections @article, =>
    channel = new Channel sd.CURRENT_CHANNEL
    new EditLayout el: $('#layout-content'), article: @article, channel: channel
    new EditHeader el: $('#edit-header'), article: @article
    new EditDisplay el: $('#edit-display'), article: @article
    ReactDOM.render(
      EditAdmin(article: @article, channel: channel)
      $('#edit-admin')[0]
    )
    if sd.EDIT_2
      @article.set('layout', 'standard') if channel.isEditorial()
      ReactDOM.render(
        EditContent2(article: @article, channel: channel)
        $('#edit-content')[0]
      )
    else
      ReactDOM.render(
        EditContent(article: @article, channel: channel)
        $('#edit-content')[0]
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
    convertAuthor(article)
    callback()
  )

convertImageSet = (section, callback) ->
  async.parallel(
    section.get('images').map (image) -> (cb) ->
      img = new Image()
      img.src = image.image or image.url # image or artwork
      img.onload = ->
        image.width = img.width
        image.height = img.height
        image.artists = [image.artist] if image.type is 'artwork'
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
    section.get('artworks').map (artwork) -> (cb) ->
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

convertAuthor = (article) ->
  article.set 'author', _.pick article.get('author'), 'id', 'name'