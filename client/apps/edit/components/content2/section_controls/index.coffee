React = require 'react'
_ = require 'underscore'
{ header, nav, div, a } = React.DOM
components = require('@artsy/reaction-force/dist/components/publishing/index').default
IconImageFullscreen = React.createFactory components.Icon.ImageFullscreen

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
    section = @props.section
    if @props.isHero
        width = 1100
    else if section.get('layout')?.includes('overflow') or
     section.get('type') is 'image_set'
      width = 900
    else
      width = 620
    width

  getPositionLeft: ->
    if @state.insideComponent
      return (window.innerWidth / 2) - (@getControlsWidth() / 2) + 55
    else
      return if @props.articleLayout is 'classic' then '20px' else 0

  getPositionBottom: ->
    if @state.insideComponent
      return window.innerHeight - $(@refs.controls).height() - @getHeaderSize()
    else
      return '100%'

  isScrollingOver: ($section) ->
    window.scrollY + @getHeaderSize() > $section.offset().top - $(@refs.controls).height()

  isScrolledPast: ($section) ->
    window.scrollY + $(@refs.controls).height() > $section.offset().top + $section.height()

  insideComponent: ->
    $section = $(@refs.controls)?.closest('section')
    insideComponent = false
    if $section
      if @isScrollingOver($section) and !@isScrolledPast($section) or
       @props.isHero and !@isScrolledPast($section)
        insideComponent = true
    insideComponent

  changeLayout: (e) ->
    if @props.section.get('type') is 'image_set'
      @props.section.set 'type', 'image_collection'
      @forceUpdate()
    e = if e.target then e.target.name else e
    @props.section.set layout: e
    @props.onChange() if @props.onChange

  toggleImageSet: ->
    if @props.section.get('type') is 'image_collection'
      @props.section.unset 'layout'
      @props.section.set 'type', 'image_set'
      @forceUpdate()
    @props.onChange() if @props.onChange

  renderSectionLayouts: ->
    nav { className: 'edit-controls__layout' },
      a {
        name: 'overflow_fillwidth'
        className: 'layout'
        onClick: @changeLayout
        'data-active': @props.section.get('layout') is 'overflow_fillwidth'
      }
      a {
        name: 'column_width'
        className: 'layout'
        onClick: @changeLayout
        'data-active': @props.section.get('layout') is 'column_width'
      }
      if @props.articleLayout is 'feature'
        a {
          name: 'fillwidth'
          className: 'layout'
          onClick: @changeLayout
          'data-active': @props.section.get('layout') is 'fillwidth'
        },
          React.createElement(
            IconImageFullscreen, { fill: 'white' }
          )
      if @props.section.get('type') in ['image_set', 'image_collection'] and
       @props.channel.hasFeature 'image_set'
        a {
          name: 'image_set'
          className: 'layout'
          onClick: @toggleImageSet
          'data-active': @props.section.get('type') is 'image_set'
        }

  render: ->
    header {
      className: 'edit-controls' + if @state.insideComponent then ' sticky' else ''
      ref: 'controls'
      style:
        position: if @state.insideComponent then 'fixed' else 'absolute'
        bottom: @getPositionBottom()
        left: @getPositionLeft() if @props.articleLayout is 'classic'
    },
      if @props.sectionLayouts
        @renderSectionLayouts()
      div { className: 'edit-controls__inputs'},
        @props.children
