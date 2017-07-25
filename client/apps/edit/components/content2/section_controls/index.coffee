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

  getHeaderSize: ->
    height = if @props.channel.isEditorial() then 95 else 55
    height

  getControlsWidth: ->
    # used for classic layout only
    sectionType = @props.section.get('type')
    sectionLayout = @props.section.get('layout')
    if @props.isHero or (sectionType is 'embed' and sectionLayout is 'overflow')
      width = 1100
    else if sectionLayout?.includes('overflow') or sectionType is 'image_set'
      width = 940
    else
      width = 620
    width

  getPositionLeft: ->
    left = 0
    if @state.insideComponent
      left = (window.innerWidth / 2) - (@getControlsWidth() / 2) + 55
    left

  getPositionBottom: ->
    isImages = @props.section.get('type') in ['image_set', 'image_collection']
    if @state.insideComponent
      bottom = window.innerHeight - $(@refs.controls).height() - @getHeaderSize()
      if isImages
        bottom = bottom - 20
    else
      bottom = if isImages then 'calc(100% + 20px)' else '100%'
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
      className: 'edit-controls' + if @state.insideComponent then ' sticky' else ''
      ref: 'controls'
      style:
        position: if @state.insideComponent then 'fixed' else 'absolute'
        bottom: @getPositionBottom()
        left: @getPositionLeft() if @props.article?.get('layout') is 'classic'
    },
      @props.children

