React = require 'react'
{ svg, circle, polygon } = React.DOM

module.exports = React.createClass
	displayName: 'EditTextLinkRemoveIcon'

	render: ->
  	svg {
      xmlns: "http://www.w3.org/2000/svg"
      enableBackground:"new 0 0 1000 1000"
      viewBox:"0 0 1000 1000"
      version: "1.1"
      id:"Layer_1"
      x: "0px"
      y: "0px"
 		},
      polygon {
        fill: "#CCCCCC"
        points:"485.251,550.605 374.762,661.094 308.487,594.819 418.976,484.33 308.487,373.84 374.762,307.565 485.251,418.055 595.741,307.565 662.016,373.84 551.526,484.33 662.016,594.819 595.741,661.094 "
      }
