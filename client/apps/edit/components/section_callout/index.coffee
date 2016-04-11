#
# Callout section that only appears between two text sections. It can be used
# to add other articles, or to use as a pull quote
#

Backbone = require 'backbone'
_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
gemup = require 'gemup'
Autocomplete = require '../../../../components/autocomplete/index.coffee'
{ div, section, input, a, h1, h2, button, img, p, strong, span } = React.DOM
{ crop } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)
Article = require '../../../../models/article.coffee'

module.exports = React.createClass

  getInitialState: ->
    article: @props.section.get('article') or null
    text: @props.section.get('text') or null
    thumbnail_url: @props.section.get('thumbnail_url') or null
    errorMessage: null
    progress: null
    articleModel: null
    hide_image: @props.section.get('hide_image') or false
    top_stories: @props.section.get('top_stories') or false

  componentDidMount: ->
    @fetchArticle(@props.section.get('article')) if @props.section.get('article')
    @setupAutocomplete()

  fetchArticle: (id) ->
    new Article(id: id).fetch
      success: (article) =>
        @setState articleModel: article

  removeCallout: ->
    @props.section.destroy()

  getCalloutType: ->
    if @state.thumbnail_url or @state.articleModel
      'is-article'
    else
      'is-pull-quote'

  getThumbnail: ->
    if @state.thumbnail_url?
      @state.thumbnail_url
    else if @state.articleModel?
      @state.articleModel.get('thumbnail_image')
    else
      ''

  upload: (e) ->
    @props.setEditing(off)()
    gemup e.target.files[0],
      key: sd.GEMINI_KEY
      progress: (percent) =>
        @setState progress: percent
      add: (src) =>
        @setState progress: 0.1
      done: (src) =>
        image = new Image()
        image.src = src
        image.onload = =>
          @setState thumbnail_url: src, progress: null
          @onClickOff()

  onClickOff: ->
    _.defer =>
      if @state.article or @state.text or @state.thumbnail_url or @state.top_stories
        @props.section.set
          article: @state.article
          text: @state.text
          thumbnail_url: @state.thumbnail_url
          hide_image: @state.hide_image
          top_stories: @state.top_stories
      else
        @props.section.destroy()

  setText: ->
    @setState
      text: $(@refs.textInput.getDOMNode()).val()
    @onClickOff()

  setHideImage: ->
    @setState
      hide_image: $(@refs.checkInput.getDOMNode()).is(':checked')
    @onClickOff()

  setTopStories: ->
    @setState
      top_stories: $(@refs.topStories.getDOMNode()).is(':checked')
    @onClickOff()

  componentWillUnmount: ->
    @autocomplete.remove()

  setupAutocomplete: ->
    $el = $(@refs.autocomplete.getDOMNode())
    @autocomplete = new Autocomplete
      url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
      el: $el
      filter: (res) ->
        vals = []
        for r in res.results
          vals.push
            id: r.id
            value: r.title
            thumbnail: r.thumbnail_image
        return vals
      templates:
        suggestion: (data) ->
          """
            <div class='esc-suggestion' \
                 style='background-image: url(#{data.thumbnail})'>
            </div>
            #{data.value}
          """
      selected: @onSelect
      cleared: @setState article: ''
    _.defer -> $el.focus()

  onSelect: (e, selected) ->
    articleModel = new Article(id: selected.id).fetch
      success: (article) =>
        @setState
          article: selected.id
          articleModel: article
        @onClickOff()
      error: =>
        @setState error: 'Article Not Found'

  render: ->
    div {
      className: 'edit-section-callout-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'esc-controls-container edit-section-controls' },
        section { className: 'esc-inputs' },
          h1 {}, 'Article (optional)'
          div { className: 'esc-autocomplete-input' },
            input {
              ref: 'autocomplete'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Search for an Article by name'
            }
          h1 {}, 'Text'
          div { className: 'esc-text-input' },
            input {
              ref: 'textInput'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Enter Text Here...'
              onBlur: @setText
            }
          h1 {}, 'Thumbnail Image (optional)'
          section { className: 'dashed-file-upload-container' },
            h1 {}, 'Drag & ',
              span { className: 'dashed-file-upload-container-drop' }, 'drop'
              ' or '
              span { className: 'dashed-file-upload-container-click' }, 'click'
              span {}, (' to ' +
                if @props.section.get('thumbnail_url') then 'replace' else 'upload')
            h2 {}, 'Up to 30mb'
            input { type: 'file', onChange: @upload }
          div { className: 'esc-hide-thumbnail' },
            h1 {}, 'Hide Thumbnail?'
            input {
              type: 'checkbox'
              ref: 'checkInput'
              value: @state.hide_image?
              onChange: @setHideImage
            }
          div { className: 'esc-top-stories' },
            h1 {}, 'Top Stories on Artsy'
            input {
              type: 'checkbox'
              ref: 'topStories'
              value: @state.top_stories?
              onChange: @setTopStories
            }
      (
        if @state.progress
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
      )
      (if @state.text or @state.article or @state.articleModel
        div { className: "esc-callout-container #{@getCalloutType()} hidden-image-#{@state.hide_image}" },
          div { className: 'esc-callout-left'},
            img {
              src: (
                if @state.thumbnail_url or @state.articleModel
                  crop(@getThumbnail(), { width: 300, height: 200, quality: 95 })
                else
                  ''
              )
            }
          div { className: 'esc-callout-right' },
            p { className: 'esc-title' }, @state.text or @state.articleModel?.get('thumbnail_title') or ''
            p { className: 'esc-read-article' }, 'Read Full Article'
      else if @state.top_stories
        div { className: 'esc-top-stories' },
            div { className: 'esc-top-stories__headline'}, "Top Stories on Artsy"
            _(3).times ->
              div { className: 'esc-top-stories__container' },
                div { className: 'esc-top-stories__left'}
                div { className: 'esc-top-stories__right' },
                  p { className: 'esc-top-stories__title' }, "Top Stories on Artsy will appear here"
      else
        div { className: 'esc-empty-placeholder' }, 'Add a Callout Above'
      )
