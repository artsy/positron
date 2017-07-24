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
    section = @props.section
    if @props.isHero or
     (section.get('type') is 'embed' and section.get('layout') is 'overflow')
        width = 1100
    else if section.get('layout')?.includes('overflow') or
     section.get('type') is 'image_set'
      if @props.article?.get('layout') is 'classic'
        width = 940
      else
        width = 820
    else if @props.article?.get('layout') is 'classic'
      width = 620
    else
      width = 720
    width

  getPositionLeft: ->
    if @state.insideComponent
      left = (window.innerWidth / 2) - (@getControlsWidth() / 2) + 55
    else
      left = 0
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
      className: 'edit-section-controls' + if @state.insideComponent then ' sticky' else ''
      ref: 'controls'
      style:
        width: @getControlsWidth()
        position: if @state.insideComponent then 'fixed' else 'absolute'
        bottom: @getPositionBottom()
        left: @getPositionLeft() and @props.article?.get('layout') is 'classic'
    },
      @props.children

