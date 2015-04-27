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
    @props.section.on 'change destroy clear', => @forceUpdate()

  setHero: (type) -> (e) =>
    @props.section.set type: type
    @setState editing: true

  onSetEditing: ->
    @props.section.clear() unless @props.section.get('url')
    @setState editing: not @state.editing

  render: ->
    console.log @props.section.isEmpty?()
    if not @props.section? or @props.section.isEmpty?()
      SectionTool { sections: @props.sections, hero: true, setHero: @setHero }
    else
      SectionContainer {
        sections: @props.sections
        section: @props.section
        editing: @state.editing
        onSetEditing: @onSetEditing
      }
