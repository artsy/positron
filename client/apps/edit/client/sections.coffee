#
# React app that manages the large section management view.
#
# See http://facebook.github.io/react/index.html or
# https://github.com/artsy/positron/pull/25 for context.
#

_ = require 'underscore'
React = require 'react'
marked = require 'marked'
{ div, h1, h2, a, ul, li, nav, a, textarea } = React.DOM

#
# Top-level component that manages the section tool & the various individual
# section components that get rendered as the collection updates.
#
@SectionList = SectionList = React.createClass

  render: ->
    div { className: 'edit-section-list', ref: 'sections' },
      (for section, i in @props.sections
        switch section.type
          when 'text' then TextSection { section: section, key: i })
      SectionTool {
        sections: @props.sections
        onNewSection: _.bind(@forceUpdate, @)
        ref: 'tool'
      }

#
# The section tool that adds new sections at the bottom of the list
#
@SectionTool = SectionTool = React.createClass

  getInitialState: ->
    { open: false }

  toggle: ->
    @setState open: not @state.open

  newTextSection: ->
    @props.sections.push { type: 'text', body: '.' }
    @props.onNewSection()

  render: ->
    div { className: 'edit-section-tool', 'data-state-open': @state.open },
      div { className: 'edit-section-tool-icon', onClick: @toggle }
      ul { className: 'edit-section-tool-menu' },
        li {
          className: 'edit-section-tool-text'
          onClick: @newTextSection
        }, 'Text'
        li {
          className: 'edit-section-tool-artworks'
        }, 'Artworks'
        li {
          className: 'edit-section-tool-image'
        }, 'Image'
        li {
          className: 'edit-section-tool-video'
        }, 'Video'

#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#
@TextSection = TextSection = React.createClass

  getInitialState: ->
    { editing: false }

  toggleEditMode: ->
    @setState editing: not @state.editing

  handleEditKeyup: (e) ->
    @props.section.body = e.target.value

  render: ->
    div {
      className: 'edit-section-text-container'
      'data-state-editing': @state.editing
    },
      div {
        className: 'edit-section-text-editing'
        'data-state-editing': @state.editing
      },
        nav {},
          a {}, 'B'
          a {}, 'I'
          a {}, 'L'
        textarea {
          className: 'invisible-input'
          onKeyUp: @handleEditKeyup
          defaultValue: @props.section.body
        }
      div {
        className: 'edit-section-text-editing-bg'
        onClick: @toggleEditMode
      }
      div {
        className: 'edit-section-text'
        dangerouslySetInnerHTML: __html: marked @props.section.body
        onClick: @toggleEditMode
      }

@init = ({ sections, el }, callback) ->
  React.renderComponent SectionList(sections: sections), $(el)[0], callback