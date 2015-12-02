#
# The section tool that adds new sections between sections or at the bottom
# of the list.
#

React = require 'react'
sd = require('sharify').data
icons = -> require('./icons.jade') arguments...
{ div, ul, li } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { open: false }

  toggle: ->
    @setState open: not @state.open

  newSection: (type) -> =>
    switch type
      when 'text'
        @props.sections.add {
          type: 'text'
          body: ''
        }, at: @props.index + 1
      when 'artworks'
        @props.sections.add {
          type: 'artworks'
          ids: []
          layout: 'column_width'
        }, at: @props.index + 1
      when 'image'
        @props.sections.add {
          type: 'image'
          url: ''
        }, at: @props.index + 1
      when 'video'
        @props.sections.add {
          type: 'video'
          url: ''
        }, at: @props.index + 1
      when 'slideshow'
        @props.sections.add {
          type: 'slideshow'
          items: []
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
    @setState open: false

  render: ->
    div { className: 'edit-section-tool', 'data-state-open': @state.open },
      div {
        className: 'edit-section-tool-icon'
        onClick: @toggle
        dangerouslySetInnerHTML: __html:
          if @state.open
            $(icons()).filter('.section-tool-close').html()
          else
            $(icons()).filter('.section-tool').html()
      }
      if @props.hero
        ul { className: 'edit-section-tool-menu' },
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
          if sd.USER?.type is 'Admin'
            li {
              className: 'edit-section-tool-hero-fullscreen'
              onClick: @props.setHero('fullscreen')
            }, 'Fullscreen Background',
              div {
                className: 'edit-menu-icon-hero-fullscreen'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.hero-fullscreen').html()
              }
      else
        ul { className: 'edit-section-tool-menu' },
          li {
            className: 'edit-section-tool-text'
            onClick: @newSection('text')
          }, 'Text',
            div {
              className: 'edit-menu-icon-text'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.text').html()
            }
          li {
            className: 'edit-section-tool-artworks'
            onClick: @newSection('artworks')
          }, 'Artworks',
            div {
              className: 'edit-menu-icon-artworks'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.artworks').html()
            }
          li {
            className: 'edit-section-tool-image'
            onClick: @newSection('image')
          }, 'Image',
            div {
              className: 'edit-menu-icon-image'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.image').html()
            }
          li {
            className: 'edit-section-tool-video'
            onClick: @newSection('video')
          }, 'Video',
            div {
              className: 'edit-menu-icon-video'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.video').html()
            }
          li {
            className: 'edit-section-tool-slideshow'
            onClick: @newSection('slideshow')
          }, 'Slideshow',
            div {
              className: 'edit-menu-icon-slideshow'
              dangerouslySetInnerHTML: __html: $(icons()).filter('.slideshow').html()
            }
          if sd.USER?.type is 'Admin'
            li {
              className: 'edit-section-tool-embed'
              onClick: @newSection('embed')
            }, 'Embed',
              div {
                className: 'edit-menu-icon-embed'
                dangerouslySetInnerHTML: __html: $(icons()).filter('.embed').html()
              }
