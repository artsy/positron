#
# Component that renders a table of contents with link that "jump" to
# different parts of the article.
#

_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
{ div, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong, span } = React.DOM

module.exports = React.createClass
  displayName: 'SectionTOC'

  getInitialState: ->
    links: @props.section.get('links')

  render: ->
    div {
      className: 'edit-section-toc-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'es-toc-headline' }, "Table Of Contents"
      ul { className: 'es-toc-list', ref: 'links' },
        (@props.section.get('links').map (link, i) =>
          li { key: i },
            a { href: "##{link.value}", className: 'es-toc-link' }, link.name
        )
