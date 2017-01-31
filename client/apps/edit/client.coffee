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
  ReactDOM.render(
    SectionList(sections: article.sections)
    $('#edit-sections')[0]
  )
  if article.get('hero_section') != null or channel.hasFeature 'hero'
    ReactDOM.render(
      HeroSection(section: article.heroSection, hasSection: article.get('section_ids')?.length > 0)
      $('#edit-hero-section')[0]
    )
