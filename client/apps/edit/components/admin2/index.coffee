React = require 'react'
ReactDOM = require 'react-dom'
{ section, div } = React.DOM

Article = React.createFactory require './article/index.coffee'
SectionTags = React.createFactory require './section_tags/index.coffee'
Featuring = React.createFactory require './featuring/index.coffee'
SuperArticle = React.createFactory require './super_article/index.coffee'
Appearances = React.createFactory require './appearances/index.coffee'

printTitle = React.createFactory require '../../../../components/dropdown_section/dropdown_header.coffee'

module.exports = React.createClass
  displayName: 'AdminSections'

  getInitialState: ->
    activeSection: 'super-article'

  setActiveSection: (section) ->
    section = if section isnt @state.activeSection then section else null
    @setState activeSection: section

  getActiveSection: (section) ->
    active = if section is @state.activeSection then ' active' else ''
    return active

  isActiveSection: (section) ->
    active = if section is @state.activeSection then true else false
    return active

  componentWillMount: ->
    @props.article.fetchFeatured()
    @props.article.fetchMentioned()

  render: ->
    div { className: 'edit-admin' },

      section { className: 'edit-admin--article' + @getActiveSection 'article' },
        printTitle section: 'Article', className: 'article', onClick: @setActiveSection
        if @isActiveSection 'article'
          Article {article: @props.article, channel: @props.channel}

      section { className: 'edit-admin--section-tags' + @getActiveSection 'section-tags' },
        printTitle section: 'Section & Tagging', className: 'section-tags', onClick: @setActiveSection
        if @isActiveSection 'section-tags'
          SectionTags {article: @props.article}

      section { className: 'edit-admin--featuring' + @getActiveSection 'featuring' },
        printTitle section:  'Featuring', className: 'featuring', onClick: @setActiveSection
        if @isActiveSection 'featuring'
          Featuring {article: @props.article, channel: @props.channel}

      section { className: 'edit-admin--super-article' + @getActiveSection 'super-article' },
        printTitle section: 'Super Article', className: 'super-article', onClick: @setActiveSection
        if @isActiveSection 'super-article'
          SuperArticle {article: @props.article}

      section { className: 'edit-admin--additional-appearances' + @getActiveSection 'additional-appearances' },
        printTitle section: 'Additional Appearances', className: 'additional-appearances', onClick: @setActiveSection
        if @isActiveSection 'additional-appearances'
          Appearances {article: @props.article}