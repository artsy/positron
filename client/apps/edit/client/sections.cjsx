_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
marked = require 'marked'

SectionTool = React.createClass
  render: ->
    <div className='edit-section-tool'></div>

SectionList = React.createClass
  render: ->
    sections = _.map @props.sections, (section) ->
      if section.type is 'text'
        <TextSection section={section} />
      else
        <div></div>
    <div className='edit-section-list'>
      {sections}
      <SectionTool />
    </div>

TextSection = React.createClass
  render: ->
    <div
      className='edit-section-text'
      dangerouslySetInnerHTML={{__html: marked(@props.section.body)}}
    >
    </div>

@init = ->
  SECTIONS = [
    {
      type: 'text'
      body: 'Were going to begin this post with a little poem...'
    }
    {
      type: 'text'
      body: "Haikus are easy. But sometimes they don't make sense. Refrigerator"
    }
  ]
  React.renderComponent <SectionList sections={SECTIONS} />, $('#edit-sections')[0]