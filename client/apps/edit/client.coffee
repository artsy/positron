#
# Init code that sets up our article model, pulls in each component, and
# initializes the individual Backbone views and React components that make up
# the editing UI.
#

React = require 'react'
Article = require '../../models/article.coffee'
EditLayout = require './components/layout/index.coffee'
EditHeader = require './components/header/index.coffee'
EditAdmin = require './components/admin/index.coffee'
EditThumbnail = require './components/thumbnail/index.coffee'
SectionList = require './components/section_list/index.coffee'

@init = ->
  article = new Article sd.ARTICLE
  new EditLayout el: $('#layout-content'), article: article
  new EditHeader el: $('#edit-header'), article: article
  new EditThumbnail el: $('#edit-thumbnail'), article: article
  new EditAdmin el: $('#edit-admin'), article: article
  React.render(
    SectionList(sections: article.sections)
    $('#edit-sections')[0]
  )
