React = require 'react'
_ = require 'underscore'
{ header } = React.DOM

module.exports = React.createClass
  displayName: 'SectionControls'

  getInitialState: ->
    insideComponent: false

  componentDidMount: ->
    @setInsideComponent()
    window.addEventListener 'scroll', @setInsideComponent

  componentWillUnmount: ->
    window.removeEventListener 'scroll', @setInsideComponent

  setInsideComponent: ->
    if @insideComponent() != @state.insideComponent
      @setState insideComponent: @insideComponent()

  isImages: ->
    @props.section.get('type') in ['image_set', 'image_collection']

  getHeaderSize: ->
    height = if @props.channel.isEditorial() then 95 else 55
    height

  getControlsWidth: ->
    section = @props.section
    if @props.isHero or
     (section.get('type') is 'embed' and section.get('layout') is 'overflow')
        width = 1100
    else if section.get('layout')?.includes('overflow') or
     section.get('type') is 'image_set'
      width = 900
    else
      width = 620
    width

  getPositionLeft: ->
    if @state.insideComponent
      left = (window.innerWidth / 2) - (@getControlsWidth() / 2) + 55
    else
      left = if @isImages() then -20 else 0
    left

  getPositionBottom: ->
    if @state.insideComponent
      bottom = window.innerHeight - $(@refs.controls).height() - @getHeaderSize()
      if @isImages()
        bottom = bottom - 20
    else
      bottom = if @isImages() then 'calc(100% + 20px)' else '100%'
    bottom

  isScrollingOver: ($section) ->
    window.scrollY + @getHeaderSize() > $section.offset().top - $(@refs.controls).height()

  isScrolledPast: ($section) ->
    window.scrollY + $(@refs.controls).height() > $section.offset().top + $section.height()

  insideComponent: ->
    $section = $(@refs.controls).closest('section')
    insideComponent = false
    if $section
      if @isScrollingOver($section) and !@isScrolledPast($section) or
       @props.isHero and !@isScrolledPast($section)
        insideComponent = true
    insideComponent

  render: ->
    header {
      className: 'edit-section-controls'
      ref: 'controls'
      style:
        width: @getControlsWidth()
        position: if @state.insideComponent then 'fixed' else 'absolute'
        bottom: @getPositionBottom()
        left: @getPositionLeft()
    },
      @props.children

