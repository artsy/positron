React = require 'react'
# icons = -> require('./icons.jade') arguments...
{ div } = React.DOM
DraftInputText = React.createFactory require '../../../../components/draft_input/draft_input_text.coffee'

module.exports = React.createClass
  displayName: 'DraftText'

  render: ->
    div { className: 'edit-section-text-container' },
      DraftInputText {
        item: @props.section
      }