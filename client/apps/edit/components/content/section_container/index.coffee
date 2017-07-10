#
# Generic section container component that handles things like hover controls
# and editing states. Also decides which section to render based on the
# section type.
#

React = require 'react'
SectionText = React.createFactory require '../sections/text/index.coffee'
SectionVideo = React.createFactory require '../sections/video/index.coffee'
SectionSlideshow = React.createFactory require '../sections/slideshow/index.coffee'
SectionEmbed = React.createFactory require '../sections/embed/index.coffee'
SectionFullscreen = React.createFactory require '../sections/fullscreen/index.coffee'
SectionCallout = React.createFactory require '../sections/callout/index.coffee'
SectionToc = React.createFactory require '../sections/toc/index.coffee'
SectionImageCollection = React.createFactory require '../sections/image_collection/index.coffee'
SectionImage = React.createFactory require '../sections/image/index.coffee'
{ div, nav, button } = React.DOM
icons = -> require('../../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'SectionContainer'

  onClickOff: ->
    @setEditing(off)()
    @refs.section?.onClickOff?()
    if @props.section.get('type') is 'image_set' or 'image_collection'
      @props.section.destroy() if @props.section.get('images')?.length is 0

  setEditing: (editing) -> =>
    debugger
    if @props.section.get('type') is 'text'
      @refs.section?.focus?()
    @props.onSetEditing if editing then @props.index ? true else null

  removeSection: (e) ->
    e.stopPropagation()
    @props.section.destroy()

  render: ->
    div {
      className: 'edit-section-container'
      'data-editing': @props.editing
      'data-type': @props.section.get('type')
      'data-layout': @props.section.get('layout')
    },
      unless @props.section.get('type') is 'fullscreen'
        div {
          className: 'edit-section-hover-controls'
          onClick: @setEditing(on)
        },
          unless @props.isHero
            button {
              className: "edit-section-drag button-reset"
              dangerouslySetInnerHTML: __html: $(icons()).filter('.draggable').html()
            }
          button {
            className: "edit-section-remove button-reset"
            onClick: @removeSection
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
          }
      (switch @props.section.get('type')
        when 'text' then SectionText
        when 'video' then SectionVideo
        when 'slideshow' then SectionSlideshow
        when 'embed' then SectionEmbed
        when 'fullscreen' then SectionFullscreen
        when 'callout' then SectionCallout
        when 'toc' then SectionToc
        when 'image_set' then SectionImageCollection
        when 'image_collection' then SectionImageCollection
        when 'image' then SectionImage
      )(
        section: @props.section
        sections: @props.sections
        editing: @props.editing
        index: @props.index
        ref: 'section'
        onClick: @setEditing(on)
        setEditing: @setEditing
        channel: @props.channel
        isHero: @props.isHero
        onSetEditing: @props.onSetEditing
      )
      div {
        className: 'edit-section-container-bg'
        onClick: @onClickOff
      }
      (
        if @props.section.get('type') is 'fullscreen'
          div { className: 'edit-section-container-block' }
      )
