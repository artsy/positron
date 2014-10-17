#
# React app that manages the large section management view.
#
# See http://facebook.github.io/react/index.html or
# https://github.com/artsy/positron/pull/25 for context.
#

_ = require 'underscore'
React = require 'react'
marked = require 'marked'
icons = -> require('../templates/icons.jade') arguments...
Textarea = require 'react-textarea-autosize'
{ div, h1, h2, a, ul, li, nav, a, textarea, button } = React.DOM

#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#
@SectionList = SectionList = React.createClass

  getInitialState: ->
    { editingIndex: null }

  componentDidMount: ->
    @props.sections.on 'remove', => @forceUpdate()
    @props.sections.on 'add', @onNewSection

  componentWillUnmount: ->
    @props.sections.off()

  onToggleEditMode: (i) ->
    @setState editingIndex: i

  onNewSection: ->
    @setState editingIndex: @props.sections.length - 1

  render: ->
    div {},
      div { className: 'edit-section-list', ref: 'sections' },
        @props.sections.map (section, i) =>
          switch section.get 'type'
            when 'text'
              TextSection {
                section: section
                key: i
                ref: 'text' + i
                editing: @state.editingIndex is i
                onToggleEditMode: @onToggleEditMode
              }
      SectionTool {
        sections: @props.sections
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
    @props.sections.add { type: 'text', body: '' }
    @setState open: false

  render: ->
    div { className: 'edit-section-tool', 'data-state-open': @state.open },
      div {
        className: 'edit-section-tool-icon'
        onClick: @toggle
        dangerouslySetInnerHTML: __html:
          if @state.open
            $(icons()).filter('.section-tool-close').html()
          else
            $(icons()).filter('.section-tool').html()
      }
      ul { className: 'edit-section-tool-menu' },
        li {
          className: 'edit-section-tool-text'
          onClick: @newTextSection
        }, 'Text',
          div {
            className: 'edit-menu-icon-text'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.text').html()
          }
        li {
          className: 'edit-section-tool-artworks'
        }, 'Artworks',
          div {
            className: 'edit-menu-icon-artworks'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.artworks').html()
          }
        li {
          className: 'edit-section-tool-image'
        }, 'Image',
          div {
            className: 'edit-menu-icon-image'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.image').html()
          }
        li {
          className: 'edit-section-tool-video'
        }, 'Video',
          div {
            className: 'edit-menu-icon-video'
            dangerouslySetInnerHTML: __html: $(icons()).filter('.video').html()
          }

#
# When hovering over any section you get controls to remove it or add a section
# above and below it. This component is used as those controls.
#
@SectionHoverControls = SectionHoverControls = React.createClass

  deleteSection: ->
    @props.section.destroy()

  render: ->
    div {
      className: 'edit-section-hover-controls'
      onClick: @props.toggleEditMode
    },
      button {
        className: 'edit-section-remove button-reset'
        onClick: @deleteSection
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }

#
# Text section that display large bodies of copy and can split itself
# between empty paragraphs to insert a new section.
#
@TextSection = TextSection = React.createClass

  onClickOff: ->
    if @props.section.get('body') is ''
      @props.section.destroy()
    else
      @toggleEditMode()

  toggleEditMode: ->
    @props.onToggleEditMode if @props.editing then null else @props.key

  handleKeyup: (e) ->
    @props.section.set body: e.target.value

  focusInput: ->
    @refs.textarea.getDOMNode().focus() if @props.editing

  componentDidMount: ->
    @focusInput()

  componentDidUpdate: ->
    @focusInput()

  render: ->
    div {
      className: 'edit-section-text-container edit-section-container'
      'data-state-editing': @props.editing
    },
      SectionHoverControls {
        section: @props.section
        toggleEditMode: @toggleEditMode
      }
      div {
        className: 'edit-section-text-editing'
        'data-state-editing': @props.editing
      },
        nav {},
          a {}, 'B'
          a {}, 'I'
          a {}, 'L'
        Textarea {
          className: 'invisible-input'
          onKeyUp: @handleKeyup
          defaultValue: @props.section.get('body')
          ref: 'textarea'
        }
      div {
        className: 'edit-section-text-editing-bg'
        onClick: @onClickOff
      }
      div {
        className: 'edit-section-text'
        dangerouslySetInnerHTML: __html: marked @props.section.get('body')
        onClick: @toggleEditMode
      }

@init = ({ sections, el }, callback) ->
  React.renderComponent SectionList(sections: sections), $(el)[0], callback
