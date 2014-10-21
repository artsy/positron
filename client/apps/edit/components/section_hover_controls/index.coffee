#
# When hovering over any section you get controls to remove it or add a section
# above and below it.
#

SectionText = require '../section_text/index.coffee'
SectionTool = require '../section_tool/index.coffee'
icons = -> require('./icons.jade') arguments...
React = require 'react'
{ div, button } = React.DOM

module.exports = React.createClass

  deleteSection: ->
    @props.section.destroy()

  render: ->
    div {
      className: 'edit-section-hover-controls'
      onClick: @props.onClick
    },
      button {
        className: 'edit-section-remove button-reset'
        onClick: @deleteSection
        dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
      }