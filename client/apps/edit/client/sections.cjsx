_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
marked = require 'marked'

# Top-level component with a section tool & the various section components

SectionList = React.createClass

  render: ->
    sections = _.map @props.sections, (section, i) ->
      switch section.type
        when 'text' then <TextSection section={section} key={i} />
    <div className='edit-section-list'>
      {sections}
      <SectionTool
        sections={@props.sections}
        onNewSection={@handleNewSection}
      />
    </div>

  handleNewSection: (section) ->
    @forceUpdate()

# The section tool that adds new sections at the bottom of the list

SectionTool = React.createClass

  getInitialState: ->
    { open: false }

  render: ->
    if @state.open
      menu = <ul className='edit-section-tool-menu' >
        <li
          className='edit-section-tool-text'
          onClick={@newTextSection}
        >Text</li>
        <li className='edit-section-tool-artworks' >Artworks</li>
        <li className='edit-section-tool-image' >Image</li>
        <li className='edit-section-tool-video' >Video</li>
      </ul>
    <div className='edit-section-tool' data-state-open={@state.open} >
      <div className='edit-section-tool-icon' onClick={@toggle} ></div>
      {menu}
    </div>

  toggle: ->
    @setState open: not @state.open

  newTextSection: ->
    @props.sections.push { type: 'text', body: '.' }
    @props.onNewSection()

# Text section that can toggle between editing & static mods

TextSection = React.createClass

  getInitialState: ->
    { editing: false }

  render: ->
    <div
      className='edit-section-text-container'
      data-state-editing={@state.editing}
    >
      <div className='edit-section-text-editing' >
        <nav>
          <a>B</a>
          <a>I</a>
          <a>L</a>
        </nav>
        <textarea
          className='invisible-input'
          onKeyUp={@handleEditKeyup}
          defaultValue={@props.section.body}
        ></textarea>
      </div>
      <div
        className='edit-section-text-editing-bg'
        onClick={@toggleEditMode} >
      </div>
      <div
        className='edit-section-text'
        dangerouslySetInnerHTML={__html: marked @props.section.body}
        onClick={@toggleEditMode}
      >
      </div>
    </div>

  toggleEditMode: ->
    console.log 'toggle'
    @setState editing: not @state.editing

  handleEditKeyup: (e) ->
    @props.section.body = e.target.value

@init = ({ sections }) ->
  React.renderComponent <SectionList sections={sections} />, $('#edit-sections')[0]