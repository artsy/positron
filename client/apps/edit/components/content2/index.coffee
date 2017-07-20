React = require 'react'
moment = require 'moment'
_ = require 'underscore'
HeroSection = React.createFactory require '../content/sections/hero/index.coffee'
HeaderSection = React.createFactory require './sections/header/index.coffee'
SectionList = React.createFactory require '../content/section_list/index.coffee'
{ div, p, textarea } = React.DOM


module.exports = React.createClass
  displayName: 'EditContent'

  componentWillMount: ->
    @debouncedSave = _.debounce((->
      @props.article.save()
      @forceUpdate()
    ), 800)
    @props.article.sections.on 'change add remove reset', => @saveArticle()
    @props.article.heroSection.on 'change remove', => @saveArticle()

  saveArticle: ->
    unless @props.article.get('published')
      $('#edit-save').addClass('is-saving')
      @debouncedSave()
    else
      $('#edit-save').removeClass('is-saving').addClass 'attention'

  render: ->
    div {className: 'edit-section-layout ' + @props.article.get('layout')},
      if @props.article.get('layout') is 'classic' and
       (@props.article.get('hero_section') != null or @props.channel.hasFeature('hero'))
        HeroSection {
          section: @props.article.heroSection
          channel: @props.channel
        }
      HeaderSection {
        article: @props.article
        saveArticle: @saveArticle
      }

      div { id: 'edit-sections', className: 'edit-body-container' },
        SectionList {
          sections: @props.article.sections
          saveArticle: @saveArticle
          article: @props.article
          channel: @props.channel
        }
