#
# The section tool that adds new sections between sections or at the bottom
# of the list.
#

React = require 'react'
sd = require('sharify').data
icons = -> require('../../icons.jade') arguments...
{ div, ul, li } = React.DOM
User = require '../../../../../models/user.coffee'
Channel = require '../../../../../models/channel.coffee'

module.exports = React.createClass
  displayName: 'SectionTool'

  getInitialState: ->
    open: false

  componentWillMount: ->
    @user = new User sd.USER
    @channel = new Channel sd.CURRENT_CHANNEL

  toggle: ->
    @setState open: not @state.open

  newSection: (type) -> =>
    switch type
      when 'text'
        @props.sections.add {
          type: 'text'
          body: ''
        }, at: @props.index + 1
      when 'video'
        @props.sections.add {
          type: 'video'
          url: ''
          background_color: ''
          layout: 'column_width'
        }, at: @props.index + 1
      when 'embed'
        @props.sections.add {
          type: 'embed'
          url: ''
          layout: 'column_width'
          height: ''
        }, at: @props.index + 1
      when 'fullscreen'
        @props.sections.add {
          type: 'fullscreen'
          background_url: ''
          title: ''
          intro: ''
        }, at: @props.index + 1
      when 'image_collection'
        @props.sections.add {
          type: 'image_collection'
          layout: 'overflow_fillwidth'
          images: []
        }, at: @props.index + 1
    @setState open: false

  render: ->
    div {
      className: 'edit-tool'
      'data-state-open': @state.open
      'data-editing': @props.isEditing
    },
      div { className: 'edit-tool__container'},
        div {
          className: 'edit-tool__icon'
          onClick: @toggle
          dangerouslySetInnerHTML: __html:
            if @state.open
              $(icons()).filter('.section-tool-close').html()
            else
              $(icons()).filter('.section-tool').html()
        }
        if @props.hero
          ul { className: 'edit-tool__menu' },
            li {
              className: 'edit-section-tool-hero-image'
              onClick: @props.setHero('image')
            }, 'Large Format Image',
              div {
                className: 'edit-menu-icon-hero-image'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.hero-image').html()
              }
            li {
              className: 'edit-section-tool-hero-video'
              onClick: @props.setHero('video')
            }, 'Large Format Video',
              div {
                className: 'edit-menu-icon-hero-video'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.hero-video').html()
              }

        else
          ul { className: 'edit-tool__menu' },
            li {
              className: 'edit-section-tool-text'
              onClick: @newSection('text')
            }, 'Text',
              div {
                className: 'edit-menu-icon-text'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.text').html()
              }
            li {
              className: 'edit-section-tool-image-set'
              onClick: @newSection('image_collection')
            }, 'Images',
              div {
                className: 'edit-menu-icon-image-set'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.artworks').html()
              }
            li {
              className: 'edit-section-tool-video'
              onClick: @newSection('video')
            }, 'Video',
              div {
                className: 'edit-menu-icon-video'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.video').html()
              }
            if @channel.hasFeature 'embed'
              li {
                className: 'edit-section-tool-embed'
                onClick: @newSection('embed')
              }, 'Embed',
                div {
                  className: 'edit-menu-icon-embed'
                  dangerouslySetInnerHTML: __html: $(icons()).filter('.embed').html()
                }
