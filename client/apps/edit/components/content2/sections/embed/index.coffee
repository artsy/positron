#
# Embed section supports external content via iframes
#

React = require 'react'
Controls = React.createFactory require './controls.coffee'
components = require('@artsy/reaction-force/dist/Components/Publishing/index').default
Embed = React.createFactory components.Embed
{ div, section } = React.DOM

module.exports = React.createClass
  displayName: 'SectionEmbed'

  componentWillMount: ->
    unless @props.section.get 'layout'
      @props.section.set 'layout', 'column_width'

  onClickOff: ->
    return @props.section.destroy() unless @props.section.get('url')?.length

  render: ->
    section {
      className: 'edit-section--embed'
      onClick: @props.setEditing(on)
    },
      if @props.editing
        Controls {
          section: @props.section
          channel: @props.channel
          article: @props.article
        }
      if !@props.section.get('url')?.length
        div { className: 'edit-section--embed__placeholder' }, 'Add URL above'
      else
        div { className: 'edit-section--embed__content' },
          Embed {
            section:
              url: @props.section.get 'url'
              height: @props.section.get 'height'
              mobile_height: @props.section.get 'mobile_height'
              layout: @props.section.get 'layout'
          }
