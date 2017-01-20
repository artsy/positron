#
# Generic section container component that handles things like hover controls
# and editing states. Also decides which section to render based on the
# section type.
#

React = require 'react'
SectionText = React.createFactory require '../section_text/index.coffee'
SectionArtworks = React.createFactory require '../section_artworks/index.coffee'
SectionImage = React.createFactory require '../section_image/index.coffee'
SectionVideo = React.createFactory require '../section_video/index.coffee'
SectionSlideshow = React.createFactory require '../section_slideshow/index.coffee'
SectionEmbed = React.createFactory require '../section_embed/index.coffee'
SectionFullscreen = React.createFactory require '../section_fullscreen/index.coffee'
SectionCallout = React.createFactory require '../section_callout/index.coffee'
SectionToc = React.createFactory require '../section_toc/index.coffee'
SectionImageSet = React.createFactory require '../section_image_set/index.coffee'
SectionImageCollection = React.createFactory require '../section_image_collection/index.coffee'
{ div, nav, button } = React.DOM
icons = -> require('./icons.jade') arguments...

module.exports = React.createClass

  onClickOff: ->
    @setEditing(off)()
    @refs.section?.onClickOff?()
    if @props.section.get('type') is 'image_set' or 'image_collection'
      @props.section.destroy() if @props.section.get('images').length is 0

  componentDidMount: ->
    @props.section.on 'change:layout', => @forceUpdate()

  setEditing: (editing) -> =>
    @props.onSetEditing if editing then @props.index ? true else null

  removeSection: (e) ->
    e.stopPropagation()
    @props.section.destroy()

  render: ->
    div {},
      div {
        className: 'edit-section-container'
        'data-editing': @props.editing
        'data-type': @props.section.get('type')
        'data-layout': @props.section.get('layout')
      },
        div {
          className: 'edit-section-hover-controls'
          onClick: @setEditing(on)
        },
          button {
            className: "edit-section-remove button-reset #{'is-hidden' if @props.section.get('type') is 'fullscreen'}"
            onClick: @removeSection
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
          }
        (switch @props.section.get('type')
          when 'text' then SectionText
          when 'artworks' then SectionArtworks
          when 'image' then SectionImage
          when 'video' then SectionVideo
          when 'slideshow' then SectionSlideshow
          when 'embed' then SectionEmbed
          when 'fullscreen' then SectionFullscreen
          when 'callout' then SectionCallout
          when 'toc' then SectionToc
          when 'image_set' then SectionImageSet
          when 'image_collection' then SectionImageCollection
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
      (
        if @props.section.get('type') is 'fullscreen'
          div { className: 'edit-section-container-block' }
      )