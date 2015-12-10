#
# Callout section that only appears between two text sections. It can be used
# to add other articles, or to use as a pull quote
#

_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
AutocompleteSelect = require '../../../../components/autocomplete_select/index.coffee'
{ div, nav, section, label, input, a, h1, textarea, button, form, ul,
  li, img, p, strong, span } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    article: ''
    text: ''
    thumbnail_image: ''
    urlsValue: ''
    loadingArticle: true
    errorMessage: ''

  componentDidMount: ->
    id = @props.section.get('id')
    @fetchArticle id if id
    @props.section.article.on 'add remove', => @forceUpdate()
    @setupAutocomplete()

  componentWillUnmount: ->
    @autocomplete.remove()

  setupAutocomplete: ->
    $el = $(@refs.autocomplete.getDOMNode())
    @autocomplete = new AutocompleteSelect
      url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
      el: $el
      filter: (res) ->
        vals = []
        # for r in res._embedded.results
          # id = r._links.self.href.substr(r._links.self.href.lastIndexOf('/') + 1)
          # vals.push
          #   id: id
          #   value: r.title
          #   thumbnail: r._links.thumbnail.href
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
      cleared: @setState article, ''
    _.defer -> $el.focus()

  onSelect: (e, selected) ->
    new Article(id: selected.id).fetch
      success: (article) =>
        @props.section.article = article
    $(@refs.autocomplete.getDOMNode()).val('').focus()

  onClickOff: ->
    return @props.section.destroy() if @props.section.artworks.length is 0

  # fetchArticle: (id, callback) ->
  #   @props.section.article.fetch id,
  #     error: (m, res) =>
  #       @refs.byUrls.setState(
  #         errorMessage: 'Article not found. Make sure your url is correct.'
  #         loadingArticle: false
  #       ) if res.status is 404
  #     success: (artworks) =>
  #       return unless @isMounted()
  #       @refs.byUrls.setState loading: false, errorMessage: ''
  #       callback?()

  getCalloutType: ->
    if @props.section.article?.get('thumbnail_image')? then 'is-pull-quote' else 'is-article-callout'

  render: ->
    div {
      className: 'edit-section-article-container'
      onClick: @props.setEditing(on)
    },
      div { className: 'esc-controls-container edit-section-controls' },
        section { className: 'esc-input' },
          h1 {}, 'Article (optional)'
          label { className: 'esc-autocomplete-label' }
          div { className: 'esa-autocomplete-input' },
            input {
              ref: 'autocomplete'
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Search for an Article by name'
            }
          h1 {}, 'Text'
          label { className: 'esc-text-label' }
          div { className: 'esc-text-input' },
            input {
              className: 'bordered-input bordered-input-dark'
              placeholder: 'Enter Text Here...'
            }
      (if @props.section.title or @props.section.article
        div { className: 'esc-article-container' },
          img {
            src: @props.section.article?.get('thumbnail_image') or ''
            className: "#{@getCalloutType()}"
          }
        p {}, @props.section.title or @props.section.article.get('thumbnail_title')
        button {
          className: 'edit-section-remove button-reset'
          dangerouslySetInnerHTML: __html: $(icons()).filter('.remove').html()
          onClick: @removeArticle
        }
      else if @state.loadingArticle and not @props.editing
        div { className: 'esc-spinner-container' },
          div { className: 'loading-spinner' }
      else
        div { className: 'esc-empty-placeholder' }, 'Add a Callout Above'
      )
