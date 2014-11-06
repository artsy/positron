#
# Generic section container component that handles things like hover controls
# and editing states. Also decides which section to render based on the
# section type.
#

SectionText = require '../section_text/index.coffee'
SectionArtworks = require '../section_artworks/index.coffee'
SectionImage = require '../section_image/index.coffee'
SectionVideo = require '../section_video/index.coffee'
React = require 'react'
{ div, nav, button } = React.DOM
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass

  onClickOff: ->
    @setEditing(off)()
    @refs.section?.onClickOff?()

  componentDidMount: ->
    @props.section.on 'change:layout', => @forceUpdate()

  componentWillUnmount: ->
    @props.section.off()

  setEditing: (editing) -> =>
    @props.onSetEditing if editing then @props.index else null

  removeSection: (e) ->
    e.stopPropagation()
    if @props.section.collection?.length is 1
      @props.section.collection?.reset()
    else
      @props.section.destroy()
    return

  render: ->
    div {
      className: 'edit-section-container'
      'data-state-editing': @props.editing
      'data-type': @props.section.get('type')
      'data-layout': @props.section.get('layout')
    },
      div {
        className: 'edit-section-hover-controls'
        onClick: @setEditing(on)
      },
        button {
          className: 'edit-section-remove button-reset'
          onClick: @removeSection
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
        }
      (switch @props.section.get('type')
        when 'text' then SectionText
        when 'artworks' then SectionArtworks
        when 'image' then SectionImage
        when 'video' then SectionVideo
      )(
        section: @props.section
        editing: @props.editing
        ref: 'section'
        onClick: @setEditing(on)
        setEditing: @setEditing
      )
      div {
        className: 'edit-section-container-bg'
        onClick: @onClickOff
      }
