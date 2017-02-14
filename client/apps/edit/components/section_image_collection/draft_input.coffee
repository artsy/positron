React = require 'react'
# Draft = require 'draft-js'
# Draft = require 'draft-js'
# { convertToRaw,
# 	convertFromHTML,
#   CompositeDecorator,
#   ContentState,
#   Editor,
#   EditorState,
#   RichUtils,
#   getVisibleSelectionRect } = require 'draft-js';
# https://github.com/webpack/webpack/issues/1887

{ div, button, p } = React.DOM


module.exports = React.createClass
	displayName: 'DraftInput'

	render: ->
		div {
      className: 'draft-input--caption'
    }, 'hello draft'