#
# Callout section that only appears between two text sections. It can be used
# to add other articles, or to use as a pull quote
#

_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
gemup = require 'gemup'
Autocomplete = require '../../../../components/autocomplete/index.coffee'
{ div, section, input, a, h1, h2, button, img, p, strong, span } = React.DOM
{ crop } = require('embedly-view-helpers')(sd.EMBEDLY_KEY)

module.exports = React.createClass

  getInitialState: ->
    article: @props.section.get('article')
    text: ''
    thumbnail_url: ''
    errorMessage: ''
    progress: null
    # articleModel: fetchArticle(@props.section.get('article')) if @props.section.get('article')

  componentDidMount: ->
    @setupAutocomplete()

  fetchArticle: (id)->
    new Article(id: id).fetch
      success: (article) =>
        @state.articleModel = article

  removeCallout: ->
    @props.section.destroy()

  getCalloutType: ->
    if @state.thumbnail_url.length then 'is-article' else 'is-pull-quote'

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
    if @state.article or @state.text or @state.thumbnail_url
      @props.section.set
        article: @state.article
        text: @state.text
        thumbnail_url: @state.thumbnail_url
    else
      @props.section.destroy()

  setText: ->
    @setState text: $(@refs.textInput.getDOMNode()).val()

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
    @setState
      article: selected.id
      text: selected.value
      thumbnail_url: selected.thumbnail

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
      (
        if @state.progress
          div { className: 'upload-progress-container' },
            div {
              className: 'upload-progress'
              style: width: (@state.progress * 100) + '%'
            }
      )
      (if @state.text or @state.article or @state.thumbnail_url
        div { className: "esc-callout-container #{@getCalloutType()}" },
          div { className: 'esc-callout-left'},
            img {
              src: (if @state.thumbnail_url then crop(@state.thumbnail_url, { width: 300, height: 200, quality: 95 }) else '')
            }
          div { className: 'esc-callout-right' },
            p { className: 'esc-title' }, @state.text or @state.article.thumbnail_title or ''
            p { className: 'esc-read-article' }, 'Read Full Article'
      else
        div { className: 'esc-empty-placeholder' }, 'Add a Callout Above'
      )
