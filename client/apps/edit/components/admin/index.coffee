React = require 'react'
ReactDOM = require 'react-dom'
{ section, div } = React.DOM
_ = require 'underscore'

Article = React.createFactory require './article/index.coffee'
VerticalsTags = React.createFactory require './verticals_tags/index2.coffee'
Featuring = React.createFactory require './featuring/index.coffee'
SuperArticle = React.createFactory require './super_article/index.coffee'
Appearances = React.createFactory require './appearances/index.coffee'
printTitle = React.createFactory require './components/dropdown_header.coffee'

module.exports = React.createClass
  displayName: 'AdminSections'

  getInitialState: ->
    activeSections: ['article', 'verticals-tags']

  componentWillMount: ->
    @props.article.fetchFeatured()
    @props.article.fetchMentioned()
    @debouncedSave = _.debounce((-> @props.article.save()), 800)

  setActiveSection: (section) ->
    sections = @state.activeSections || []
    if section in @state.activeSections
      sections = _.without(sections, section)
      @setState activeSections: sections
    else
      sections.push(section)
      @setState activeSections: sections

  getActiveSection: (section) ->
    active = if section in @state.activeSections then ' active' else ''
    return active

  isActiveSection: (section) ->
    active = if section in @state.activeSections then true else false
    return active

  onChange: (key, value) ->
    @props.article.set(key, value)
    unless @props.article.get('published')
      @debouncedSave()
    else
      $('#edit-save').removeClass('is-saving').addClass 'attention'

  render: ->
    div { className: 'edit-admin' },

      section { className: 'edit-admin--verticals-tags' + @getActiveSection 'verticals-tags' },
        printTitle section: 'Verticals & Tagging', className: 'verticals-tags', onClick: @setActiveSection
        if @isActiveSection 'verticals-tags'
          VerticalsTags {article: @props.article, onChange: @onChange}

      section { className: 'edit-admin--article' + @getActiveSection 'article' },
        printTitle section: 'Article', className: 'article', onClick: @setActiveSection
        if @isActiveSection 'article'
          Article {article: @props.article, channel: @props.channel, onChange: @onChange}

      section { className: 'edit-admin--featuring' + @getActiveSection 'featuring' },
        printTitle section:  'Featuring', className: 'featuring', onClick: @setActiveSection
        if @isActiveSection 'featuring'
          Featuring {article: @props.article, channel: @props.channel, onChange: @onChange}

      if @props.channel.hasFeature 'superArticle'
        section { className: 'edit-admin--super-article' + @getActiveSection 'super-article' },
          printTitle section: 'Super Article', className: 'super-article', onClick: @setActiveSection
          if @isActiveSection 'super-article'
            SuperArticle {article: @props.article, channel: @props.channel, onChange: @onChange}

      section { className: 'edit-admin--additional-appearances' + @getActiveSection 'additional-appearances' },
        printTitle section: 'Additional Appearances', className: 'additional-appearances', onClick: @setActiveSection
        if @isActiveSection 'additional-appearances'
          Appearances {article: @props.article, channel: @props.channel, onChange: @onChange}