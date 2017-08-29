#
# Generic section container component that handles things like hover controls
# and editing states. Also decides which section to render based on the
# section type.
#

React = require 'react'
_ = require 'underscore'
Text = React.createFactory require '../sections/text/index.coffee'
Video = require '../sections/video/index.jsx'
Slideshow = React.createFactory require '../../content/sections/slideshow/index.coffee'
Embed = React.createFactory require '../sections/embed/index.coffee'
Fullscreen = React.createFactory require '../../content/sections/fullscreen/index.coffee'
ImageCollection = React.createFactory require '../sections/image_collection/index.coffee'
Image = React.createFactory require '../../content/sections/image/index.coffee'
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
    if @props.section.get('type') is 'text'
      @refs.section?.focus?()
    @props.onSetEditing if editing then @props.index ? true else null

  removeSection: (e) ->
    e.stopPropagation()
    @props.section.destroy()

  getContentStartEnd: ->
    types = @props.sections.map (section, i) => return {type: section.get 'type', index: i}
    start = _.findIndex(types, { type: 'text'})
    end = _.findLastIndex(types, { type: 'text'})
    return {start: start, end: end}

  sectionProps: ->
    return {
      section: @props.section
      sections: @props.sections
      editing: @props.editing
      article: @props.article
      index: @props.index
      ref: 'section'
      setEditing: @setEditing
      channel: @props.channel
      isHero: @props.isHero
      onSetEditing: @props.onSetEditing
      isStartText: @getContentStartEnd().start is @props.index
      isEndText: @getContentStartEnd().end is @props.index
    }

  render: ->
    div {
      className: 'edit-section__container'
      'data-editing': @props.editing
      'data-type': @props.section.get('type')
      'data-layout': @props.section.get('layout') or 'column_width'
    },
      unless @props.section.get('type') is 'fullscreen'
        div {
          className: 'edit-section__hover-controls'
          onClick: @setEditing(on)
        },
          unless @props.isHero
            button {
              className: "edit-section__drag button-reset"
              dangerouslySetInnerHTML: __html: $(icons()).filter('.draggable').html()
            }
          button {
            className: "edit-section__remove button-reset"
            onClick: @removeSection
            dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
          }
      if @props.section.get('type') is 'video'
        React.createElement(
          Video.default, @sectionProps()
        )
      else
        (switch @props.section.get('type')
          when 'text' then Text
          when 'slideshow' then Slideshow
          when 'embed' then Embed
          when 'fullscreen' then Fullscreen
          when 'image_set' then ImageCollection
          when 'image_collection' then ImageCollection
          when 'image' then Image
        )( @sectionProps() )
      div {
        className: 'edit-section__container-bg'
        onClick: @onClickOff
      }
      # TODO - FEATURE HEADER
