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
  channel = new Channel sd.CURRENT_CHANNEL
  new EditLayout el: $('#layout-content'), article: @article, channel: channel
  new EditHeader el: $('#edit-header'), article: @article
  new EditDisplay el: $('#edit-display'), article: @article
  ReactDOM.render(
    EditAdmin(article: @article, channel: channel)
    $('#edit-admin')[0]
  )
  if sd.EDIT_2
    ReactDOM.render(
      EditContent2(article: @article, channel: channel)
      $('#edit-content')[0]
    )
  else
    ReactDOM.render(
      EditContent(article: @article, channel: channel)
      $('#edit-content')[0]
    )

convertAuthor = (article) ->
  article.set 'author', _.pick article.get('author'), 'id', 'name'
