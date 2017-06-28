React = require 'react'
_ = require 'underscore'
{ header } = React.DOM

module.exports = React.createClass
  displayName: 'SectionControls'

  getInitialState: ->
    insideComponent: false

  componentDidMount: ->
    @setInside()
    window.addEventListener 'scroll', @setInside

  componentWillUnmount: ->
    window.removeEventListener 'scroll', @setInside

  setInside: ->
    if @insideComponent() != @state.insideComponent
      @setState insideComponent: @insideComponent()

  isImages: ->
    @props.section.get('type') in ['image_set', 'image_collection']

  getHeaderSize: ->
    height = if @props.channel.isEditorial() then 95 else 55
    height

  getControlsWidth: ->
    if @props.section.get('layout')?.includes('overflow') or
     @props.section.get('type') is 'image_set'
      width = 900
    else if @props.section.get('type') is 'embed' or @props.isHero
        width = 1100
    else
      width = 620
    width

  getPositionLeft: ->
    if @state.insideComponent
      left = (window.innerWidth / 2) - (@getControlsWidth() / 2) + 55
    else if @isImages()
      left = -20
    else
      left = 0
    left

  getPositionTop: ->
    if @state.insideComponent
      top = window.innerHeight - $(@refs.controls).height() - @getHeaderSize()
      if @isImages()
        top = top - 20
    else
      top = '100%'
      if @isImages()
        top = 'calc(100% + 20px)'
    top

  insideComponent: ->
    $section = $(@refs.controls).closest('section')
    insideComponent = false
    if $section.offset()
      insideComponent = window.scrollY + @getHeaderSize() >
        $section.offset().top - $(@refs.controls).height()
      if (window.scrollY + $(@refs.controls).height() >
       $section.offset().top + $section.height()) or
       (@props.section.get('type') in ['fullscreen'])
        insideComponent = false
      if @props.isHero
        insideComponent = true
    insideComponent

  render: ->
    header {
      className: 'edit-section-controls'
      ref: 'controls'
      style:
        width: @getControlsWidth()
        position: if @state.insideComponent then 'fixed' else 'absolute'
        bottom: @getPositionTop()
        left: @getPositionLeft()
    },
      @props.children

