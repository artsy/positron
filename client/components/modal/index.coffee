# A simple modal component that manages modal state
# and handles basic styling. For usage in your own
# modal, extend the component like this:
#
# class MyModal extends Modal

_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
{ div, input } = React.DOM

module.exports = Modal = React.createClass
  displayName: 'Modal'

  # getInitialState: ->

  onBackgroundClick: ->
    #

  render: ->
    # div {
    #   className: 'modal-container'
    # },
      # if @props.contentType is 'author'
      #   AuthorEdit {
      #     author: @props.author
      #   }