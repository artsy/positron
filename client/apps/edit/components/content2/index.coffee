React = require 'react'
_ = require 'underscore'
Hero = require './sections/hero/index.jsx'
Header = require './sections/header/index.jsx'
SectionList = React.createFactory require './section_list/index.coffee'
{ div } = React.DOM

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
        React.createElement(
          Hero.default,
          {
            article: @props.article
            section: @props.article.heroSection
            sections: @props.article.sections
            channel: @props.channel
          }
        )
      React.createElement(
        Header.default,
        { article: @props.article, saveArticle: @saveArticle }
      )
      SectionList {
        sections: @props.article.sections
        saveArticle: @saveArticle
        article: @props.article
        channel: @props.channel
      }
