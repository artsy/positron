#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = React.createFactory require '../section_tool/index.coffee'
{ div } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { editing: false }

  componentDidMount: ->
    @props.section.on 'change', => @forceUpdate()

  setHero: (type) -> (e) =>
    @props.section.set type: type
    @setState editing: true

  onSetEditing: (editing) ->
    console.log 'set editing', editing
    @setState editing: editing

  render: ->
    unless @props.section.keys().length
      SectionTool { sections: @props.sections, hero: true, setHero: @setHero }
    else
      SectionContainer {
        section: @props.section
        editing: @state.editing
        onSetEditing: @onSetEditing
      }
