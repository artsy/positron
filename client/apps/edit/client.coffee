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
EditThumbnail = require './components/thumbnail/index.coffee'
SectionList = React.createFactory require './components/section_list/index.coffee'
HeroSection = React.createFactory require './components/hero_section/index.coffee'

@init = ->
  article = new Article sd.ARTICLE
  channel = new Channel sd.CURRENT_CHANNEL
  new EditLayout el: $('#layout-content'), article: article, channel: channel
  new EditHeader el: $('#edit-header'), article: article
  new EditThumbnail el: $('#edit-thumbnail'), article: article
  new EditAdmin el: $('#edit-admin'), article: article, channel: channel
  React.render(
    SectionList(sections: article.sections)
    $('#edit-sections')[0]
  )
  if article.attributes.hero_section != null or channel.hasFeature 'hero'
    React.render(
      HeroSection(section: article.heroSection, hasSection: article.get('section_ids')?.length > 0)
      $('#edit-hero-section')[0]
    )
