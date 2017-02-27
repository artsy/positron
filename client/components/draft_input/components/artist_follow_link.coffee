React = require 'react'
{ a, span } = React.DOM
# icons = -> require('../icons.jade') arguments...

module.exports = React.createClass
  displayName: 'ArtistFollowLink'

  render: ->
    a {
      className: 'is-follow-link'
    }, 'Follow Me!'