React = require 'react'
ReactDOM = require 'react-dom'
{ div, h1 } = React.DOM
icons = -> require('../../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'DropdownHeader'

  setActiveSection: (e) ->
    if @props.onClick
      @props.onClick(@props.className)

  render: ->
    div {
      className: 'dropdown-header ' + @props.className
      onClick: @setActiveSection
    },
      h1 {}, @props.section
      div {
        dangerouslySetInnerHTML: __html: $(icons()).filter('.caret').html()
      }