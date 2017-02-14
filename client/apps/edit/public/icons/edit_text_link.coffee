React = require 'react'
{ div, button, p, svg } = React.DOM


module.exports = React.createClass
	displayName: 'EditTextLink'

	render: ->
		div {
      className: 'draft-input--caption'
    }, 'put svg here'