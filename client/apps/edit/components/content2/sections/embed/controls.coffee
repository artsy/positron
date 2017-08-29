React = require 'react'
SectionControls = React.createFactory require '../../section_controls/index.coffee'
{ div, section, h2, input, a, nav } = React.DOM

module.exports = React.createClass
  displayName: 'EmbedControls'

  componentDidMount: ->
    $(@refs.input).focus() unless @props.section.get('url')?.length

  onChange: (e) ->
    @props.section.set e.target.name, e.target.value

  render: ->
    SectionControls {
      section: @props.section
      channel: @props.channel
      articleLayout: @props.article.get('layout')
      sectionLayouts: true
    },
      div { className: 'input-url' },
        h2 {}, 'iFrame URL'
        input {
          placeholder: 'https://files.artsy.net'
          className: 'bordered-input bordered-input-dark'
          ref: 'url'
          name: 'url'
          defaultValue: @props.section.get('url') || ''
          onChange: @onChange
        },
      div { className: 'input-height' },
        div { className: 'input-height__item' },
          h2 {}, 'Height (optional)'
          input {
            placeholder: '400'
            className: 'bordered-input bordered-input-dark'
            name: 'height'
            defaultValue: @props.section.get('height')
            onChange: @onChange
          }
        div { className: 'input-height__item' },
          h2 {}, 'Mobile Height (optional)'
          input {
            placeholder: '300'
            className: 'bordered-input bordered-input-dark'
            name: 'mobile_height'
            defaultValue: @props.section.get('mobile_height')
            onChange: @onChange
          }
