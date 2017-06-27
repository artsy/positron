React = require 'react'
{ header } = React.DOM

module.exports = React.createClass
  displayName: 'SectionControls'

  componentDidMount: ->
    console.log 'mounted'
    console.log 'size: ' + @refs.controls.offsetWidth

  popLockControls: =>
    $section = @$('.edit-section-container[data-editing=true]')
    return unless $section.length
    $controls = $section.find('.edit-section-controls')
    $controls.css width: $section.outerWidth(), left: ''
    insideComponent = @$window.scrollTop() + @$('#edit-header').outerHeight() >
      ($section.offset().top or 0) - $controls.height()
    if (@$window.scrollTop() + $controls.outerHeight() >
        $section.offset().top + $section.height())
      insideComponent = false
    left = ($controls.outerWidth() / 2) - ($('#layout-sidebar').width() / 2)
    type = $section.data('type')
    unless type is 'fullscreen' or type is 'callout'
      $controls.css(
        width: if insideComponent then $controls.outerWidth() else ''
        left: if insideComponent then "calc(50% - #{left}px)" else ''
      ).attr('data-fixed', insideComponent)

  render: ->
    header {
      className: 'edit-section-controls'
      ref: 'controls'
    },
      @props.children

